import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { useSession, signOut } from "next-auth/react";
import { FaSearch, FaChevronLeft, FaChevronRight, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe, FaEdit } from 'react-icons/fa';
import Loader from "@/components/Loader";

export default function Account() {
    const [shippingInfo, setShippingInfo] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;
    const router = useRouter();
    const { data: session } = useSession();

    useEffect(() => {
        const fetchData = async () => {
            if (session) {
                try {
                    const [shippingResponse, ordersResponse] = await Promise.all([
                        axios.get('/api/shipping'),
                        axios.get('/api/orders')
                    ]);
                    setShippingInfo(shippingResponse.data);
                    setOrders(ordersResponse.data);
                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);

        return () => clearInterval(interval);
    }, [session]);

    useEffect(() => {
        const savedPage = parseInt(localStorage.getItem('currentPage'), 10);
        if (savedPage) {
            setCurrentPage(savedPage);
        }
    }, []);

    const handleSignOut = async () => {
        try {
            // حذف المستخدم
            const response = await fetch("/api/deleteUser", {
                method: "DELETE",
            });

            if (response.ok) {
                // إذا تم حذف المستخدم بنجاح، قم بتسجيل الخروج
                await signOut({ callbackUrl: "/" });
            } else {
                console.error("Failed to delete user");
                // يمكنك إضافة معالجة الأخطاء هنا
            }
        } catch (error) {
            console.error("Error during sign out:", error);
            // يمكنك إضافة معالجة الأخطاء هنا
        }
    };

    const handleOrderClick = (orderId) => {
        localStorage.setItem('currentPage', currentPage);
        router.push(`/order/${orderId}`);
    };

    const calculateTotal = (lineItems) => {
        return lineItems.reduce((total, item) => {
            const unitAmount = item.price_data?.unit_amount || item.unit_amount || 0;
            const quantity = item.quantity || 1;
            return total + (unitAmount * quantity) / 100;
        }, 0);
    };

    const filteredOrders = orders.filter(order =>
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${order.firstName} ${order.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).includes(searchTerm)
    );

    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader />
            </div>
        );
    }
    return (
        <div className="bg-gray-100 min-h-screen">
            <nav className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Your Account</h1>
                    <div className="flex items-center space-x-4">
                        <button onClick={handleSignOut} className="block w-full text-left text-lg bg-slate-200 rounded-3xl px-4 py-2 hover:text-red-700 hover:bg-gray-100">Sign Out</button>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-4 py-8">
                <div className="md:flex md:space-x-8">
                    {/* Shipping Information */}
                    <div className="md:w-1/3">
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold">Shipping Information</h2>
                            </div>
                            {shippingInfo ? (
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <FaUser className="mr-2 text-blue-500" />
                                        <span>{shippingInfo.firstName} {shippingInfo.lastName}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <FaEnvelope className="mr-2 text-blue-500" />
                                        <span>{shippingInfo.email}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <FaPhone className="mr-2 text-blue-500" />
                                        <span>{shippingInfo.phone}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <FaMapMarkerAlt className="mr-2 text-blue-500" />
                                        <span>{shippingInfo.address}, {shippingInfo.city}, {shippingInfo.state} {shippingInfo.postalCode}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <FaGlobe className="mr-2 text-blue-500" />
                                        <span>{shippingInfo.country}</span>
                                    </div>
                                </div>
                            ) : (
                                <p>No shipping information available.</p>
                            )}
                        </div>
                    </div>

                    {/* Orders Section */}
                    <div className="md:w-2/3">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-semibold mb-4">Your Orders</h2>
                            <div className="mb-4 flex items-center space-x-4">
                                <div className="relative flex-grow">
                                    <input
                                        type="text"
                                        placeholder="Search Orders..."
                                        className="w-full p-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                </div>

                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full table-auto">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total ($)</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {currentOrders.map(order => (
                                            <tr key={order._id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <a
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleOrderClick(order._id);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        {order._id}
                                                    </a>
                                                </td>
                                                <td className="px-6 py-4 text-center whitespace-nowrap">{order.line_items.reduce((total, item) => total + item.quantity, 0)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">${calculateTotal(order.line_items).toFixed(2)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </td>

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-between items-center mt-4">
                                <button
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 1}
                                    className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                    <FaChevronLeft className="mr-2" />
                                    <span className="hidden sm:inline">Previous</span> {/* Hide on small screens */}
                                </button>

                                <div className="flex items-center space-x-2">
                                    {[...Array(totalPages).keys()].map(number => (
                                        <button
                                            key={number}
                                            onClick={() => setCurrentPage(number + 1)}
                                            className={`px-3 py-1 rounded-md ${currentPage === number + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                                        >
                                            {number + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                    <span className="hidden sm:inline">Next</span> {/* Hide on small screens */}
                                    <FaChevronRight className="ml-2" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
