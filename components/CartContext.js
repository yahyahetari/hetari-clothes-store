import { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

export const CartContext = createContext({});

export function CartContextProvider({ children }) {
    const [cart, setCart] = useState([]);
    const ls = typeof window !== 'undefined' ? window.localStorage : null;

    useEffect(() => {
        if (ls && ls.getItem('cart')) {
            setCart(JSON.parse(ls.getItem('cart')));
        }
    }, []);

    useEffect(() => {
        if (cart?.length > 0) {
            ls?.setItem('cart', JSON.stringify(cart));
        } else {
            ls?.removeItem('cart');
        }
    }, [cart]);

    function addToCart(productId, selectedProperties, quantity = 1) {
        const newItems = Array(quantity).fill({ id: productId, properties: selectedProperties });
        setCart(prev => [...prev, ...newItems]);
        toast.success(`${quantity} item${quantity > 1 ? 's' : ''} added to cart`);
      }

    function clearCart() {
        setCart([]);
        ls?.removeItem('cart');
    }

    return (
        <CartContext.Provider value={{ cart, setCart, addToCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}