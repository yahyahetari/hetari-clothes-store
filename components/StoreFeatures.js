import { Truck, MessageCircleMore, CircleDollarSign } from 'lucide-react';
import { FaRegCreditCard } from "react-icons/fa";

export default function StoreFeatures() {
    return (
        <div className="store-feature section bg-white py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex flex-col items-center text-center">
                        <Truck className="w-12 h-12 mb-2 text-gray-400" />
                        <h5 className="font-semibold text-lg">Free Shipping &amp; Return</h5>
                        <span className="text-sm text-gray-600">Free shipping on all US orders</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <CircleDollarSign className="w-12 h-12 mb-2 text-gray-400" />
                        <h5 className="font-semibold text-lg">Money Guarantee</h5>
                        <span className="text-sm text-gray-600">30 days money back guarantee</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <MessageCircleMore className="w-12 h-12 mb-2 text-gray-400" />
                        <h5 className="font-semibold text-lg">Online Support</h5>
                        <span className="text-sm text-gray-600">We support online 24/7 on day</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <FaRegCreditCard className="w-12 h-12 mb-2 text-gray-400" />
                        <h5 className="font-semibold text-lg">Secure Payments</h5>
                        <span className="text-sm text-gray-600">All payment are Secured and trusted.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
