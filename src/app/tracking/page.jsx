import { Button } from "@/components/ui/button";
import { Package, CheckCircle2, Truck, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function TrackingPage() {
    return (
        <div className="py-12">
            <div className="container px-4 mx-auto">
                <div className="max-w-2xl mx-auto text-center">
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">Track Your Order</h1>
                    <p className="text-slate-600 mb-8">
                        Enter your order number and email address to check the status of your order.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input placeholder="Order Number" className="flex-1" />
                        <Input placeholder="Email Address" className="flex-1" />
                        <Button>Track Order</Button>
                    </div>
                </div>

                {/* Example tracking info */}
                <div className="max-w-2xl mx-auto mt-16 border border-slate-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                        <h2 className="text-lg font-medium text-slate-900">Order #123456</h2>
                        <p className="text-sm text-slate-500">Placed on October 15, 2023</p>
                        </div>
                        <Button variant="outline" size="sm">
                        View Order Details
                        </Button>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-slate-100 rounded-full">
                                <Package className="h-5 w-5 text-slate-600" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between">
                                <h3 className="font-medium text-slate-900">Order Placed</h3>
                                <span className="text-sm text-slate-500">Oct 15, 2023</span>
                                </div>
                                <p className="text-sm text-slate-500 mt-1">
                                Your order has been received and is being processed.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-slate-100 rounded-full">
                                <CheckCircle2 className="h-5 w-5 text-slate-600" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between">
                                <h3 className="font-medium text-slate-900">Order Confirmed</h3>
                                <span className="text-sm text-slate-500">Oct 16, 2023</span>
                                </div>
                                <p className="text-sm text-slate-500 mt-1">
                                Your order has been confirmed and is being prepared for shipment.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-slate-100 rounded-full">
                                <Truck className="h-5 w-5 text-slate-600" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <h3 className="font-medium text-slate-900">Shipped</h3>
                                    <span className="text-sm text-slate-500">Oct 18, 2023</span>
                                </div>
                                <p className="text-sm text-slate-500 mt-1">
                                    Your order has been shipped. Expected delivery: Oct 22, 2023
                                </p>
                                <Button variant="link" size="sm" className="pl-0 mt-2">
                                    Track Package <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}