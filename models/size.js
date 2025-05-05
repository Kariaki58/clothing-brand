import mongoose from "mongoose";

const SizeSchema = new mongoose.Schema({
    value: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true,
});

const Size = mongoose.models.Size || mongoose.model('Size', SizeSchema);

export default Size;