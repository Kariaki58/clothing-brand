import { connectToDatabase } from "@/lib/mongoose";
import Product from "../../../../../models/product";
import User from "../../../../../models/user";
import { uploadImage, deleteImage } from "@/lib/cloudinary-upload";
import { getServerSession } from "next-auth";
import z from "zod";
import { options } from "../../auth/options";
import { logActivity } from "@/lib/activityLogger";
import { Activities } from "@/lib/activityLogger";


const VariantSchema = z.object({
    colors: z.array(z.string().min(1)).min(1, "At least one color is required"),
    sizes: z.array(z.string().min(1)).min(1, "At least one size is required"),
    priceAdjustment: z.number().default(0),
    stock: z.number().min(0).default(0),
    imageUrl: z.optional(),
});



const ProductSchema = z.object({
    name: z.string().min(1, "Product name is required").max(100),
    description: z.string().min(1, "Description is required").max(1000),
    price: z.number().min(0.01, "Price must be at least $0.01"),
    category: z.string().min(1, "Category is required"),
    variants: z.array(VariantSchema).min(1, "At least one variant is required")
});

export async function GET(req, { params }) {
    try {
        await connectToDatabase();

        const { id } = await params;


        if (!id) {
            return new Response(JSON.stringify(
                { error: 'Product ID is required' },
            ), { status: 400 });
        }

        const product = await Product.findById(id)
            .populate('category', 'name')
            .select('-__v -createdAt -updatedAt')
            .lean();
            
        if (!product) {
            return new Response(JSON.stringify(
                { error: 'Product not found' },
            ), { status: 404 });
        }
        
        return new Response(JSON.stringify(product));
    } catch (error) {
        return new Response(JSON.stringify(
            { error: 'Failed to fetch product' },
        ), { status: 500 });
    }
}

export async function PUT(req, { params }) {
    const body = await req.formData();

    try {
        // Authentication check
        const session = await getServerSession(options);
        if (!session || session.user.role !== 'admin') {
            return new Response(JSON.stringify({ error: session ? 'Forbidden' : 'Unauthorized' }), {
                status: session ? 403 : 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        await connectToDatabase();

        const user = await User.findById(session.user.id);
        if (!user || user.role !== 'admin') {
            return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
        }

        const productId = (await params).id;

        const name = body.get('name');
        const description = body.get('description');
        const price = parseFloat(body.get('price'));
        const category = body.get('category');
        const variantsRaw = body.get('variants');

        let variants;
        try {
            variants = JSON.parse(variantsRaw);
        } catch {
            return new Response(JSON.stringify({ error: 'Invalid variants data' }), { status: 400 });
        }

        const variantImages = {};
        for (const [key, value] of body.entries()) {
            if (key.startsWith('variantImages-') && value instanceof File) {
                const index = key.split('-')[1];
                variantImages[index] = value;
            }
        }

        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
        }

        const updatedVariants = await Promise.all(variants.map(async (variant, index) => {
            const updatedVariant = {
                colors: variant.colors,
                sizes: variant.sizes,
                priceAdjustment: parseFloat(variant.priceAdjustment) || 0,
                stock: parseInt(variant.stock) || 0,
                imageUrl: '',
            };

            if (variantImages[index]) {
                // New image upload logic
                const buffer = await variantImages[index].arrayBuffer();
                const uploadResult = await uploadImage(Buffer.from(buffer));

                if (variant._id) {
                    const oldVariant = existingProduct.variants.find(v => v._id.toString() === variant._id);
                    if (oldVariant?.imageUrl) {
                        try {
                            await deleteImage(oldVariant.imageUrl);
                        } catch (e) {
                            return new Response(JSON.stringify({
                                error: `Failed to delete old image for variant ${variant._id}`
                            }), { status: 500 });
                        }
                    }
                }

                updatedVariant.imageUrl = uploadResult.secure_url;
            } else if (variant._id) {
                const oldVariant = existingProduct.variants.find(v => v._id.toString() === variant._id);
                if (oldVariant?.imageUrl && oldVariant.imageUrl.startsWith('http')) {
                    updatedVariant.imageUrl = oldVariant.imageUrl;
                } else {
                    updatedVariant.imageUrl = '';
                }
            }

            if (variant._id) {
                updatedVariant._id = variant._id;
            }

            return updatedVariant;
        }));

        // Ensure each variant has an imageUrl, either new or existing
        for (const updatedVariant of updatedVariants) {
            if (!updatedVariant.imageUrl && updatedVariant._id) {
                const oldVariant = existingProduct.variants.find(
                    v => v._id.toString() === updatedVariant._id
                );
                if (oldVariant?.imageUrl && oldVariant.imageUrl.startsWith('http')) {
                    updatedVariant.imageUrl = oldVariant.imageUrl;
                }
            }
        }


        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            {
                name,
                description,
                basePrice: price,
                category,
                variants: updatedVariants
            },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return new Response(JSON.stringify({ error: 'Failed to update product' }), { status: 500 });
        }

        await logActivity(Activities.productUpdated(updatedProduct, session.user));

        return new Response(JSON.stringify({
            message: 'Product updated successfully',
            product: updatedProduct
        }), { status: 200 });

    } catch (error) {
        return new Response(JSON.stringify({
            error: 'Failed to update product',
            details: error.message
        }), { status: 500 });
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
        return new Response(JSON.stringify({ error: 'Failed to delete product' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}