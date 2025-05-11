import ProductImages from "./product-images";
import ProductActions from "./product-actions";
import { ChevronLeft, Star, StarHalf } from "lucide-react";
import Product from "../../../../models/product";
import { connectToDatabase } from "@/lib/mongoose";
import Link from "next/link";
import { Suspense } from "react";
import Image from "next/image";

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
    const slug = (await params).slug;
    const product = await getProduct(slug);
    let error = null;
    let reviews = [];
    let averageRating = 0;
    const ratingDistribution = [0, 0, 0, 0, 0]; // For 1-5 stars

    try {
        const response = await fetch(`${process.env.HOST}/api/review/${product._id}`);
        if (!response.ok) {
            error = "Could not load reviews";
        } else {
            const data = await response.json();
            reviews = data;
            
            // Calculate average rating and distribution
            if (reviews.length > 0) {
                const total = reviews.reduce((sum, review) => {
                    ratingDistribution[review.rating - 1]++;
                    return sum + review.rating;
                }, 0);
                averageRating = (total / reviews.length).toFixed(1);
            }
        }
    } catch (err) {
        console.error("Error fetching reviews:", err);
        error = "Error loading reviews";
    }

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
                    <Suspense fallback={<div>Loading images...</div>}>
                        <ProductImages 
                            variants={sanitizedProduct.variants} 
                            name={sanitizedProduct.name} 
                            selectedColor={sanitizedProduct.variants[0]?.colors?.[0]} 
                        />
                    </Suspense>
                    <ProductActions product={sanitizedProduct} />
                </div>

                {/* Enhanced Reviews Section */}
                <div className="mt-16 border-t border-gray-200 pt-10">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
                        
                        {/* Rating Overview */}
                        <div className="flex flex-col md:flex-row gap-12 mb-12">
                            <div className="flex flex-col items-center bg-gray-50 p-6 rounded-xl w-full md:w-auto">
                                <div className="text-5xl font-bold text-gray-900 mb-2">
                                    {averageRating}
                                </div>
                                <div className="flex mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                        const isFilled = star <= Math.floor(averageRating);
                                        const isHalf = !isFilled && (star - 0.5 <= averageRating);
                                        return (
                                            <div key={star} className="relative">
                                                <Star className={`h-6 w-6 ${isFilled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                                {isHalf && (
                                                    <StarHalf className="h-6 w-6 text-yellow-400 fill-yellow-400 absolute top-0" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="text-gray-600 text-sm">
                                    Based on {reviews.length} reviews
                                </div>
                            </div>

                            {/* Rating Distribution */}
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold mb-4">Rating Breakdown</h3>
                                <div className="space-y-3">
                                    {[5, 4, 3, 2, 1].map((star) => (
                                        <div key={star} className="flex items-center">
                                            <div className="w-10 text-gray-700 font-medium">{star} star</div>
                                            <div className="flex-1 mx-2 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-yellow-400" 
                                                    style={{
                                                        width: `${(ratingDistribution[star-1] / reviews.length) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="w-10 text-gray-500 text-sm text-right">
                                                {ratingDistribution[star-1]}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Review List */}
                        <div className="space-y-8">
                            {reviews.length === 0 ? (
                                <div className="text-center py-16 bg-gray-50 rounded-xl">
                                    <p className="text-gray-500 text-lg mb-4">No reviews yet</p>
                                </div>
                            ) : (
                                reviews.map((review) => (
                                    <div
                                        key={review._id}
                                        className="border border-gray-100 rounded-xl p-6 hover:shadow-sm transition-shadow"
                                    >
                                        <div className="flex justify-between mb-3">
                                            <div className="flex items-center">
                                                <div className="flex mr-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`h-5 w-5 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-gray-500 text-sm">
                                                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="text-sm font-medium text-gray-700">
                                                {review.name}
                                            </div>
                                        </div>
                                        <p className="text-gray-700 mb-4">{review.comment}</p>
                                        {review.image && (
                                            <div className="w-32 h-32 relative rounded-lg overflow-hidden border border-gray-200">
                                                <Image
                                                    src={review.image}
                                                    alt="Review image"
                                                    fill
                                                    className="object-cover"
                                                    sizes="128px"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}