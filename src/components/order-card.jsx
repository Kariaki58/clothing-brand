import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export default function OrderCard({ order }) {
    return (
        <div className="border border-slate-200 rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
            <div className="mb-4 md:mb-0">
            <h3 className="font-medium text-slate-900">Order #{order.id}</h3>
            <p className="text-sm text-slate-500">Placed on {order.date}</p>
            </div>
            <div>
            <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                order.status === "Delivered"
                    ? "bg-green-100 text-green-800"
                    : order.status === "Cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }`}
            >
                {order.status}
            </span>
            </div>
        </div>

        <div className="border-t border-slate-200 pt-4">
            <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
                <h4 className="text-sm font-medium text-slate-900 mb-3">Items</h4>
                <div className="space-y-4">
                {order.items.map((item) => (
                    <div key={item.id} className="flex items-center">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden">
                        <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover object-center"
                        />
                    </div>
                    <div className="ml-4">
                        <h5 className="text-sm font-medium text-slate-900">{item.name}</h5>
                        <p className="text-sm text-slate-500">
                        Qty: {item.quantity} · ${item.price.toFixed(2)}
                        </p>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            <div className="md:w-48">
                <h4 className="text-sm font-medium text-slate-900 mb-3">Order Summary</h4>
                <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Subtotal</span>
                    <span className="text-sm font-medium">${order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Shipping</span>
                    <span className="text-sm font-medium">$5.99</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Tax</span>
                    <span className="text-sm font-medium">$9.60</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between">
                    <span className="text-sm font-medium">Total</span>
                    <span className="text-sm font-bold">${(order.total + 5.99 + 9.6).toFixed(2)}</span>
                </div>
                </div>
            </div>
            </div>
        </div>

        <div className="border-t border-slate-200 pt-4 flex justify-end">
            <Button variant="outline" asChild>
            <Link href={`/account/orders/${order.id}`}>
                View Details <ChevronRight className="h-4 w-4 ml-2" />
            </Link>
            </Button>
        </div>
        </div>
    );
}