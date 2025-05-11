import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema({
    colors: [{ 
        type: String, 
        required: true 
    }],
    sizes: [{ 
        type: String, 
        required: true 
    }],
    priceAdjustment: { 
        type: Number, 
        default: 0 
    },
    stock: { 
        type: Number, 
        default: 0, 
        min: 0 
    },
    imageUrl: { 
        type: String, 
        required: true 
    },
    sku: { 
        type: String, 
        unique: true, 
        sparse: true 
    }
}, { _id: true });

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    basePrice: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true
    },
    variants: [VariantSchema],
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
});

// Update indexes to match new structure
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ 'variants.colors': 1 });
ProductSchema.index({ 'variants.sizes': 1 });

ProductSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    if (!this.slug) {
        this.slug = this.name.toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
    
    // Update SKU generation for new structure
    this.variants.forEach(variant => {
        if (!variant.sku) {
            const colorCode = variant.colors[0]?.substring(0, 3).toUpperCase() || 'CLR';
            const sizeCode = variant.sizes[0]?.replace(/\s+/g, '').toUpperCase() || 'SZ';
            variant.sku = `${this.slug.substring(0, 5)}-${colorCode}-${sizeCode}`.toUpperCase();
        }
    });
    
    next();
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

export default Product;