"use client";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useCartStore } from "../../store/cartStore";
import { useSearchParams } from "next/navigation";

export default function ThankYouPage() {
    const { clearCart } = useCartStore();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");

    const [windowSize, setWindowSize] = useState({
        width: 0,
        height: 0,
    });
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        setShowConfetti(true);
        const updateWindowSize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        updateWindowSize();
        window.addEventListener("resize", updateWindowSize);
        clearCart();

        return () => {
            window.removeEventListener("resize", updateWindowSize);
        };
    }, [clearCart]);

    return (
        <div className="relative w-full min-h-screen py-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
            {showConfetti && (
                <Confetti
                    width={windowSize.width}
                    height={windowSize.height}
                    recycle={false}
                    numberOfPieces={500}
                    gravity={0.2}
                />
            )}

            <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-100 p-4 sm:p-6 md:p-8 lg:p-10 text-center z-10 relative w-full">
                <div className="mx-auto flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-green-100 mb-4 sm:mb-6">
                    <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-3 sm:mb-4">
                    Order Confirmed!
                </h1>

                {orderId && (
                    <p className="text-slate-600 mb-2 text-xs sm:text-sm md:text-base">
                        Order #: <span className="font-medium">{orderId}</span>
                    </p>
                )}

                <p className="text-slate-600 mb-6 sm:mb-8 text-xs sm:text-sm md:text-base">
                    Thank you for your purchase! We've received your order and it's now being processed. 
                    You'll receive a confirmation email with all the details shortly.
                </p>

                <div className="bg-slate-50 rounded-lg p-3 sm:p-4 md:p-6 mb-6 sm:mb-8 text-left text-xs sm:text-sm md:text-base">
                    <h2 className="text-sm sm:text-base md:text-lg font-medium text-slate-900 mb-3 sm:mb-4 flex items-center">
                        <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        What's next?
                    </h2>
                    <ul className="space-y-2 sm:space-y-3 text-slate-600">
                        <li className="flex items-start">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1.5 sm:mt-2 mr-2"></span>
                            <span>Order processing (1-2 business days)</span>
                        </li>
                        <li className="flex items-start">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1.5 sm:mt-2 mr-2"></span>
                            <span>Shipping confirmation with tracking number</span>
                        </li>
                        <li className="flex items-start">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-1.5 sm:mt-2 mr-2"></span>
                            <span>Delivery within 3-5 business days</span>
                        </li>
                    </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <Link href="/products" className="w-full sm:w-auto">
                        <Button className="w-full">
                            Continue Shopping
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-blue-100/50 blur-xl"></div>
                <div className="absolute top-1/3 right-1/3 w-20 h-20 sm:w-28 sm:h-28 md:w-40 md:h-40 rounded-full bg-green-100/50 blur-xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full bg-purple-100/50 blur-xl"></div>
            </div>
        </div>
    );
}