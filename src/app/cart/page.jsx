"use client";
import { Button } from "@/components/ui/button";
import { ShoppingBag, X, ChevronLeft } from "lucide-react";
import Link from "next/link";
import CartItem from "@/components/cart-item";
import Image from "next/image";
import { useCartStore } from "../../../store/cartStore";

export default function CartPage() {
    const { items: cartItems, removeItem, updateQuantity, getTotalPrice } = useCartStore();
    const subtotal = getTotalPrice();
    const shipping = 5.99;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;

    const handleQuantityChange = (itemId, newQuantity) => {
        if (newQuantity > 0) {
            updateQuantity(itemId, newQuantity);
        } else {
            removeItem(itemId);
        }
    };

    return (
        <div className="py-8">
            <div className="container px-4 mx-auto">
                <h1 className="text-2xl font-bold text-slate-900 mb-8">Your Cart</h1>

                {cartItems.length === 0 ? (
                    <div className="text-center py-12">
                        <ShoppingBag className="mx-auto h-12 w-12 text-slate-400" />
                        <h2 className="mt-4 text-lg font-medium text-slate-900">Your cart is empty</h2>
                        <p className="mt-2 text-slate-500">
                            Start adding some items to your cart to checkout.
                        </p>
                        <Link href="/products">
                            <Button className="mt-6">Continue Shopping</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            {/* Mobile view - simple list */}
                            <div className="lg:hidden space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item._id} className="border border-slate-200 rounded-lg p-4">
                                        <div className="flex">
                                            <div className="relative h-20 w-20 rounded-md overflow-hidden">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover object-center"
                                                />
                                            </div>
                                            <div className="ml-4 flex-1">
                                                <h3 className="text-sm font-medium text-slate-900">{item.name}</h3>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    {item.color} / {item.size}
                                                </p>
                                                <p className="text-sm font-medium text-slate-900 mt-1">
                                                    ${item.price.toFixed(2)}
                                                </p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <select
                                                        value={item.quantity}
                                                        onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value))}
                                                        className="max-w-[80px] rounded-md border border-slate-300 py-1 text-left text-sm font-medium text-slate-700 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                                                    >
                                                        {[1, 2, 3, 4, 5].map((quantity) => (
                                                            <option key={quantity} value={quantity}>
                                                                {quantity}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon"
                                                        onClick={() => removeItem(item._id)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop view - table */}
                            <div className="hidden lg:block">
                                <div className="border-b border-slate-200 pb-4">
                                    <div className="grid grid-cols-5 gap-4 text-sm font-medium text-slate-500">
                                        <div className="col-span-2">Product</div>
                                        <div>Price</div>
                                        <div>Quantity</div>
                                        <div>Total</div>
                                    </div>
                                </div>

                                <div className="divide-y divide-slate-200">
                                    {cartItems.map((item) => (
                                        <CartItem 
                                            key={item._id} 
                                            item={item}
                                            onRemove={() => removeItem(item._id)}
                                            onQuantityChange={(newQuantity) => handleQuantityChange(item._id, newQuantity)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6">
                                <Link
                                    href="/products"
                                    className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>

                        {/* Order Summary - responsive */}
                        <div className="bg-slate-50 p-6 rounded-lg sticky top-4">
                            <h2 className="text-lg font-medium text-slate-900 mb-4">Order Summary</h2>
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
                            <Link href="/checkout">
                                <Button size="lg" className="w-full mt-6">
                                    Checkout
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}