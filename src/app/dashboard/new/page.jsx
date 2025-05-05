"use client";
import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDropzone } from 'react-dropzone';
import { X, Upload, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import CreatableSelect from './CreatableSelectClient';
import makeAnimated from 'react-select/animated';

// Zod schema for form validation
const productSchema = z.object({
    name: z.string().min(1, "Product name is required").max(100),
    description: z.string().min(1, "Description is required").max(1000),
    price: z.number().min(0.01, "Price must be at least $0.01"),
    category: z.string().min(1, "Category is required"),
    variants: z.array(
        z.object({
        image: z.instanceof(File).nullable(),
        colors: z.array(z.string()).min(1, "At least one color is required"),
        sizes: z.array(z.string()).min(1, "At least one size is required"),
        priceAdjustment: z.number().default(0),
        stock: z.number().min(0, "Stock cannot be negative").default(0),
        })
    ).min(1, "At least one variant is required"),
});

// Clothing-specific categories
const initialCategories = [
    "T-Shirts",
    "Shirts",
    "Pants",
    "Jeans",
    "Dresses",
    "Jackets",
    "Activewear",
    "Underwear",
    "Accessories"
];

// Default clothing sizes
const defaultSizes = [
    "XS", "S", "M", "L", "XL", "XXL", "XXXL",
    "28", "30", "32", "34", "36", "38", "40",
    "One Size"
];

// Default clothing colors
const defaultColors = [
    { value: "Black", label: "Black", color: "#000000" },
    { value: "White", label: "White", color: "#FFFFFF" },
    { value: "Red", label: "Red", color: "#FF0000" },
    { value: "Blue", label: "Blue", color: "#0000FF" },
    { value: "Green", label: "Green", color: "#008000" },
    { value: "Yellow", label: "Yellow", color: "#FFFF00" },
    { value: "Pink", label: "Pink", color: "#FFC0CB" },
    { value: "Purple", label: "Purple", color: "#800080" },
    { value: "Gray", label: "Gray", color: "#808080" },
    { value: "Brown", label: "Brown", color: "#A52A2A" },
];

const animatedComponents = makeAnimated();

export default function NewProduct() {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
    });
    const [categories, setCategories] = useState(initialCategories);
    const [colors, setColors] = useState(defaultColors);
    const [sizes, setSizes] = useState(defaultSizes.map(size => ({ value: size, label: size })));
    const [variants, setVariants] = useState([]);
    const [errors, setErrors] = useState({});
    const [isUploading, setIsUploading] = useState(false);

    const [newVariant, setNewVariant] = useState({
        image: null,
        colors: [],
        sizes: [],
        priceAdjustment: '0',
        stock: '0'
    });

    // Variant image upload handler
    const onVariantImageDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
        setNewVariant(prev => ({
            ...prev,
            image: acceptedFiles[0]
        }));
        toast.success('Variant image added');
        }
    }, []);

    const { getRootProps: getVariantRootProps, getInputProps: getVariantInputProps } = useDropzone({
        onDrop: onVariantImageDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
        maxFiles: 1,
        multiple: false
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
        ...prev,
        [name]: value
        }));
    };

    const handleAddVariant = () => {
        try {
        // Validate the new variant before adding
        const validatedVariant = {
            image: newVariant.image,
            colors: newVariant.colors.map(c => c.value),
            sizes: newVariant.sizes.map(s => s.value),
            priceAdjustment: parseFloat(newVariant.priceAdjustment) || 0,
            stock: parseInt(newVariant.stock) || 0
        };

        productSchema.pick({ variants: true }).parse({ variants: [validatedVariant] });

        setVariants(prev => [...prev, validatedVariant]);
        setNewVariant({
            image: null,
            colors: [],
            sizes: [],
            priceAdjustment: '0',
            stock: '0'
        });
        toast.success('Variant added');
        } catch (error) {
        if (error instanceof z.ZodError) {
            const variantErrors = {};
            error.errors.forEach(err => {
            const path = err.path[1]; // Get the field name
            variantErrors[path] = err.message;
            });
            toast.error(Object.values(variantErrors).join(', '));
        }
        }
    };

    const removeVariant = (index) => {
        setVariants(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            // Validate the entire form
            const validatedData = productSchema.parse({
                ...formData,
                price: parseFloat(formData.price),
                variants
            });

            const formDataToSend = new FormData();
            formDataToSend.append('name', validatedData.name);
            formDataToSend.append('description', validatedData.description);
            formDataToSend.append('price', validatedData.price.toString());
            formDataToSend.append('category', validatedData.category);
            
            formDataToSend.append('variants', JSON.stringify(
                validatedData.variants.map(v => ({
                colors: v.colors,
                sizes: v.sizes,
                priceAdjustment: v.priceAdjustment,
                stock: v.stock
                }))
            ));

            validatedData.variants.forEach((variant, index) => {
                if (variant.image) {
                formDataToSend.append(`variantImages-${index}`, variant.image);
                }
            });

            const response = await fetch('/api/products', {
                method: 'POST',
                body: formDataToSend,
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.error) {
                    throw new Error(errorData.error);
                }
                throw new Error('Failed to create product');
            }
            const result = await response.json();
            if (result.error) {
                throw new Error(result.error);
            }

            
            // Reset form
            setFormData({
                name: '',
                description: '',
                price: '',
                category: '',
            });
            setVariants([]);
            setErrors({});
            
            toast.success(result.message || 'Product created successfully');
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors = {};
                error.errors.forEach(err => {
                const path = err.path.join('.');
                newErrors[path] = err.message;
                });
                setErrors(newErrors);
                toast.error('Please fix the form errors');
            } else {
                console.error('Error creating product:', error);
                toast.error('Failed to create product');
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleCreateCategory = (inputValue) => {
        const newCategory = inputValue.trim();
        if (newCategory && !categories.includes(newCategory)) {
            setCategories(prev => [...prev, newCategory]);
            return newCategory;
        }
        return inputValue;
    };

    const handleCreateColor = (inputValue) => {
        const newColor = {
            value: inputValue,
            label: inputValue,
            color: '#cccccc'
        };
        setColors(prev => [...prev, newColor]);
        return newColor;
    };

    const handleCreateSize = (inputValue) => {
        const newSize = {
            value: inputValue,
            label: inputValue
        };
        setSizes(prev => [...prev, newSize]);
        return newSize;
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-6">Add New Clothing Product</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
            {/* Product Info */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="name" className="mb-2">Product Name *</Label>
                        <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Classic White T-Shirt"
                        className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>
                
                    <div>
                        <Label className="mb-2">Category *</Label>
                        <CreatableSelect
                        options={categories.map(cat => ({ value: cat, label: cat }))}
                        value={formData.category ? { value: formData.category, label: formData.category } : null}
                        onChange={(option) => setFormData(prev => ({
                            ...prev,
                            category: option?.value || ''
                        }))}
                        onCreateOption={handleCreateCategory}
                        placeholder="Select or create a category"
                        className={errors.category ? 'border-red-500 rounded-md' : ''}
                        classNamePrefix="select"
                        />
                        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                    </div>
                </div>
                
                <div>
                    <Label htmlFor="description" className="mb-2">Description *</Label>
                    <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe the fabric, fit, and features..."
                        rows={4}
                        className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="price" className="mb-2">Base Price *</Label>
                        <Input
                        id="price"
                        name="price"
                        type="number"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className={errors.price ? 'border-red-500' : ''}
                        />
                        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                    </div>
                </div>
            </div>
            
            {/* Variants Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-lg">Product Variants *</Label>
                    <p className="text-sm text-muted-foreground">
                        Add variants with combinations of colors and sizes
                    </p>
                </div>
                
                {variants.length > 0 && (
                <div className="border rounded-lg divide-y">
                    {variants.map((variant, index) => (
                        <div key={index} className="p-4">
                            <div className="flex flex-col md:flex-row items-start gap-4">
                            {/* Variant Image Preview */}
                            <div className="w-full md:w-24 h-24 flex-shrink-0">
                                {variant.image ? (
                                <div className="relative w-full h-full">
                                    <img
                                    src={URL.createObjectURL(variant.image)}
                                    alt={`Variant ${index + 1}`}
                                    className="w-full h-full object-cover rounded border"
                                    />
                                    <Button
                                    type="button"
                                    onClick={() => {
                                        setVariants(prev => prev.map((v, i) => 
                                        i === index ? {...v, image: null} : v
                                        ));
                                    }}
                                    variant="ghost"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background"
                                    >
                                    <X className="h-3 w-3" />
                                    </Button>
                                </div>
                                ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted rounded border">
                                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                </div>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow w-full">
                                <div>
                                <Label>Colors</Label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {variant.colors.map(color => {
                                    const colorData = colors.find(c => c.value === color);
                                    return (
                                        <div key={color} className="flex items-center gap-1">
                                        <div 
                                            className="w-5 h-5 rounded-full border" 
                                            style={{ backgroundColor: colorData?.color || '#ccc' }}
                                        />
                                        <span>{colorData?.label || color}</span>
                                        </div>
                                    );
                                    })}
                                </div>
                                </div>
                                
                                <div>
                                <Label>Sizes</Label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {variant.sizes.map(size => (
                                    <div key={size} className="px-2 py-1 bg-muted rounded">
                                        {size}
                                    </div>
                                    ))}
                                </div>
                                </div>
                                
                                <div className="space-y-2">
                                <div>
                                    <Label>Price Adjustment</Label>
                                    <p className="mt-1">
                                    {variant.priceAdjustment >= 0 
                                        ? `+$${variant.priceAdjustment.toFixed(2)}` 
                                        : `-$${Math.abs(variant.priceAdjustment).toFixed(2)}`}
                                    </p>
                                </div>
                                <div>
                                    <Label>Stock</Label>
                                    <p className="mt-1">{variant.stock}</p>
                                </div>
                                </div>
                            </div>
                            
                            <Button
                                type="button"
                                onClick={() => removeVariant(index)}
                                variant="ghost"
                                size="icon"
                                className="md:ml-4 mt-2 md:mt-0"
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                            </div>
                        </div>
                    ))}
                </div>
                )}
                
                <div className="border rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label>Colors *</Label>
                        <CreatableSelect
                            isMulti
                            options={colors}
                            value={newVariant.colors}
                            onChange={(selected) => setNewVariant(prev => ({
                            ...prev,
                            colors: selected || []
                            }))}
                            onCreateOption={handleCreateColor}
                            placeholder="Select or create colors"
                            className="basic-multi-select"
                            classNamePrefix="select"
                            components={animatedComponents}
                            formatOptionLabel={(option) => (
                            <div className="flex items-center gap-2">
                                <div 
                                className="w-4 h-4 rounded-full border" 
                                style={{ backgroundColor: option.color || '#ccc' }}
                                />
                                {option.label}
                            </div>
                            )}
                        />
                    </div>
                    
                    <div>
                        <Label>Sizes *</Label>
                        <CreatableSelect
                            isMulti
                            options={sizes}
                            value={newVariant.sizes}
                            onChange={(selected) => setNewVariant(prev => ({
                            ...prev,
                            sizes: selected || []
                            }))}
                            onCreateOption={handleCreateSize}
                            placeholder="Select or create sizes"
                            className="basic-multi-select"
                            classNamePrefix="select"
                            components={animatedComponents}
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="variant-price">Price Adjustment</Label>
                        <Input
                            id="variant-price"
                            type="number"
                            value={newVariant.priceAdjustment}
                            onChange={(e) => setNewVariant(prev => ({
                            ...prev,
                            priceAdjustment: e.target.value
                            }))}
                            placeholder="0.00"
                            step="0.01"
                        />
                    </div>
                    
                    <div>
                        <Label htmlFor="variant-stock">Stock</Label>
                        <Input
                            id="variant-stock"
                            type="number"
                            value={newVariant.stock}
                            onChange={(e) => setNewVariant(prev => ({
                            ...prev,
                            stock: e.target.value
                            }))}
                            placeholder="0"
                            min="0"
                        />
                    </div>
                </div>
                
                {/* Variant Image Upload */}
                <div>
                    <Label>Variant Image</Label>
                    <div
                        {...getVariantRootProps()}
                        className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer mt-1"
                    >
                        <input {...getVariantInputProps()} />
                        {newVariant.image ? (
                            <div className="flex items-center justify-center gap-2">
                                <img
                                    src={URL.createObjectURL(newVariant.image)}
                                    alt="Variant preview"
                                    className="h-16 w-16 object-cover rounded"
                                />
                                <p className="text-sm">{newVariant.image.name}</p>
                                <Button
                                    type="button"
                                    onClick={(e) => {
                                    e.stopPropagation();
                                    setNewVariant(prev => ({...prev, image: null}));
                                    }}
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center space-y-1">
                                <Upload className="h-5 w-5 text-muted-foreground" />
                                <p className="text-sm">Drag & drop or click to upload</p>
                                <p className="text-xs text-muted-foreground">
                                    JPG, PNG, WEBP (1 file)
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex justify-end">
                    <Button
                        type="button"
                        onClick={handleAddVariant}
                        variant="outline"
                        disabled={!newVariant.colors.length || !newVariant.sizes.length}
                    >
                    <Plus className="h-4 w-4 mr-2" />
                        Add Variant
                    </Button>
                </div>
                </div>
            </div>
            </div>
            
            <div className="flex justify-end gap-2">
            <Button type="button" variant="outline">
                Cancel
            </Button>
            <Button type="submit" disabled={isUploading || variants.length === 0}>
                {isUploading ? 'Uploading...' : 'Create Product'}
            </Button>
            </div>
        </form>
        </div>
    );
}