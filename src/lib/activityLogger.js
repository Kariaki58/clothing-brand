import Activity from "../../models/activity";
import { connectToDatabase } from "./mongoose";

export const logActivity = async (activityData) => {
    try {
        await connectToDatabase();
        await Activity.create(activityData);
    } catch (error) {
        throw new Error("Failed to log activity");
    }
};

// Common activity types
export const Activities = {
    orderCreated: (order, user) => ({
        type: "order_created",
        description: `New order #${order._id.toString().substring(0, 4)}`,
        metadata: { orderId: order._id, amount: order.total },
        user: user?._id
    }),
    
    productUpdated: (product, user) => ({
        type: "product_updated",
        description: `Product updated: ${product.name}`,
        metadata: { productId: product._id },
        user: user?._id
    }),
    
    userRegistered: (newUser) => ({
        type: "user_registered",
        description: `New user: ${newUser.email}`,
        metadata: { userId: newUser._id },
        user: newUser._id
    })
};