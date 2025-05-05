import mongoose from "mongoose";

const ColorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    hexCode: {
        type: String,
        required: true,
        match: /^#[0-9A-Fa-f]{6}$/
    }
}, {
    timestamps: true,
});

const Color = mongoose.models.Color || mongoose.model('Color', ColorSchema);

export default Color;