// models/Activity.js
import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: [
            'order_created',
            'order_updated',
            'product_created', 
            'product_updated',
            'user_registered',
            'admin_action'
        ]
    },
    description: String,
    metadata: mongoose.Schema.Types.Mixed,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    ipAddress: String,
    userAgent: String
    }, {
        timestamps: true
});

export default mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);