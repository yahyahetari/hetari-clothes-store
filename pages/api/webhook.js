import { connectToDB } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import { Product } from "@/models/Products";
import { buffer } from "micro";
const stripe = require('stripe')(process.env.STRIPE_SK);
const endpoint_secret = process.env.STRIPE_EP;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        await connectToDB();

        const sig = req.headers['stripe-signature'];
        let event;
        
        try {
            event = stripe.webhooks.constructEvent(await buffer(req), sig, endpoint_secret);
        } catch (err) {
            console.error(`Webhook Error: ${err.message}`);
            return res.status(400).json({ error: `Webhook Error: ${err.message}` });
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const metadata = session.metadata;
            const paid = session.payment_status === 'paid';

            if (paid) {
                try {
                    const cartItemsArray = JSON.parse(metadata.cartItems);
                    const uniqueIds = [...new Set(cartItemsArray.map(item => item.id))];
                    const productsData = await Product.find({ _id: { $in: uniqueIds } });

                    let line_items = cartItemsArray.map(cartItem => {
                        const productInfo = productsData.find(product => product._id.toString() === cartItem.id);
                        if (productInfo) {
                            let name = productInfo.title;
                            let description = '';
                            if (cartItem.properties) {
                                description = Object.entries(cartItem.properties)
                                    .map(([key , value]) => `${key} : ${value}`)
                                    .join(' , ');
                            }
                            return {
                                quantity: cartItem.quantity,
                                price_data: {
                                    currency: 'USD',
                                    product_data: { 
                                        name,
                                        description
                                    },
                                    unit_amount: Math.round(productInfo.price * 100),
                                }
                            };
                        }
                        return null;
                    }).filter(item => item !== null);
                
                    const orderDoc = await Order.create({
                        line_items,
                        firstName: metadata.firstName,
                        lastName: metadata.lastName,
                        email: metadata.email,
                        phone: metadata.phone,
                        address: metadata.address,
                        address2: metadata.address2 || '',
                        state: metadata.state || '',
                        city: metadata.city,
                        country: metadata.country,
                        postalCode: metadata.postalCode,
                        paid: true,
                    });
                    console.log(`Order ${orderDoc._id} created and marked as paid`);
                } catch (err) {
                    console.error(`Error creating order:`, err);
                    return res.status(500).json({ error: 'Error creating order' });
                }
            }
        }
        
        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const config = {
    api: { bodyParser: false }
};
