import { getServerSession } from "next-auth";
import { options } from "../../auth/options";
import { connectToDatabase } from "@/lib/mongoose";
import Order from "../../../../../models/orders";
import User from "../../../../../models/user";

export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(options);
        
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
        
        const { id } = await params;
        const { status, cancellationReason } = await request.json();
        
        // Validate status
        const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
        if (!validStatuses.includes(status)) {
            return new Response(JSON.stringify({
                error: "Invalid status"
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Prepare update data
        const updateData = { status };
        if (status === "cancelled" && cancellationReason) {
            updateData.cancellationReason = cancellationReason;
        } else if (status !== "cancelled") {
            updateData.cancellationReason = null;
        }
        
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).lean();
        
        if (!updatedOrder) {
            return new Response(JSON.stringify({
                error: "Order not found"
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Transform the order to match frontend expectations
        const transformedOrder = {
            id: updatedOrder._id.toString(),
            customer: `${updatedOrder.formData.firstName} ${updatedOrder.formData.lastName}`,
            customerDetails: {
                email: updatedOrder.formData.email,
                phone: updatedOrder.formData.phone,
                address: `${updatedOrder.formData.address}, ${updatedOrder.formData.city}, ${updatedOrder.formData.state} ${updatedOrder.formData.zip}, ${updatedOrder.formData.country}`
            },
            date: new Date(updatedOrder.createdAt).toISOString().split('T')[0],
            items: updatedOrder.items.map(item => ({
                id: item._id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                color: item.color,
                size: item.size,
                image: item.image
            })),
            subtotal: updatedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2),
            shipping: updatedOrder.shipping?.toFixed(2) || '0.00',
            tax: updatedOrder.tax?.toFixed(2) || '0.00',
            total: updatedOrder.total.toFixed(2),
            status: updatedOrder.status,
            paymentMethod: "Credit Card",
            transactionId: updatedOrder.transactionId,
            cancellationReason: updatedOrder.cancellationReason || null
        };
        
        return new Response(JSON.stringify(transformedOrder), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error("Error updating order:", error);
        return new Response(JSON.stringify({ message: "Internal Server Error" }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}