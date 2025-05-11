"use client";
import { Button } from "@/components/ui/button";
import { Star, ShoppingBag } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "../../../../store/cartStore";


export default function ProductActions({ product }) {
    const router = useRouter();
    const searchParams = useSearchParams();
  // Get all unique colors and sizes across variants
    const { uniqueColors, uniqueSizes } = useMemo(() => {
            const colors = new Set();
            const sizes = new Set();
            
            product.variants.forEach(variant => {
            variant.colors.forEach(color => colors.add(color));
            variant.sizes.forEach(size => sizes.add(size));
        });

        return {
            uniqueColors: Array.from(colors),
            uniqueSizes: Array.from(sizes)
        };
    }, [product]);

    // Filter only available variants (with stock > 0)
    const availableVariants = useMemo(() => {
        return product.variants.filter(variant => 
            variant.stock > 0 &&
            variant.colors.length > 0 && 
            variant.sizes.length > 0
        );
    }, [product]);

    useEffect(() => {
        const colorFromUrl = searchParams.get('color');
        
        if (!colorFromUrl && uniqueColors.length > 0) {
            const defaultColor = uniqueColors[0];
            const params = new URLSearchParams(searchParams);
            params.set('color', defaultColor);
            router.replace(`?${params.toString()}`, { scroll: false });
            setSelectedColor(defaultColor);
        } 
        else if (colorFromUrl && uniqueColors.includes(colorFromUrl)) {
            setSelectedColor(colorFromUrl);
        }
    }, [searchParams, uniqueColors, router]);

    
    // State for selections
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [error, setError] = useState(null);

    // Set initial selections based on available variants
    useEffect(() => {
        if (availableVariants.length > 0 && !selectedColor && !selectedSize) {
            const firstAvailable = availableVariants[0];
            setSelectedColor(firstAvailable.colors[0]);
            setSelectedSize(firstAvailable.sizes[0]);
        }
    }, [availableVariants, selectedColor, selectedSize]);

    // Get available sizes for selected color
    const availableSizesForColor = useMemo(() => {
        const sizes = new Set();
        availableVariants.forEach(variant => {

            if (variant.colors.includes(selectedColor)) {
                variant.sizes.forEach(size => sizes.add(size));
            }
        });
        return Array.from(sizes);
    }, [selectedColor, availableVariants]);

    // Get available colors for selected size
    const availableColorsForSize = useMemo(() => {
        const colors = new Set();
        availableVariants.forEach(variant => {
            if (variant.sizes.includes(selectedSize)) {
                variant.colors.forEach(color => colors.add(color));
            }
        });
        return Array.from(colors);
    }, [selectedSize, availableVariants]);

    // Get current variant based on selections
    const currentVariant = useMemo(() => {
        return availableVariants.find(variant => 
            variant.colors.includes(selectedColor) && 
            variant.sizes.includes(selectedSize)
        );
    }, [selectedColor, selectedSize, availableVariants]);

    // Handle color selection
    const handleColorSelect = (color) => {
        setSelectedColor(color);
        setError(null);
        
        // Update URL with selected color
        const params = new URLSearchParams(searchParams);
        params.set('color', color);
        router.replace(`?${params.toString()}`, { scroll: false });
    
        // Reset size if current selection isn't available
        if (!availableSizesForColor.includes(selectedSize)) {
            const firstAvailableSize = availableVariants.find(v => 
                v.colors.includes(color)
            )?.sizes?.[0];
            setSelectedSize(firstAvailableSize || null);
        }
    };

    // Handle size selection
    const handleSizeSelect = (size) => {
        setSelectedSize(size);
        setError(null);
        
        // Reset color if current selection isn't available
        if (!availableColorsForSize.includes(selectedColor)) {
            const firstAvailableColor = availableVariants.find(v => 
                v.sizes.includes(size)
            )?.colors?.[0];
            setSelectedColor(firstAvailableColor || null);
        }
    };

    const handleAddToCart = () => {
        if (!currentVariant) {
            setError("Please select available options");
            return;
        }
        
        if (quantity > currentVariant.stock) {
            setError(`Only ${currentVariant.stock} available`);
            return;
        }
        
        // Calculate final price
        const finalPrice = currentVariant.price 
            ? currentVariant.price 
            : product.basePrice + (currentVariant.priceAdjustment || 0);
        
        // Find the exact variant being added to get its specific image
        const selectedVariant = product.variants.find(variant => 
            variant.colors.includes(selectedColor) && 
            variant.sizes.includes(selectedSize)
        );
        
        useCartStore.getState().addItem({
            _id: `${product._id}-${currentVariant.id || currentVariant.sku}-${selectedColor}-${selectedSize}`,
            productId: product._id,
            variantId: currentVariant.id || currentVariant.sku,
            name: product.name,
            color: selectedColor,
            size: selectedSize,
            quantity,
            price: finalPrice,
            image: selectedVariant?.imageUrl || product.images[0], // Use variant image or fallback
            stock: currentVariant.stock
        });
    };

    const displayPrice = useMemo(() => {
        if (currentVariant) {
            if (currentVariant.price) {
                return currentVariant.price;
            }
            return product.basePrice + (currentVariant.priceAdjustment || 0);
        }
        return product.basePrice;
    }, [currentVariant, product.basePrice]);

    return (
        <div className="max-w-md">
            <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>

            <div className="flex items-center mt-2">
                <p className="text-2xl font-semibold text-slate-900">
                    ${displayPrice.toFixed(2)}
                </p>
                {(currentVariant?.price || currentVariant?.priceAdjustment !== 0) &&
                    displayPrice !== product.basePrice && (
                        <p className="ml-2 text-sm text-slate-500 line-through">
                            ${product.basePrice.toFixed(2)}
                        </p>
                    )}
            </div>

            <p className="text-slate-600 mt-4">{product.description}</p>

            {/* Color Selection */}
            <div className="mt-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-sm font-medium text-slate-900">Color</h2>
                    {selectedColor && (
                        <span className="text-xs text-slate-500">
                            Selected: {selectedColor}
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {uniqueColors.map((color) => {
                        const isAvailable = availableColorsForSize.includes(color);
                        const isSelected = selectedColor === color;
                        
                        // Convert color name to lowercase for CSS compatibility
                        const cssColor = color.toLowerCase();
                        
                        return (
                            <button
                                key={color}
                                onClick={() => isAvailable && handleColorSelect(color)}
                                disabled={!isAvailable}
                                style={{ backgroundColor: cssColor }}
                                className={`relative rounded-full h-10 w-10 border-2 flex items-center justify-center ${
                                    isSelected 
                                        ? "border-slate-900 ring-2 ring-offset-2 ring-slate-300" 
                                        : "border-slate-200"
                                } ${
                                    !isAvailable
                                        ? "opacity-50 cursor-not-allowed after:absolute after:inset-0 after:w-full after:h-[1px] after:bg-red-500 after:rotate-[-15deg] after:top-1/2 after:left-0"
                                        : "cursor-pointer hover:border-slate-400"
                                }`}
                                aria-label={color}
                                title={!isAvailable ? "Out of stock" : color}
                            >
                                {!isAvailable && (
                                    <span className="sr-only">Out of stock</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Size Selection */}
            <div className="mt-6">
                <div className="flex justify-between items-center">
                <h2 className="text-sm font-medium text-slate-900">Size</h2>
                {selectedSize && (
                    <span className="text-xs text-slate-500">
                    Selected: {selectedSize}
                    </span>
                )}
                </div>
                <div className="grid grid-cols-5 gap-2 mt-2">
                {uniqueSizes.map((size) => {
                    const isAvailable = availableSizesForColor.includes(size);
                    const isSelected = selectedSize === size;
                    
                    return (
                    <button
                        key={size}
                        onClick={() => isAvailable && handleSizeSelect(size)}
                        disabled={!isAvailable}
                        className={`px-3 py-2 text-sm font-medium border rounded-md flex items-center justify-center ${
                        isSelected
                            ? "bg-slate-900 text-white border-slate-900"
                            : "border-slate-200 hover:bg-slate-50"
                        } ${
                        !isAvailable
                            ? "opacity-50 cursor-not-allowed relative after:absolute after:inset-0 after:w-full after:h-[1px] after:bg-red-500 after:rotate-[-15deg] after:top-1/2 after:left-0"
                            : "cursor-pointer"
                        }`}
                        title={!isAvailable ? "Out of stock" : size}
                    >
                        {size}
                        {!isAvailable && (
                        <span className="sr-only">Out of stock</span>
                        )}
                    </button>
                    );
                })}
                </div>
            </div>

            {/* Stock Information */}
            {currentVariant && (
                <div className="mt-4 text-sm">
                {currentVariant.stock > 10 ? (
                    <p className="text-green-600">In stock</p>
                ) : currentVariant.stock > 0 ? (
                    <p className="text-amber-600">Only {currentVariant.stock} left!</p>
                ) : (
                    <p className="text-red-600">Out of stock</p>
                )}
                </div>
            )}

            {/* Quantity Selection */}
            <div className="mt-6">
                <h2 className="text-sm font-medium text-slate-900">Quantity</h2>
                <div className="flex items-center mt-2">
                <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-1 border border-slate-200 rounded-l-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    -
                </button>
                <div className="px-4 py-1 border-t border-b border-slate-200 text-center">
                    {quantity}
                </div>
                <button
                    onClick={() => setQuantity(Math.min(
                    quantity + 1, 
                    currentVariant?.stock || 10
                    ))}
                    disabled={quantity >= (currentVariant?.stock || 10)}
                    className="px-3 py-1 border border-slate-200 rounded-r-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    +
                </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <p className="mt-4 text-sm text-red-600">{error}</p>
            )}

            {/* Add to Cart Button */}
            <div className="mt-8 flex space-x-4">
                <Button 
                    size="lg" 
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={!currentVariant || currentVariant.stock <= 0}
                >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    {currentVariant?.stock <= 0 ? "Out of stock" : "Add to Cart"}
                </Button>
            </div>
        </div>
    );
}