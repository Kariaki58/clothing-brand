"use client";
import { Button } from "@/components/ui/button";
import { Package, Settings, User, LogOut } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import OrderCard from "@/components/order-card";

// Mock orders data
const orders = [
    {
        id: "123456",
        date: "October 15, 2023",
        status: "Delivered",
        total: 105.57,
        items: [
        {
            id: 1,
            name: "Minimalist Tee",
            price: 29.99,
            image: "/placeholder-tee.jpg",
            quantity: 1,
        },
        {
            id: 2,
            name: "Classic Chinos",
            price: 59.99,
            image: "/placeholder-chinos.jpg",
            quantity: 1,
        },
        ],
    },
    {
        id: "789012",
        date: "September 28, 2023",
        status: "Cancelled",
        total: 59.99,
        items: [
        {
            id: 3,
            name: "Overshirt",
            price: 59.99,
            image: "/placeholder-overshirt.jpg",
            quantity: 1,
        },
        ],
    },
];

export default function OrdersPage() {
    // const { data: session } = useSession();

    return (
        <div className="py-8">
            <div className="container px-4 mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-50 p-6 rounded-lg">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                                    <User className="h-5 w-5 text-slate-600" />
                                </div>
                                <div>
                                    {/* <h3 className="font-medium">{session?.user?.name}</h3>
                                    <p className="text-sm text-slate-500">{session?.user?.email}</p> */}
                                </div>
                            </div>

                            <nav className="space-y-1">
                                <Link
                                    href="/dashboard"
                                    className="flex items-center space-x-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md font-medium"
                                >
                                    <User className="h-5 w-5" />
                                    <span>Account</span>
                                </Link>
                                <Link
                                    href="/dashboard/orders"
                                    className="flex items-center space-x-3 px-3 py-2 bg-white text-slate-900 rounded-md font-medium"
                                >
                                    <Package className="h-5 w-5" />
                                    <span>Orders</span>
                                </Link>
                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="w-full flex items-center space-x-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md font-medium"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span>Sign Out</span>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white border border-slate-200 rounded-lg p-6">
                            <h1 className="text-2xl font-bold text-slate-900 mb-6">My Orders</h1>

                            {orders.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="mx-auto h-12 w-12 text-slate-400" />
                                    <h2 className="mt-4 text-lg font-medium text-slate-900">No orders yet</h2>
                                    <p className="mt-2 text-slate-500">
                                        Start shopping to see your orders here.
                                    </p>
                                    <Link href="/products">
                                        <Button className="mt-6">Start Shopping</Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {orders.map((order) => (
                                        <OrderCard key={order.id} order={order} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}