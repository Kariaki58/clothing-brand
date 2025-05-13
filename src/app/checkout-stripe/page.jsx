'use client';

import { useState } from 'react';

export default function Home() {
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
            });

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Failed to create checkout session');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while creating the checkout session.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-2xl font-bold mb-4">Buy Test Product</h1>
        <button
            onClick={handleCheckout}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
            {loading ? 'Processing...' : 'Buy Now – $20'}
        </button>
        </div>
    );
}
