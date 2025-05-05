import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    formData: {
        email: {
            type: String,
            required: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        apartment: String,
        city: {
            type: String,
            required: true
        },
        country: {
            type: String,
            default: "United States"
        },
        state: {
            type: String,
            required: true
        },
        zip: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        }
    },
    items: [{
        _id: String,
        name: String,
        image: String,
        price: Number,
        color: String,
        size: String,
        quantity: Number
    }],
    
    total: {
        type: Number,
        required: true
    },
    shipping: Number,
    tax: Number,
    transactionId: {
        type: String,
        required: true
    },
    
    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        default: "pending"
    }
}, {
    timestamps: true,
});

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

export default Order;