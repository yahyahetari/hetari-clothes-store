import { connectToDB } from "@/lib/mongoose";
import { Product } from "@/models/Products";
import mongoose from 'mongoose';

export default async function handle(req, res) {
  console.log('Received request:', req.body);
  try {
    await connectToDB();
    console.log('Connected to DB');

    if (!req.body.items || !Array.isArray(req.body.items)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const cartItems = req.body.items;
    console.log('Cart items:', cartItems);

    const productIds = cartItems.map(item => item.id).filter(id => mongoose.Types.ObjectId.isValid(id));
    console.log('Valid Product IDs:', productIds);

    if (productIds.length === 0) {
      return res.status(400).json({ error: 'No valid product IDs provided' });
    }

    const products = await Product.find({_id: {$in: productIds}});
    console.log('Found products:', products);

    // Add selected properties and quantity to each product
    const productsWithPropertiesAndQuantity = products.map(product => {
      const cartItem = cartItems.find(item => item.id === product._id.toString());
      return {
        ...product._doc,
        selectedProperties: cartItem ? cartItem.properties : {},
        quantity: cartItem ? cartItem.quantity : 0 // Add quantity here
      };
    });

    res.json(productsWithPropertiesAndQuantity);
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message, stack: error.stack });
  }
}
