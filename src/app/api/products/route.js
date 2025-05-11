import { connectToDatabase } from "@/lib/mongoose";
import { uploadImage } from "@/lib/cloudinary-upload";
import Product from "../../../../models/product";
import Category from "../../../../models/category";
import { getServerSession } from "next-auth";
import { options } from "../auth/options";
import { z } from "zod";
import User from "../../../../models/user";

const VariantSchema = z.object({
    colors: z.array(z.string().min(1)).min(1, "At least one color is required"),
    sizes: z.array(z.string().min(1)).min(1, "At least one size is required"),
    priceAdjustment: z.number().default(0),
    stock: z.number().min(0).default(0)
});

const ProductSchema = z.object({
    name: z.string().min(1, "Product name is required").max(100),
    description: z.string().min(1, "Description is required").max(1000),
    price: z.number().min(0.01, "Price must be at least $0.01"),
    category: z.string().min(1, "Category is required"),
    variants: z.array(VariantSchema).min(1, "At least one variant is required")
});


export async function GET(req) {
    try {
        await connectToDatabase();
        
        // Parse query parameters for pagination
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const limit = parseInt(url.searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;
        
        // Get total count of active products for pagination info
        const total = await Product.countDocuments({ isActive: true });
        
        const products = await Product.find({ isActive: true })
            .populate('category', 'name')
            .select('-__v -createdAt -updatedAt')
            .skip(skip)
            .limit(limit)
            .lean();
        
        // Calculate pagination metadata
        const totalPages = Math.ceil(total / limit);
        const hasNext = page < totalPages;
        const hasPrevious = page > 1;

        
        return new Response(JSON.stringify({
            data: products,
            pagination: {
                total,
                totalPages,
                currentPage: page,
                hasNext,
                hasPrevious,
                limit
            }
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch products' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

export async function POST(req) {
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
        const formData = await req.formData();
        const rawData = Object.fromEntries(formData.entries());
    
        // 2. Validate required fields exist
        if (!formData.has('name') || !formData.has('description') || 
            !formData.has('price') || !formData.has('category') || 
            !formData.has('variants')) {
                return new Response(JSON.stringify({ 
                    error: "Missing required fields" 
                }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' } 
            });
        }
    
        // 3. Parse and validate variants
        let variantsArray;
        try {
            variantsArray = JSON.parse(rawData.variants || '[]');
            if (!Array.isArray(variantsArray)) {
                throw new Error("Variants must be an array");
            }
        } catch (e) {
            return new Response(JSON.stringify({ 
                error: "Invalid variants format" 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' } 
            });
        }
    
        // 4. Validate product name uniqueness
        const existingProduct = await Product.findOne({ name: formData.get('name') });

        if (existingProduct) {
            return new Response(JSON.stringify({ 
                error: "Product name already exists" 
            }), { 
                status: 409,
                headers: { 'Content-Type': 'application/json' } 
            });
        }
        // 5. Validate all data with Zod
        const productData = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            category: formData.get('category'),
            variants: variantsArray
        };
    
        const validationResult = ProductSchema.safeParse(productData);
        if (!validationResult.success) {
            const errors = validationResult.error.issues.map(issue => ({
                field: issue.path.join('.'),
                message: issue.message
            }));
            
            return new Response(JSON.stringify({ 
                error: "Validation failed",
                details: errors 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' } 
            });
        }
    
        // 6. Validate image count matches variant count
        const variantImageFiles = [];
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('variantImages-')) {
                variantImageFiles[parseInt(key.split('-')[1])] = value;
            }
        }
    
        if (variantImageFiles.length !== variantsArray.length) {
            return new Response(JSON.stringify({ 
                error: "Number of variant images must match number of variants" 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' } 
            });
        }
    
        // Process valid data
        const processedVariants = [];
        for (let i = 0; i < variantsArray.length; i++) {
            const variant = variantsArray[i];
            let imageUrl = '';
    
            if (variantImageFiles[i]) {
                try {
                    const buffer = await variantImageFiles[i].arrayBuffer();
                    const uploadResult = await uploadImage(Buffer.from(buffer));
                    imageUrl = uploadResult.secure_url;
                } catch (uploadError) {
                    return new Response(JSON.stringify({ 
                        error: `Failed to upload image for variant ${i+1}` 
                    }), { 
                        status: 500,
                        headers: { 'Content-Type': 'application/json' } 
                    });
                }
            }
    
            processedVariants.push({
                colors: variant.colors,
                sizes: variant.sizes,
                priceAdjustment: parseFloat(variant.priceAdjustment) || 0,
                stock: parseInt(variant.stock) || 0,
                imageUrl
            });
        }
    
        // Create product with validated data
        const finalProductData = {
            ...productData,
            basePrice: productData.price,
            variants: processedVariants
        };
    
        const newProduct = await Product.create(finalProductData);

        if (!newProduct) {
            return new Response(JSON.stringify({ 
                error: "Failed to create product" 
            }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' } 
            });
        }
        await Category.updateOne(
            { name: productData.category },
            { $set: { name: productData.category } },
            { upsert: true }
        );
        
        return new Response(JSON.stringify({
            message: "Product created successfully!"
        }), { 
            status: 201, 
            headers: { 'Content-Type': 'application/json' } 
        });
        
    } catch (error) {
        return new Response(JSON.stringify({ 
            error: "Internal server error" 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' } 
        });
    }
}