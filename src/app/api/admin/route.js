import { getServerSession } from "next-auth";
import { options } from "../auth/options";
import { connectToDatabase } from "@/lib/mongoose";
import Order from "../../../../models/orders";
import Product from "../../../../models/product";
import User from "../../../../models/user";
import Activity from "../../../../models/activity";

function getActivityTypeLabel(type) {
    const labels = {
        order_created: "New Order",
        order_updated: "Order Updated",
        product_created: "Product Created",
        product_updated: "Product Updated",
        user_registered: "User Registered",
        admin_action: "Admin Action"
    };
    return labels[type] || type;
}

export async function GET(req) {
    try {
        // Verify admin authentication
        const session = await getServerSession(options);
        
        if (!session || session.user.role !== "admin") {
            return new Response(JSON.stringify({ 
                error: "Unauthorized" 
            }), { 
                status: 401 
            });
        }

        // Connect to database
        await connectToDatabase();

        const user = await User.findById(session.user.id);
        if (!user || user.role !== 'admin') {
            return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
        }

        // Get counts and recent data in parallel
        const [totalProducts, pendingOrders, completedOrders, recentOrders, recentActivity] = await Promise.all([
            // Total products count
            Product.countDocuments({ isActive: true }),
            
            // Pending orders count
            Order.countDocuments({ status: "pending" }),
            
            // Completed orders count
            Order.countDocuments({ status: "delivered" }),
            
            // Recent orders (last 4)
            Order.find()
                .sort({ createdAt: -1 })
                .limit(4)
                .select('_id formData status total createdAt')
                .lean(),
            
            // Recent activity from Activity model
            Activity.find()
                .sort({ createdAt: -1 })
                .limit(2)
                .populate('user', 'name email')
                .lean()
        ]);

        // Format recent orders
        const formattedOrders = recentOrders.map(order => {
            const orderDate = new Date(order.createdAt);
            const timeAgo = Math.floor((Date.now() - orderDate) / (1000 * 60 * 60));
            
            return {
                id: order._id.toString(),
                customer: `${order.formData.firstName} ${order.formData.lastName}`,
                status: order.status,
                total: order.total,
                timestamp: `${timeAgo} hours ago`
            };
        });

        // Format recent activity using getActivityTypeLabel
        const formattedActivity = recentActivity.map(activity => {
            const date = new Date(activity.createdAt);
            const hoursAgo = Math.floor((Date.now() - date) / (1000 * 60 * 60));
            
            return {
                type: getActivityTypeLabel(activity.type),
                details: activity.description || `Activity #${activity._id.toString().substring(0, 4)}`,
                timestamp: `${hoursAgo} hours ago`,
                user: activity.user?.name || 'Admin'
            };
        });

        // Return all dashboard data
        return new Response(JSON.stringify({
            stats: {
                totalProducts,
                pendingOrders,
                completedOrders
            },
            recentOrders: formattedOrders,
            recentActivity: formattedActivity
        }), { 
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({ 
            error: "Internal server error" 
        }), { 
            status: 500 
        });
    }
}