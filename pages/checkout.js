import { CartContext } from "@/components/CartContext";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import Loader from "@/components/Loader";
import { useSession } from "next-auth/react";
import Auth from "@/components/Auth";

export default function Checkout() {
    const { cart } = useContext(CartContext);
    const [products, setProducts] = useState([]);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [address2, setAddress2] = useState('');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const { data: session } = useSession();

    useEffect(() => {
        // Fetch shipping information from API
        axios.get('/api/shipping')
            .then(response => {
                const shippingInfo = response.data;
                setFirstName(shippingInfo.firstName || '');
                setLastName(shippingInfo.lastName || '');
                setPhone(shippingInfo.phone || '');
                setAddress(shippingInfo.address || '');
                setAddress2(shippingInfo.address2 || '');
                setState(shippingInfo.state || '');
                setCity(shippingInfo.city || '');
                setCountry(shippingInfo.country || '');
                setPostalCode(shippingInfo.postalCode || '');
            })
            .catch(error => {
                console.error("Error fetching shipping data:", error);
            });

        // Set email from session if available
        if (session?.user?.email) {
            setEmail(session.user.email);
        }

        if (cart.length > 0) {
            const cartItems = cart.map(item => ({
                id: item.id,
                properties: item.properties,
            }));
            console.log('Sending cart items:', cartItems);
            axios.post('/api/cart', { items: cartItems })
                .then(response => {
                    console.log('Received response:', response.data);
                    const groupedProducts = groupProductsByProperties(response.data, cart);
                    setProducts(groupedProducts);
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Error fetching cart data:", error.response?.data || error.message);
                    setLoading(false);
                });
        } else {
            setProducts([]);
            setLoading(false);
        }
    }, [cart, session]);

    function groupProductsByProperties(products, cart) {
        const groupedProducts = {};
        cart.forEach(cartItem => {
            const product = products.find(p => p._id === cartItem.id);
            if (product) {
                const key = `${product._id}-${JSON.stringify(cartItem.properties)}`;
                if (groupedProducts[key]) {
                    groupedProducts[key].quantity += 1;
                } else {
                    groupedProducts[key] = {
                        ...product,
                        properties: cartItem.properties,
                        quantity: 1
                    };
                }
            }
        });
        return Object.values(groupedProducts);
    }

    function validateFields() {
        const newErrors = {};
        if (!firstName) newErrors.firstName = "First Name is required";
        if (!lastName) newErrors.lastName = "Last Name is required";
        if (!email) newErrors.email = "Email is required";
        if (!phone) newErrors.phone = "Phone Number is required";
        if (!address) newErrors.address = "Address is required";
        if (!city) newErrors.city = "City is required";
        if (!country) newErrors.country = "Country is required";
        if (!postalCode) newErrors.postalCode = "Postal Code is required";
        return newErrors;
    }

    async function goToPayment() {
        const validationErrors = validateFields();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const total = products.reduce((acc, product) => {
            const quantity = product.quantity || cartQuantities[product._id] || 0;
            return acc + (product.price * quantity);
        }, 0);

        try {
            const response = await axios.post('/api/checkout', {
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
                cartItems: JSON.stringify(products.map(product => ({
                    id: product._id,
                    quantity: product.quantity,
                    properties: product.properties
                })))
            });

            if (response.data.url) {
                window.location = response.data.url;
            }
        } catch (error) {
            console.error("Error during checkout:", error.response?.data || error.message);
            if (error.response?.data?.error === 'An error occurred during checkout. Please try again.') {
                alert("An error occurred during checkout. Please try again.");
            } else {
                alert("The maximum allowed limit is 5 fields in the order information");
            }
        }
    }

    const cartQuantities = cart.reduce((acc, item) => {
        acc[item.id] = (acc[item.id] || 0) + 1;
        return acc;
    }, {});

    const total = products.reduce((acc, product) => {
        const quantity = product.quantity || cartQuantities[product._id] || 0;
        return acc + (product.price * quantity);
    }, 0);

    const totalRounded = parseFloat(total.toFixed(2));

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader />
            </div>
        );
    }

    return (
        <div>
            <Auth>
                <div className="flex flex-col lg:flex-row justify-between lg:space-x-4 mt-6 px-3 mb-5">
                    {!!cart?.length && (
                        <div className="lg:w-2/3 flex flex-col h-fit items-center border-2 border-black p-5 rounded-lg">
                            <h1 className=" text-xl font-semibold">Shipping Information</h1>
                            <div className="flex flex-col md:flex-row mt-4 gap-4 w-full">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className={` p-2 border w-full rounded ${errors.firstName ? 'border-red-500' : 'border-gray-400'}`}
                                        placeholder="First Name"
                                    />
                                    {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className={` p-2 border w-full rounded ${errors.lastName ? 'border-red-500' : 'border-gray-400'}`}
                                        placeholder="Last Name"
                                    />
                                    {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row mt-4 gap-4 w-full">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        name="email"
                                        value={email}
                                        readOnly
                                        className={` p-2 border w-full rounded ${errors.email ? 'border-red-500' : 'border-gray-400'}`}
                                        placeholder="E-Mail"
                                    />
                                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        name="phone"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className={` p-2 border w-full rounded ${errors.phone ? 'border-red-500' : 'border-gray-400'}`}
                                        placeholder="Phone Number"
                                    />
                                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row mt-4 gap-4 w-full">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        name="address"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className={` p-2 border w-full rounded ${errors.address ? 'border-red-500' : 'border-gray-400'}`}
                                        placeholder="Address"
                                    />
                                    {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        name="address2"
                                        value={address2}
                                        onChange={(e) => setAddress2(e.target.value)}
                                        className=" p-2 border w-full border-gray-400 rounded"
                                        placeholder="Address2"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row mt-4 gap-4 w-full">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        name="state"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        className=" p-2 mt-1 border w-full border-gray-400 rounded"
                                        placeholder="State"
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        name="city"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className={` p-2 mt-1 border w-full rounded ${errors.city ? 'border-red-500' : 'border-gray-400'}`}
                                        placeholder="City"
                                    />
                                    {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row mt-4 gap-4 w-full">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        name="country"
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        className={` p-2 mt-1 border w-full rounded ${errors.country ? 'border-red-500' : 'border-gray-400'}`}
                                        placeholder="Country"
                                    />
                                    {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        name="postalCode"
                                        value={postalCode}
                                        onChange={(e) => setPostalCode(e.target.value)}
                                        className={` p-2 mt-1 border w-full rounded ${errors.postalCode ? 'border-red-500' : 'border-gray-400'}`}
                                        placeholder="Postal Code"
                                    />
                                    {errors.postalCode && <p className="text-red-500 text-sm">{errors.postalCode}</p>}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="lg:w-1/3 w-full mb-5 text-center border-2 border-black mt-7 lg:mt-0 flex flex-col gap-8 bg-grey-2 rounded-lg px-4 py-5">
                        <h2 className="text-xl font-semibold">Order Information</h2>
                        {!cart?.length && (
                            <p className="text-left">Cart is empty</p>
                        )}
                        {products?.length > 0 && (() => {
                            // جمع جميع الخصائص الممكنة من جميع المنتجات
                            const allProperties = products.reduce((acc, product) => {
                                Object.keys(product.properties || {}).forEach(key => {
                                    if (!acc.includes(key)) {
                                        acc.push(key);
                                    }
                                });
                                return acc;
                            }, []);

                            return (
                                <table className="w-full">
                                    <thead>
                                        <tr>
                                            <th className="border border-gray-200 p-2">Product</th>
                                            <th className="border border-gray-200 p-2">Price</th>
                                            {allProperties.map(prop => (
                                                <th key={prop} className="border border-gray-200 p-2">{prop}</th>
                                            ))}
                                            <th className="border border-gray-200 p-2">Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map(product => {
                                            const totalPrice = (product.price * product.quantity).toFixed(2);

                                            return (
                                                <tr key={product._id} className="border border-gray-200 ">
                                                    <td className="border border-gray-200 p-2">{product.title}</td>
                                                    <td className="border border-gray-200 p-2">${totalPrice}</td>
                                                    {allProperties.map(prop => (
                                                        <td key={prop} className="border border-gray-200 p-2">
                                                            {product.properties?.[prop] || ''}
                                                        </td>
                                                    ))}
                                                    <td className="border border-gray-200 p-2">{product.quantity}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            );
                        })()}


                        <div className="flex justify-between items-center ">
                            <span className="font-bold"> TOTAL </span>
                            <span className="font-bold text-xl ">$ {totalRounded}</span>
                        </div>
                        <button
                            onClick={goToPayment}
                            className="bg-black font-medium text-xl text-white rounded-lg mt-3 py-2 px-4"
                        >
                            Continue To Payment
                        </button>
                    </div>
                </div>
            </Auth>
        </div>
    );
}
