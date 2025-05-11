import mongoose from "mongoose";


const ReviewSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String
    }
}, { _id: true, timestamps: true });

const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);

export default Review;