"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";


export default function ProductImages({ variants, name }) {
    const [currentImage, setCurrentImage] = useState(variants[0].imageUrl);
    const searchParams = useSearchParams();

    useEffect(() => {
        const colorFromUrl = searchParams.get('color');
        if (colorFromUrl) {
            const variantWithColor = variants.find(v => 
                v.colors.includes(colorFromUrl)
            );
            if (variantWithColor) {
                setCurrentImage(variantWithColor.imageUrl);
            }
        }
    }, [searchParams, variants]);

    return (
        <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-slate-100">
                <Image
                    src={currentImage}
                    alt={name}
                    width={800}
                    height={800}
                    className="object-cover object-center w-full h-full"
                    priority
                />
            </div>
            <div className="grid grid-cols-3 gap-4">
                {variants.map((data, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentImage(data.imageUrl)}
                        className={`aspect-square overflow-hidden rounded-lg bg-slate-100 ${
                            currentImage === data.imageUrl ? "ring-2 ring-slate-900" : ""
                        }`}
                    >
                        <Image
                            src={data.imageUrl}
                            alt={`${name} - ${index + 1}`}
                            width={300}
                            height={300}
                            className="object-cover object-center w-full h-full"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}