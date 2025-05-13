import Stripe from 'stripe';
import Order from '../../../../models/orders';
import { connectToDatabase } from '@/lib/mongoose';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    try {
        const body = await request.json();
        const { items, orderId, customerEmail } = body;

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            return new Response(JSON.stringify({ error: "Invalid or empty items array" }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Create line items for Stripe from cart items
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    description: `${item.color} / ${item.size}`, // Include variant info
                    metadata: {
                        productId: item._id // Store your internal product ID
                    }
                },
                unit_amount: Math.round(item.price * 100), // Convert to cents
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: lineItems,
            customer_email: customerEmail, // Pre-fill customer email
            client_reference_id: orderId, // Link to your order ID
            success_url: `${request.headers.get('origin')}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${request.headers.get('origin')}?session_id={CHECKOUT_SESSION_ID}`,
            shipping_address_collection: {
                allowed_countries: ['US', 'CA', 'GB'], // Customize allowed countries
            },
            metadata: {
                orderId: orderId // Store order ID in metadata for webhooks
            }
        });

        // Update order status in your database
        await connectToDatabase();
        await Order.findByIdAndUpdate(orderId, {
            status: 'pending',
            paymentStatus: 'unpaid',
            transactionId: session.id,
        });

        return new Response(JSON.stringify({ url: session.url }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}