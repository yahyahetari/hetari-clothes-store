import { connectToDB } from "@/lib/mongoose";
import { Product } from "@/models/Products";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await connectToDB();

    const { productId, rating } = req.body;

    // Check if the user has purchased any product using email only
    const hasPurchased = await Order.exists({
      email: session.user.email
    });

    if (!hasPurchased) {
      return res.status(403).json({ message: 'You must purchase a product before rating' });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.ratings.push({
      ...rating,
      user: session.user.email,
      userName: session.user.name,
      userImage: session.user.image,
    });
    await product.save();

    res.status(200).json({ 
      message: 'Rating added successfully',
      updatedRatings: product.ratings
    });
  } catch (error) {
    console.error('Error adding rating:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
