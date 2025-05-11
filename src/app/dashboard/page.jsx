"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch('/api/admin');
                if (!response.ok) {
                    throw new Error('Failed to fetch dashboard data');
                }
                const data = await response.json();
                setDashboardData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-red-500">Error: {error}</p>
            </div>
        );
    }

    if (!dashboardData) {
        return null;
    }

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
                                <p className="text-xl font-bold">{dashboardData.stats.totalProducts}</p>
                            </div>
                            <div>
                                <p className="text-slate-600 text-sm">Pending Orders</p>
                                <p className="text-xl font-bold">{dashboardData.stats.pendingOrders}</p>
                            </div>
                            <div>
                                <p className="text-slate-600 text-sm">Completed Orders</p>
                                <p className="text-xl font-bold">{dashboardData.stats.completedOrders}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-6">
                        <h3 className="font-medium text-slate-900 mb-4">Recent Activity</h3>
                        {
                            dashboardData.recentActivity.length === 0 ? (
                                <p className="text-slate-500 text-sm">No recent activity available.</p>
                            ) : (
                                <div className="space-y-3">
                                    {dashboardData.recentActivity.map((activity, index) => (
                                        <div key={index} className="text-sm p-3 bg-slate-50 rounded-lg">
                                            <div className="flex justify-between">
                                                <p className="font-medium">{activity.type}</p>
                                                <p className="text-slate-400 text-xs">{activity.timestamp}</p>
                                            </div>
                                            <p className="text-slate-600">{activity.details}</p>
                                            {activity.user && (
                                                <p className="text-xs text-slate-400 mt-1">By: {activity.user}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )
                        }
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
                                {dashboardData.recentOrders.map((order) => {
                                    const statusClasses = {
                                        pending: "bg-yellow-100 text-yellow-800",
                                        processing: "bg-blue-100 text-blue-800",
                                        shipped: "bg-purple-100 text-purple-800",
                                        delivered: "bg-green-100 text-green-800",
                                        cancelled: "bg-red-100 text-red-800"
                                    };

                                    return (
                                        <tr key={order.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{order.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{order.customer}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{order.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[order.status] || 'bg-gray-100 text-gray-800'}`}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{order.total}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}