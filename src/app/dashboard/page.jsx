"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminDashboardPage() {

    return (
        <div className="lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h1 className="text-2xl font-bold text-slate-900 mb-6">Admin Dashboard</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="border border-slate-200 rounded-lg p-6">
                        <h3 className="font-medium text-slate-900 mb-4">Quick Stats</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-slate-600 text-sm">Total Products</p>
                                <p className="text-xl font-bold">124</p>
                            </div>
                            <div>
                                <p className="text-slate-600 text-sm">Pending Orders</p>
                                <p className="text-xl font-bold">8</p>
                            </div>
                            <div>
                                <p className="text-slate-600 text-sm">Completed Orders</p>
                                <p className="text-xl font-bold">42</p>
                            </div>
                        </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-6">
                        <h3 className="font-medium text-slate-900 mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                            <div className="text-sm">
                                <p className="font-medium">New order received</p>
                                <p className="text-slate-500">Order #1234 - 2 hours ago</p>
                            </div>
                            <div className="text-sm">
                                <p className="font-medium">Product updated</p>
                                <p className="text-slate-500">"Premium Headphones" - 5 hours ago</p>
                            </div>
                            <div className="text-sm">
                                <p className="font-medium">New user registered</p>
                                <p className="text-slate-500">john.doe@example.com - 1 day ago</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-medium text-slate-900">Recent Orders</h3>
                        <Link href="/dashboard/orders">
                            <Button variant="outline">View All</Button>
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">#1234</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">John Doe</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">2023-06-15</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Completed</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">$129.99</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">#1233</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">Jane Smith</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">2023-06-14</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Processing</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">$89.99</td>
                                </tr>
                                <tr>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">#1232</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">Robert Johnson</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">2023-06-14</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Shipped</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">$249.99</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}