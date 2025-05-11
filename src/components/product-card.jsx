"use client";
import Link from "next/link";
import Image from "next/image";

export default function ProductCard({ product }) {
    const isOnSale = product.originalPrice && product.originalPrice > product.price;
    return (
        <div className="group relative">
            <div className="w-full h-[400px] overflow-hidden rounded-md bg-slate-100 group-hover:opacity-75 relative">
                {isOnSale && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        SALE
                    </span>
                )}
                <Image
                    src={product.variants[0].imageUrl}
                    alt={product.name}
                    width={600}
                    height={600}
                    className="object-cover object-center w-full h-full"
                />
            </div>
            <div className="mt-4 flex justify-between">
                <div>
                <h3 className="text-sm font-medium text-slate-900">
                    <Link href={`/products/${product.slug}`}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {product.name}
                    </Link>
                </h3>
                <p className="mt-1 text-sm text-slate-500">{product.category}</p>
                </div>
                <div className="text-right">
                {isOnSale && (
                    <p className="text-sm text-slate-500 line-through">
                        ${product.originalPrice.toFixed(2)}
                    </p>
                )}
                <p className="text-sm font-medium text-slate-900">
                    ${product.basePrice.toFixed(2)}
                </p>
                </div>
            </div>
        </div>
    );
}