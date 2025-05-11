import { connectToDatabase } from "@/lib/mongoose";
import Order from "../../../../models/orders";


export async function POST(req) {
    try {
        await connectToDatabase();
        
        const { orderId, email } = await req.json();
        
        // Basic validation
        if (!orderId || !email) {
            return new Response(
                JSON.stringify({ error: "Both order ID and email are required" }),
                { status: 400 }
            );
        }

        // Find order with minimal data projection
        const order = await Order.findOne({
            _id: orderId,
            "formData.email": email.toLowerCase()
        }).select("status createdAt updatedAt");

        if (!order) {
            return new Response(
                JSON.stringify({ error: "Order not found. Please check your details." }),
                { status: 404 }
            );
        }

        // Simplified status response
        return new Response(JSON.stringify({
            orderId: order._id,
            status: order.status,
            lastUpdated: order.updatedAt,
            createdAt: order.createdAt
        }), { status: 200});

    } catch (error) {
        return new Response(
            JSON.stringify({ error: "Failed to track order. Please try again later." }),
            { status: 500 }
        );
    }
}