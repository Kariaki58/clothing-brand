import ProductImages from "./product-images";
import ProductActions from "./product-actions";
import { ChevronLeft } from "lucide-react";
import Product from "../../../../models/product";
import { connectToDatabase } from "@/lib/mongoose";
import Link from "next/link";

const getProduct = async (slug) => {
    try {
        await connectToDatabase();
        const product = await Product.findOne({ slug }).lean();
        return product;
    } catch (error) {
        return null;
    }
};


function sanitizeProduct(product) {
    return {
        ...product,
        _id: product._id?.toString(),
        variants: product.variants.map((variant) => ({
            ...variant,
            _id: variant._id?.toString(),
        })),
    };
}

export default async function ProductPage({ params }) {
    const slug = params.slug;
    const product = await getProduct(slug);

    if (!product) {
        return <div>Product not found</div>;
    }

    const sanitizedProduct = sanitizeProduct(product);

    return (
        <div className="py-8">
            <div className="container px-4 mx-auto">
                <Link
                    href="/products"
                    className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 mb-6"
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Products
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ProductImages 
                        variants={sanitizedProduct.variants} 
                        name={sanitizedProduct.name} 
                        selectedColor={sanitizedProduct.variants[0]?.colors?.[0]} 
                    />
                    <ProductActions product={sanitizedProduct} />
                </div>
            </div>
        </div>
    );
}
