"use client";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { statuses } from "@/lib/order-status"; // Your status definitions


const getStatusBadge = (status) => {
    switch (status) {
        case "pending":
            return <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            <Clock className="h-3 w-3 mr-1" /> Pending
            </Badge>;
        case "processing":
            return <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <RefreshCw className="h-3 w-3 mr-1" /> Processing
            </Badge>;
        case "shipped":
            return <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <Truck className="h-3 w-3 mr-1" /> Shipped
            </Badge>;
        case "delivered":
            return <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" /> Delivered
            </Badge>;
        case "cancelled":
            return <Badge variant="secondary" className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" /> Cancelled
            </Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
};
export default function TrackingPage() {
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const checkStatus = async () => {
        if (!orderId || !email) {
            setError('Both fields are required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, email }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to check status');
            
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-12">
            <div className="container px-4 mx-auto">
                <div className="max-w-2xl mx-auto text-center">
                    <h1 className="text-3xl font-bold mb-4">Order Status Check</h1>
                    <div className="flex flex-col sm:flex-row gap-2 mb-8">
                        <Input
                            placeholder="Order ID"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                        />
                        <Input
                            placeholder="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Button onClick={checkStatus} disabled={loading}>
                            {loading ? 'Checking...' : 'Check Status'}
                        </Button>
                    </div>

                    {error && <p className="text-red-500 mb-4">{error}</p>}

                    {result && (
                        <div className="mt-8 p-6 border rounded-lg">
                            <h2 className="text-xl font-semibold mb-2">Order #{result.orderId}</h2>
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${
                                    statuses[result.status]?.color || 'bg-gray-400'
                                }`} />
                                <span className="font-medium">
                                    {statuses[result.status]?.label || result.status}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                Last updated: {new Date(result.lastUpdated).toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}