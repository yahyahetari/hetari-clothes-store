import { connectToDB } from "@/lib/mongoose";
import { Product } from "@/models/Products";
const stripe = require('stripe')(process.env.STRIPE_SK);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send({ error: 'Method not allowed' });
    }

    try {
        await connectToDB();

        const { firstName, lastName, email, phone, address, address2, state, city, country, postalCode, cartItems } = req.body;

        if (!firstName || !lastName || !email || !phone || !address || !city || !country || !postalCode || !cartItems) {
            return res.status(400).send({ error: 'Missing required fields', receivedData: req.body });
        }

        let cartItemsArray;
        try {
            cartItemsArray = JSON.parse(cartItems);
        } catch (error) {
            return res.status(400).send({ error: 'Invalid cartItems format', receivedCartItems: cartItems });
        }

        const uniqueIds = [...new Set(cartItemsArray.map(item => item.id))];
        const productsData = await Product.find({ _id: { $in: uniqueIds } });

        if (productsData.length !== uniqueIds.length) {
            return res.status(400).send({ error: 'Some products not found', foundProducts: productsData.length, requestedProducts: uniqueIds.length });
        }

        let line_items = [];
        for (const cartItem of cartItemsArray) {
            const productInfo = productsData.find(product => product._id.toString() === cartItem.id);
            if (productInfo) {
                let name = productInfo.title;
                let description = '';
                if (cartItem.properties) {
                    description = Object.entries(cartItem.properties)
                        .map(([key, value]) => `${key} : ${value}`)
                        .join(', ');
                }
                line_items.push({
                    quantity: cartItem.quantity,
                    price_data: {
                        currency: 'USD',
                        product_data: {
                            name,
                            description
                        },
                        unit_amount: Math.round(productInfo.price * 100),
                    }
                });
            } else {
                return res.status(400).send({ error: 'Product not found', productId: cartItem.id });
            }
        }

        const session = await stripe.checkout.sessions.create({
            line_items,
            mode: 'payment',
            customer_email: email,
            success_url: `${process.env.PUBLIC_STORE_URL}/paysuccess`,
            cancel_url: `${process.env.PUBLIC_STORE_URL}/cart`,
            metadata: {
                firstName,
                lastName,
                email,
                phone,
                address,
                address2,
                state,
                city,
                country,
                postalCode,
                cartItems: JSON.stringify(cartItemsArray)
            },
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
