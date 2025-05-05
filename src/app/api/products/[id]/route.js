import { connectToDatabase } from "@/lib/mongoose";
import Product from "../../../../../models/product";
import User from "../../../../../models/user";
import { uploadImage } from "@/lib/cloudinary-upload";
import { getServerSession } from "next-auth";
import { options } from "../../auth/options";


export async function GET(req, { params }) {
    try {
        await connectToDatabase();

        const id = (await params).id;

        console.log(id);
        
        const product = await Product.findById(id)
            .populate('category', 'name')
            .select('-__v -createdAt -updatedAt')
            .lean();
            
        if (!product) {
            return new Response(JSON.stringify({ error: 'Product not found' }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }
        
        return new Response(JSON.stringify(product), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch product' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

export async function PUT(req, { params }) {
    try {
        const session = await getServerSession(options);

        // Authentication check
        if (!session) {
            return new Response(JSON.stringify({ 
                error: "Unauthorized" 
            }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        // Authorization check
        if (session.user.role !== 'admin') {
            return new Response(JSON.stringify({ 
                error: "Forbidden" 
            }), { 
                status: 403,
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        await connectToDatabase();

        // Verify user exists and is admin
        const user = await User.findOne({ _id: session.user.id });
        if (!user || user.role !== 'admin') {
            return new Response(JSON.stringify({
                error: "Forbidden"
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get product ID from params
        const { id } = await params;
        if (!id) {
            return new Response(JSON.stringify({ 
                error: "Product ID is required" 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        // Parse form data
        const formData = await req.formData();
        const rawData = Object.fromEntries(formData.entries());

        console.log(
            "Form Data Received:",
            {
                name: formData.get('name'),
                description: formData.get('description'),
                price: formData.get('price'),
                category: formData.get('category'),
                variants: formData.get('variants')
            }
        )

        // Validate required fields
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

        // Parse and validate variants
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

        // Check if product exists
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return new Response(JSON.stringify({ 
                error: "Product not found" 
            }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        // Check for name uniqueness (excluding current product)
        const nameConflict = await Product.findOne({ 
            name: formData.get('name'), 
            _id: { $ne: id } 
        });
        if (nameConflict) {
            return new Response(JSON.stringify({ 
                error: "Product name already exists" 
            }), { 
                status: 409,
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        // Prepare product data for validation
        const productData = {
            name: formData.get('name'),
            description: formData.get('description'),
            price: parseFloat(formData.get('price')),
            category: formData.get('category'),
            variants: variantsArray
        };

        // Validate with Zod schema
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

        // Handle variant images
        const variantImageFiles = [];
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('variantImages-')) {
                variantImageFiles[parseInt(key.split('-')[1])] = value;
            }
        }

        // Validate image count matches variant count
        if (variantImageFiles.length > 0 && variantImageFiles.length !== variantsArray.length) {
            return new Response(JSON.stringify({ 
                error: "Number of variant images must match number of variants" 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        // Process variants with image uploads
        const processedVariants = [];
        for (let i = 0; i < variantsArray.length; i++) {
            const variant = variantsArray[i];
            let imageUrl = variant.imageUrl || existingProduct.variants[i]?.imageUrl || '';

            // Upload new image if provided
            if (variantImageFiles[i]) {
                try {
                    const buffer = await variantImageFiles[i].arrayBuffer();
                    const uploadResult = await uploadImage(Buffer.from(buffer));
                    imageUrl = uploadResult.secure_url;
                } catch (uploadError) {
                    console.error("Image upload failed:", uploadError);
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

        // Prepare update data
        const updateData = {
            name: productData.name,
            description: productData.description,
            basePrice: productData.price,
            category: productData.category,
            variants: processedVariants,
            updatedAt: new Date()
        };

        // Update product
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!updatedProduct) {
            return new Response(JSON.stringify({ 
                error: "Failed to update product" 
            }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        // Update category if needed
        await Category.updateOne(
            { name: productData.category },
            { $set: { name: productData.category } },
            { upsert: true }
        );
        
        return new Response(JSON.stringify({
            message: "Product updated successfully!",
            product: updatedProduct
        }), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
        });
        
    } catch (error) {
        console.error("Server error:", error);
        return new Response(JSON.stringify({ 
            error: "Internal server error",
            details: error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' } 
        });
    }
}


export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(options);
        if (!session) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }
        if (session.user.role !== 'admin') {
            return new Response(JSON.stringify({ error: 'Forbidden' }), {
                status: 403,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        await connectToDatabase();

        const user = await User.findOne({ _id: session.user.id });

        if (!user || user.role !== 'admin') {
            return new Response(JSON.stringify({ error: 'Forbidden' }), {
                status: 403,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const id = (await params).id;
        
        // Soft delete by setting isActive to false
        const deletedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: { isActive: false } },
            { new: true }
        );
            
        if (!deletedProduct) {
            return new Response(JSON.stringify({ error: 'Product not found' }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }
        
        return new Response(JSON.stringify({ message: 'Product deleted successfully' }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete product' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}