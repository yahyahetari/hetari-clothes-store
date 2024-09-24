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

    // Fetch the product first to get its name
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the user has purchased this specific product
    const userOrder = await Order.findOne({
      email: session.user.email,
      'line_items': {
        $elemMatch: {
          'price_data.product_data.name': product.title // Assuming 'title' is the field name in your Product model
        }
      }
    });

    if (!userOrder) {
      return res.status(403).json({ message: 'You must purchase this product before rating it' });
    }

    // Check if the user has already rated this product
    const existingRatingIndex = product.ratings.findIndex(r => r.user.email === session.user.email);

    if (existingRatingIndex !== -1) {
      // Update existing rating
      product.ratings[existingRatingIndex] = {
        ...rating,
        user: {
          name: session.user.name,
          email: session.user.email,
          image: session.user.image
        }
      };
    } else {
      // Add new rating
      product.ratings.push({
        ...rating,
        user: {
          name: session.user.name,
          email: session.user.email,
          image: session.user.image
        }
      });
    }

    await product.save();

    res.status(200).json({ 
      message: existingRatingIndex !== -1 ? 'Rating updated successfully' : 'Rating added successfully',
      updatedRatings: product.ratings
    });
  } catch (error) {
    console.error('Error adding/updating rating:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
