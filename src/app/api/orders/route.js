import { connectToDatabase } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { options } from "../auth/options";
import User from "../../../../models/user";
import Order from "../../../../models/orders";
import { logActivity } from "@/lib/activityLogger";
import { Activities } from "@/lib/activityLogger";
import { sendEmail } from "@/lib/sendEmail";



export async function GET(request) {
    try {
        const session = await getServerSession(options);
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');
        
        if (!session) {
            return new Response(JSON.stringify({ 
                error: "Unauthorized" 
            }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' } 
            });
        }
        if (session.user.role !== 'admin') {
            return new Response(JSON.stringify({ 
                error: "Forbidden" 
            }), { 
                status: 403,
                headers: { 'Content-Type': 'application/json' } 
            });
        }
        await connectToDatabase();

        const user = await User.findOne({ _id: session.user.id });

        if (!user || user.role !== 'admin') {
            return new Response(JSON.stringify({
                error: "Forbidden"
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Get pagination parameters from query string
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 8; // Default to 8 items per page
        
        // Calculate skip value for pagination
        const skip = (page - 1) * limit;
        
        // Get total count of orders for pagination info
        const totalOrders = await Order.countDocuments();
        
        // Get paginated orders

        let orders = []

        if (query) {
            console.log({query})
            orders = await Order.find({_id: query})
            console.log(orders)
        } else {
            orders = await Order.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();
        }
        
        // Transform the data to match frontend expectations
        const transformedOrders = orders.map(order => ({
            id: order._id.toString(),
            customer: `${order.formData.firstName} ${order.formData.lastName}`,
            customerDetails: {
                email: order.formData.email,
                phone: order.formData.phone,
                address: `${order.formData.address}, ${order.formData.city}, ${order.formData.state} ${order.formData.zip}, ${order.formData.country}`
            },
            date: new Date(order.createdAt).toISOString().split('T')[0],
            items: order.items.map(item => ({
                id: item._id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                color: item.color,
                size: item.size,
                image: item.image
            })),
            subtotal: order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2),
            shipping: order.shipping?.toFixed(2) || '0.00',
            tax: order.tax?.toFixed(2) || '0.00',
            total: order.total.toFixed(2),
            status: order.status,
            paymentMethod: "Credit Card",
            transactionId: order.transactionId,
            cancellationReason: order.cancellationReason || null
        }));
        
        return new Response(JSON.stringify({
            orders: transformedOrders,
            total: totalOrders,
            page,
            limit,
            totalPages: Math.ceil(totalOrders / limit)
        }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ message: "Internal Server Error" }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const {
            formData,
            items,
            total,
            shipping,
            tax,
            transactionId,
        } = body;

        // Validate presence of required fields
        if (!formData || !items || !total || !transactionId) {
            return new Response(
                JSON.stringify({ message: "Missing required fields." }),
                { status: 400 }
            );
        }

        // Validate items
        if (!Array.isArray(items) || items.length === 0) {
            return new Response(
                JSON.stringify({ message: "Items must be a non-empty array." }),
                { status: 400 }
            );
        }

        // Validate transaction ID
        if (typeof transactionId !== "string" || !transactionId.trim()) {
            return new Response(
                JSON.stringify({ message: "Invalid transaction ID." }),
                { status: 400 }
            );
        }

        // Validate form data fields
        const requiredStringFields = [
            "email",
            "firstName",
            "lastName",
            "address",
            "city",
            "state",
            "zip",
            "phone",
            "country",
        ];

        for (const field of requiredStringFields) {
            if (
                typeof formData[field] !== "string" ||
                !formData[field].trim()
            ) {
                return new Response(
                    JSON.stringify({ message: `Invalid ${field}.` }),
                    { status: 400 }
                );
            }
        }

        if (typeof formData.apartment !== "string") {
            return new Response(
                JSON.stringify({ message: "Invalid apartment." }),
                { status: 400 }
            );
        }

        // Validate numeric fields
        const numericFields = { total, shipping, tax };
        for (const [key, value] of Object.entries(numericFields)) {
            if (typeof value !== "number") {
                return new Response(
                    JSON.stringify({ message: `Invalid ${key} value.` }),
                    { status: 400 }
                );
            }
        }

        // Save order to database
        await connectToDatabase();

        const order = new Order({
            items,
            total,
            shipping,
            tax,
            formData,
            transactionId,
        });



        await order.save();


        const session = await getServerSession(options);

        await logActivity(Activities.orderCreated(order, session.user));

        const emailNotification = generateSimpleSellerOrderNotificationTemplate()

        await sendEmail(process.env.EMAIL_ADDRESS, "Congratulations 🎉 New Order Received", emailNotification)

        return new Response(
            JSON.stringify({ message: "Order processed successfully." }),
            { status: 201 }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ message: "Internal Server Error." }),
            { status: 500 }
        );
    }
}