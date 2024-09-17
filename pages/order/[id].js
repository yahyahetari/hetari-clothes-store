import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { Box, Package, Calendar, ArrowLeft } from "lucide-react";
import Loader from "@/components/Loader";

export default function Order() {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        const fetchOrder = async () => {
            if (id) {
                try {
                    const response = await axios.get(`/api/orders/${id}`);
                    setOrder(response.data);
                } catch (error) {
                    setError(error.message || "An error occurred while fetching the order.");
                } finally {
                    setLoading(false);
                }
            }
        };
        
        fetchOrder();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 bg-gray-100">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-8 bg-gray-100">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded" role="alert">
                    <p className="font-bold">Order not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-800">Order Details</h1>
                
                <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4">
                        <div className="flex justify-between items-center">
                            <span className="text-lg flex items-center">
                                <Calendar className="mr-2" size={20} />
                                {order.createdAt.replace('T', ' / ').substring(0, 21)}
                            </span>
                        </div>
                    </div>
                    
                    <div className="p-2">
                        <table className="w-full text-center">
                            <thead>
                                <tr>
                                    <th className="border border-gray-200 p-2">Product</th>
                                    <th className="border border-gray-200 p-2">Properties</th>
                                    <th className="border border-gray-200 p-2">Qty</th>
                                    <th className="border border-gray-200 p-2">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.line_items && order.line_items.map((item, index) => (
                                    <tr key={index} className="border border-gray-200">
                                        <td className="border border-gray-200 p-1">
                                            <div className="flex items-center">
                                                <p className="font-semibold text-gray-800 text-base">{item.price_data?.product_data?.name}</p>
                                            </div>
                                        </td>
                                        <td className="border border-gray-200 p-2">
                                            <p className="text-gray-600">{item.price_data?.product_data?.description}</p>
                                        </td>
                                        <td className="border border-gray-200 p-2">
                                            <p className="text-gray-600">{item.quantity}</p>
                                        </td>
                                        <td className="border border-gray-200 p-2">
                                            <p className="font-semibold text-gray-800">${(item.price_data.unit_amount * item.quantity / 100).toFixed(2)} </p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-6 text-right">
                            <p className="text-2xl font-bold text-gray-800">Total: ${order.line_items.reduce((total, item) => total + (item.price_data.unit_amount * item.quantity / 100), 0).toFixed(2)}</p>
                        </div>
                    </div>
                    
                    <div className="mt-6 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded">
                        <p className="font-bold">Estimated Delivery Time</p>
                        <p>Your order is expected to arrive within 7-10 days from the order date.</p>
                    </div>
                </div>
                
                <button 
                    onClick={() => router.push('/account')} 
                    className="mt-8 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full hover:from-blue-600 hover:to-purple-700 transition duration-300 ease-in-out flex items-center justify-center text-lg font-semibold"
                >
                    <ArrowLeft className="mr-2" size={20} />
                    Back to Orders
                </button>
            </div>
        </div>
    );
}
