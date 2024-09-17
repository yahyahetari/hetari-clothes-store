// pages/api/shipping.js
import { connectToDB } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      await connectToDB();

      // البحث عن آخر طلب للمستخدم الحالي
      const lastOrder = await Order.findOne({ email: session.user.email }).sort({ createdAt: -1 });

      if (lastOrder) {
        // إرجاع معلومات الشحن من آخر طلب
        const shippingInfo = {
          firstName: lastOrder.firstName,
          lastName: lastOrder.lastName,
          email: lastOrder.email,
          phone: lastOrder.phone,
          address: lastOrder.address,
          address2: lastOrder.address2,
          state: lastOrder.state,
          city: lastOrder.city,
          country: lastOrder.country,
          postalCode: lastOrder.postalCode,
        };
        res.status(200).json(shippingInfo);
      } else {
        // إذا لم يكن هناك طلبات سابقة، أرجع كائنًا فارغًا
        res.status(200).json({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          address2: '',
          state: '',
          city: '',
          country: '',
          postalCode: '',
        });
      }
    } catch (error) {
      console.error('Error fetching shipping data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
