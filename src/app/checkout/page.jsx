"use client";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CheckoutForm from "@/components/checkout-form";
import { useCartStore } from "../../../store/cartStore";
import { useState, useEffect } from "react";

export default function CheckoutPage() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const { items: cartItems, getTotalPrice, clearCart } = useCartStore();
    const [PaystackPop, setPaystackPop] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        address: "",
        apartment: "",
        city: "",
        country: "United States",
        state: "",
        zip: "",
        phone: ""
    });

    useEffect(() => {
        setIsMounted(true);
        import("@paystack/inline-js").then((module) => {
            setPaystackPop(() => module.default);
        });
    }, []);

    const subtotal = isMounted ? getTotalPrice() : 0;
    const shipping = 5.99;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;

    const handleFormSubmit = (data) => {
        setFormData(data);
    };

    const handlePlaceOrder = () => {
        if (!PaystackPop) {
            alert("Payment SDK not loaded. Please try again.");
            return;
        }

        if (!formData.email) {
            alert("Please provide your email address");
            return;
        }

        setIsProcessing(true);
        const totalAmount = total * 100;

        const paystack = new PaystackPop();
        paystack.newTransaction({
            key: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
            email: formData.email,
            amount: totalAmount,
            onSuccess: async (transaction) => {
                try {
                    const orderData = {
                        formData,
                        items: cartItems,
                        tax: tax,
                        shipping: shipping,
                        total: total,
                        transactionId: transaction.reference,
                    };
                    
                    const response = await fetch(`/api/orders`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(orderData),
                    });

                    if (!response.ok) {
                        throw new Error("Failed to process order");
                    }
                    const result = await response.json();
                    alert("Order processed successfully:", result);
                    clearCart();
                    router.push("/thank-you");
                } catch (error) {
                    alert("Order processing failed. Please contact support.");
                } finally {
                    setIsProcessing(false);
                }
            },
            onCancel: () => {
                setIsProcessing(false);
                alert("Payment was cancelled");
            },
        });
    };

    if (!isMounted) {
        return null;
    }

    return (
        <div className="py-8">
            <div className="container px-4 mx-auto">
                <Link
                    href="/cart"
                    className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 mb-6"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Cart
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-8">Checkout</h1>
                        <CheckoutForm onSubmit={handleFormSubmit} formData={formData} setFormData={setFormData}/>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-lg h-fit sticky top-4">
                        <h2 className="text-lg font-medium text-slate-900 mb-4">Order Summary</h2>
                        
                        {cartItems.length > 0 ? (
                            <>
                                <div className="mb-6 space-y-4 max-h-64 overflow-y-auto">
                                    {cartItems.map((item) => (
                                        <div key={item._id} className="flex items-center border-b border-slate-100 pb-4">
                                            <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="object-cover object-center h-full w-full"
                                                />
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <h3 className="text-sm font-medium text-slate-900">{item.name}</h3>
                                                <p className="text-sm text-slate-500">
                                                    {item.color} / {item.size}
                                                </p>
                                                <p className="text-sm font-medium text-slate-900">
                                                    {item.quantity} × ${item.price.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Subtotal</span>
                                        <span className="font-medium">${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Shipping</span>
                                        <span className="font-medium">${shipping.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Tax</span>
                                        <span className="font-medium">${tax.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-slate-200 pt-4 flex justify-between">
                                        <span className="text-base font-medium">Total</span>
                                        <span className="text-base font-bold">${total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="mt-6 border-t border-slate-200 pt-6">
                                    <h3 className="text-sm font-medium text-slate-900 mb-2">Payment Method</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center">
                                            <input
                                                id="credit-card"
                                                name="payment-method"
                                                type="radio"
                                                className="h-4 w-4 border-slate-300 text-slate-600 focus:ring-slate-500"
                                                defaultChecked
                                            />
                                            <label htmlFor="credit-card" className="ml-3 block text-sm font-medium text-slate-700">
                                                PayStack
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <Button 
                                    size="lg" 
                                    className="w-full mt-6"
                                    onClick={handlePlaceOrder}
                                    disabled={cartItems.length === 0 || isProcessing}
                                >
                                    {isProcessing ? "Processing..." : "Place Order"}
                                </Button>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-slate-500 mb-4">Your cart is empty</p>
                                <Link href="/products" className="text-sm font-medium text-primary hover:text-primary/90">
                                    Continue Shopping
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}