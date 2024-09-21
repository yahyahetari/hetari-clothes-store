import { CartContext } from "@/components/CartContext";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { MinusCircle, PlusCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import Loader from "@/components/Loader";
import Link from "next/link";

export default function Cart() {
    const router = useRouter();
    const { cart, addToCart, setCart, removeFromCart } = useContext(CartContext);
    const [products, setProducts] = useState([]);
    const [productToDelete, setProductToDelete] = useState(null);
    const [loading, setLoading] = useState(true);

    const total = products.reduce(
        (acc, product) => acc + product.price * product.quantity,
        0
    );
    const totalRounded = parseFloat(total.toFixed(2));

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedCart = localStorage.getItem("cart");
            if (storedCart) {
                setCart(JSON.parse(storedCart));
            }
        }

        const timer = setTimeout(() => {
            setLoading(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, [setCart]);

    useEffect(() => {
        let timer;
        if (cart.length > 0) {
            axios.post('/api/cart', { items: cart }).then((response) => {
                const groupedProducts = groupProductsByProperties(response.data);
                setProducts(groupedProducts);
                timer = setTimeout(() => {
                    setLoading(false);
                }, 5000);
            });
        } else {
            setProducts([]);
            timer = setTimeout(() => {
                setLoading(false);
            }, 5000);
        }

        return () => clearTimeout(timer);
    }, [cart]);

    function groupProductsByProperties(products) {
        const groupedProducts = [];
        cart.forEach(cartItem => {
            const product = products.find(p => p._id === cartItem.id);
            if (product) {
                const existingProduct = groupedProducts.find(
                    p => p._id === product._id && JSON.stringify(p.properties) === JSON.stringify(cartItem.properties)
                );
                if (existingProduct) {
                    existingProduct.quantity += 1;
                } else {
                    groupedProducts.push({
                        ...product,
                        properties: cartItem.properties,
                        quantity: 1
                    });
                }
            }
        });
        return groupedProducts;
    }

    function increaseQuantity(id, properties) {
        addToCart(id, properties);
        updateLocalStorage([...cart, { id, properties }]);
    }

    function decreaseQuantity(id, properties) {
        const product = products.find(p => p._id === id && JSON.stringify(p.properties) === JSON.stringify(properties));
        if (product && product.quantity === 1) {
            setProductToDelete(product);
        } else {
            const updatedCart = [...cart];
            const index = updatedCart.findIndex(item => item.id === id && JSON.stringify(item.properties) === JSON.stringify(properties));
            if (index !== -1) {
                updatedCart.splice(index, 1);
                setCart(updatedCart);
                updateLocalStorage(updatedCart);
            }
        }
    }

    function confirmDeleteProduct() {
        if (productToDelete) {
            const updatedCart = cart.filter(item => !(item.id === productToDelete._id && JSON.stringify(item.properties) === JSON.stringify(productToDelete.properties)));
            setCart(updatedCart);
            updateLocalStorage(updatedCart);
            setProductToDelete(null);
        }
    }

    function cancelDelete() {
        setProductToDelete(null);
    }

    function updateLocalStorage(newCart) {
        if (typeof window !== "undefined") {
            localStorage.setItem("cart", JSON.stringify(newCart));
        }
    }

    const handleCheckout = () => {
        router.push('/checkout');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader />
            </div>
        );
    }

    return (
        <div className="flex gap-20 py-16 px-10 max-lg:flex-col max-sm:px-3">
            <div className="w-2/3 max-lg:w-full">
                <p className="mb-4 text-xl font-semibold">Shopping Cart</p>
                <hr className="my-6" />
                {!products.length ? (
                    <div className="text-center">
                        <p className="mb-4 text-xl font-semibold">Your cart is empty</p>
                        <Link href="/shop" className="inline-block mt-4 px-6 py-2 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors duration-300">
                            Go to Shop
                        </Link>
                    </div>) : (
                    <div>
                        {products.map((product, index) => (
                            <div key={`${product._id}-${index}`} className="w-full flex max-sm:flex-col border border-gray-400 rounded-lg max-sm:gap-3 hover:bg-grey-2 px-4 py-3 mt-2 items-center max-sm:items-start justify-between">
                                <div className="flex items-center">
                                    <Link href={`/product/${product.slug}`}>
                                        <Image
                                            src={product.images[0]}
                                            width={100}
                                            height={100}
                                            className="rounded-lg w-32 h-32 object-cover object-top cursor-pointer"
                                            alt={product.title}
                                        />
                                    </Link>
                                    <div className="flex flex-col gap-4 ml-4">
                                        <Link href={`/product/${product.slug}`}>
                                            <p className="font-bold cursor-pointer hover:underline">{product.title}</p>
                                        </Link>
                                        {product.properties && Object.entries(product.properties).map(([key, value]) => (
                                            <p key={key} className="text-sm">
                                                <span className="font-semibold">{key} :</span> {Array.isArray(value) ? value.join(', ') : value}
                                            </p>
                                        ))}
                                        <p className="font-medium">$ {product.price * product.quantity}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <MinusCircle
                                        className="hover:text-red-700 ml-3 cursor-pointer"
                                        onClick={() => decreaseQuantity(product._id, product.properties)}
                                    />
                                    <span className="text-lg font-medium">{product.quantity}</span>
                                    <PlusCircle
                                        className="hover:text-red-700 mr-9 cursor-pointer"
                                        onClick={() => increaseQuantity(product._id, product.properties)}
                                    />
                                    <Trash2
                                        className="text-red-700  ml-9 mr-4 cursor-pointer max-sm:absolute max-sm:right-3"
                                        onClick={() => setProductToDelete(product)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="w-1/3 max-lg:w-full h-fit flex flex-col gap-8 bg rounded-lg px-4 py-5">
                <p className="font-bold text-xl pb-4">
                    Summary{" "}
                    <span>
                        {`( ${products.length} ${products.length > 1 ? "items" : "item"} )`}
                    </span>
                </p>
                <div className="flex justify-between items-center">
                    <span className="font-bold">Total Amount </span>
                    <span className="font-bold text-xl">$ {totalRounded}</span>
                </div>
                <button
                    className="w-full bg-white font-bold text-xl hover:text-white hover:bg-black text-heading3-bold py-4 rounded-lg hover:bg-red-2 transition-all duration-300"
                    onClick={handleCheckout}
                >
                    Checkout
                </button>
            </div>

            {productToDelete && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-75">
                    <div className="max-w-sm p-6 bg-white bg-opacity-30 backdrop-blur-md border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 dark:bg-gray-800 dark:border-gray-700">
                        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-950 dark:text-white">Delete Product</h5>
                        <p className="mb-4 text-gray-200">
                            Are you sure you want to delete <span className="text-gray-950 font-semibold text-2xl">({productToDelete.title})</span>? This action cannot be undone.
                        </p>
                        <div className="flex justify-between">
                            <button className="btn-red" onClick={confirmDeleteProduct}>Delete</button>
                            <button className="btn-default" onClick={cancelDelete}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
