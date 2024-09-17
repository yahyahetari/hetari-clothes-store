import { useEffect } from "react";
import { useRouter } from "next/router";
import { CartContext } from "@/components/CartContext";
import { useContext } from "react";

const SuccessfulPayment = () => {
    const { clearCart } = useContext(CartContext);
    const router = useRouter();

    useEffect(() => {
        clearCart();
        // Set a flag in sessionStorage to indicate successful payment
        sessionStorage.setItem('paymentSuccessful', 'true');
    }, []);

    return (
        <div className="h-screen flex flex-col justify-center items-center gap-5">
            <img/>
            <h1 className='font-semibold text-xl text-green-1 bg-green-800 p-3 rounded-lg'>Successful Payment</h1>
            <p className='font-extrabold text-3xl text-black'>Free Palestine</p>
            <p className='font-extrabold text-3xl text-red-700'>Free Palestine</p>
            <p className='font-extrabold text-3xl text-green-700'>Free Palestine</p>
            <p className='text-lg text-center font-semibold'>We will contact you when your order will be send</p>
            <button
                onClick={() => router.push('/')}
                className="p-4 border bg-black text-white hover:bg-white hover:text-black rounded-lg"
            >
                Go Back To Home
            </button>
        </div>
    );
};

export default SuccessfulPayment;
