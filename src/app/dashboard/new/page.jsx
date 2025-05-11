"use client";
import { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDropzone } from 'react-dropzone';
import { X, Upload, Plus, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import CreatableSelect from './CreatableSelectClient';
import makeAnimated from 'react-select/animated';
import { useSearchParams } from 'next/navigation';

// Zod schema for form validation
const productSchema = z.object({
    name: z.string().min(1, "Product name is required").max(100),
    description: z.string().min(1, "Description is required").max(1000),
    price: z.number().min(0.01, "Price must be at least $0.01"),
    category: z.string().min(1, "Category is required"),
    variants: z.array(
        z.object({
            _id: z.string().optional(),
            image: z.union([z.instanceof(File), z.string()]).nullable(),
            colors: z.array(z.string()).min(1, "At least one color is required"),
            sizes: z.array(z.string()).min(1, "At least one size is required"),
            priceAdjustment: z.number().default(0),
            stock: z.number().min(0, "Stock cannot be negative").default(0),
            imageUrl: z.string().optional()
        })
    ).min(1, "At least one variant is required"),
});

// Clothing-specific categories
const initialCategories = [
    "T-Shirts", "Shirts", "Pants", "Jeans", "Dresses", 
    "Jackets", "Activewear", "Underwear", "Accessories"
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
    const searchParams = useSearchParams();
    const productId = searchParams.get('id');
    const [isLoading, setIsLoading] = useState(!!productId);
    
    const [formData, setFormData] = useState({
        _id: '',
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
    const [editingVariantIndex, setEditingVariantIndex] = useState(null);

    const [newVariant, setNewVariant] = useState({
        _id: '',
        image: null,
        colors: [],
        sizes: [],
        priceAdjustment: '0',
        stock: '0',
        imageUrl: ''
    });

    // Fetch product data if in edit mode
    useEffect(() => {
        if (!productId) return;

        const fetchProduct = async () => {
            try {
                const response = await fetch(`/api/products/${productId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch product');
                }
                const product = await response.json();
                
                setFormData({
                    _id: product._id,
                    name: product.name,
                    description: product.description,
                    price: product.basePrice.toString(),
                    category: product.category
                });
                
                setVariants(product.variants.map(v => ({
                    _id: v._id,
                    colors: v.colors,
                    sizes: v.sizes,
                    priceAdjustment: v.priceAdjustment.toString(),
                    stock: v.stock.toString(),
                    imageUrl: v.imageUrl,
                    image: null // Initialize as null - we'll handle images separately
                })));
                
            } catch (error) {
                toast.error('Failed to load product data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    // Variant image upload handler
    const onVariantImageDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            const imageUrl = URL.createObjectURL(file); // Create preview URL
            
            if (editingVariantIndex !== null) {
                setVariants(prev => prev.map((variant, index) => 
                    index === editingVariantIndex ? { 
                        ...variant, 
                        image: file,
                        imageUrl: imageUrl // Store preview URL
                    } : variant
                ));
            } else {
                setNewVariant(prev => ({
                    ...prev,
                    image: file,
                    imageUrl: imageUrl // Store preview URL
                }));
            }
            toast.success('Variant image added');
        }
    }, [editingVariantIndex]);

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
                _id: newVariant._id,
                image: newVariant.image,
                colors: newVariant.colors.map(c => c.value),
                sizes: newVariant.sizes.map(s => s.value),
                priceAdjustment: parseFloat(newVariant.priceAdjustment) || 0,
                stock: parseInt(newVariant.stock) || 0,
                imageUrl: newVariant.imageUrl
            };

            productSchema.pick({ variants: true }).parse({ variants: [validatedVariant] });

            setVariants(prev => [...prev, validatedVariant]);
            resetVariantForm();
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

    const handleUpdateVariant = () => {
        try {
            // Validate the updated variant
            const validatedVariant = {
                _id: newVariant._id,
                image: newVariant.image,
                colors: newVariant.colors.map(c => c.value),
                sizes: newVariant.sizes.map(s => s.value),
                priceAdjustment: parseFloat(newVariant.priceAdjustment) || 0,
                stock: parseInt(newVariant.stock) || 0,
                imageUrl: newVariant.imageUrl
            };

            productSchema.pick({ variants: true }).parse({ variants: [validatedVariant] });

            setVariants(prev => prev.map((variant, index) => 
                index === editingVariantIndex ? validatedVariant : variant
            ));
            
            resetVariantForm();
            toast.success('Variant updated');
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

    const editVariant = (index) => {
        const variant = variants[index];
        setNewVariant({
            _id: variant._id || '',
            image: variant.image || null,
            colors: variant.colors.map(color => {
                const found = colors.find(c => c.value === color);
                return found || { value: color, label: color, color: '#cccccc' };
            }),
            sizes: variant.sizes.map(size => ({ value: size, label: size })),
            priceAdjustment: variant.priceAdjustment.toString(),
            stock: variant.stock.toString(),
            imageUrl: variant.imageUrl || ''
        });
        setEditingVariantIndex(index);
    };

    const removeVariant = (index) => {
        setVariants(prev => prev.filter((_, i) => i !== index));
        if (editingVariantIndex === index) {
            resetVariantForm();
        } else if (editingVariantIndex > index) {
            setEditingVariantIndex(prev => prev - 1);
        }
    };

    const removeVariantImage = (index) => {
        setVariants(prev => prev.map((variant, i) => 
            i === index ? { ...variant, image: null, imageUrl: '' } : variant
        ));
    };

    const removeNewVariantImage = () => {
        setNewVariant(prev => ({ ...prev, image: null, imageUrl: '' }));
    };

    const resetVariantForm = () => {
        setNewVariant({
            _id: '',
            image: null,
            colors: [],
            sizes: [],
            priceAdjustment: '0',
            stock: '0',
            imageUrl: ''
        });
        setEditingVariantIndex(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);

        try {
            // Prepare form data
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('category', formData.category);
            
            // Include _id if editing
            if (formData._id) {
                formDataToSend.append('_id', formData._id);
            }

            // Prepare variants data
            const variantsData = variants.map((variant, index) => {
                const variantObj = {
                    _id: variant._id,
                    colors: variant.colors,
                    sizes: variant.sizes,
                    priceAdjustment: parseFloat(variant.priceAdjustment) || 0,
                    stock: parseInt(variant.stock) || 0,
                    imageUrl: variant.imageUrl
                };
                
                // Only include image if it's a new file (not a URL)
                if (variant.image instanceof File) {
                    formDataToSend.append(`variantImages-${index}`, variant.image);
                }
                
                return variantObj;
            });
            
            formDataToSend.append('variants', JSON.stringify(variantsData));
            
            let response;
            if (productId) {
                response = await fetch(`/api/products/${productId}`, {
                    method: 'PUT',
                    body: formDataToSend,
                });
            } else {
                response = await fetch('/api/products/', {
                    method: 'POST',
                    body: formDataToSend,
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                toast.success("Failed to save product");
                return;
            }

            const result = await response.json();
            
            // Redirect to edit page if this was a new product
            if (!productId && result.productId) {
                window.location.href = `/dashboard/new?id=${result.productId}`;
            }
            
            toast.success(result.message || 'Product saved successfully');
            // reset form
            setFormData({
                _id: '',
                name: '',
                description: '',
                price: '',
                category: '',
            });
            setVariants([]);
        } catch (error) {
            toast.error(error.message || 'Failed to save product');
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            <h1 className="text-2xl font-bold mb-6">
                {productId ? 'Edit Product' : 'Add New Clothing Product'}
            </h1>
            
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
                        </div>
                        
                        {variants.length > 0 && (
                            <div className="border rounded-lg divide-y">
                                {variants.map((variant, index) => (
                                    <div key={index} className="p-4">
                                        <div className="flex flex-col md:flex-row items-start gap-4">
                                            {/* Variant Image Preview */}
                                            <div className="w-full md:w-24 h-24 flex-shrink-0">
                                                {variant.imageUrl ? (
                                                    <div className="relative w-full h-full">
                                                        <img
                                                            src={variant.imageUrl}
                                                            alt={`Variant ${index + 1}`}
                                                            className="w-full h-full object-cover rounded border"
                                                        />
                                                    </div>
                                                ) : variant.image ? (
                                                    <div className="relative w-full h-full">
                                                        <img
                                                            src={URL.createObjectURL(variant.image)}
                                                            alt={`Variant ${index + 1}`}
                                                            className="w-full h-full object-cover rounded border"
                                                        />
                                                        <Button
                                                            type="button"
                                                            onClick={() => removeVariantImage(index)}
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div 
                                                        {...getVariantRootProps()}
                                                        className="w-full h-full flex items-center justify-center bg-muted rounded border cursor-pointer"
                                                    >
                                                        <input {...getVariantInputProps()} />
                                                        <div className="text-center">
                                                            <Upload className="h-5 w-5 mx-auto text-muted-foreground" />
                                                            <p className="text-xs mt-1">Upload Image</p>
                                                        </div>
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
                                                                    <span className="text-sm">{colorData?.label || color}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <Label>Sizes</Label>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {variant.sizes.map(size => (
                                                            <div key={size} className="px-2 py-1 bg-muted rounded text-sm">
                                                                {size}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <div>
                                                        <Label>Price Adjustment</Label>
                                                        <Input
                                                            type="number"
                                                            value={variant.priceAdjustment}
                                                            onChange={(e) => {
                                                                setVariants(prev => prev.map((v, i) => 
                                                                    i === index ? {...v, priceAdjustment: e.target.value} : v
                                                                ));
                                                            }}
                                                            placeholder="0.00"
                                                            step="0.01"
                                                            className="w-full"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label>Stock</Label>
                                                        <Input
                                                            type="number"
                                                            value={variant.stock}
                                                            onChange={(e) => {
                                                                setVariants(prev => prev.map((v, i) => 
                                                                    i === index ? {...v, stock: e.target.value} : v
                                                                ));
                                                            }}
                                                            placeholder="0"
                                                            min="0"
                                                            className="w-full"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-2 md:ml-4 mt-2 md:mt-0">
                                                <Button
                                                    type="button"
                                                    onClick={() => editVariant(index)}
                                                    variant="outline"
                                                    size="icon"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                    </svg>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={() => removeVariant(index)}
                                                    variant="ghost"
                                                    size="icon"
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="border rounded-lg p-4 space-y-4">
                            <h3 className="font-medium">
                                {editingVariantIndex !== null ? 
                                    `Editing Variant ${editingVariantIndex + 1}` : 
                                    'Add New Variant'}
                            </h3>
                            
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
                                            <p className="text-sm">
                                                {newVariant.image instanceof File ? 
                                                    newVariant.image.name : 
                                                    'Selected Image'}
                                            </p>
                                            <Button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeNewVariantImage();
                                                }}
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ) : newVariant.imageUrl ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <img
                                                src={newVariant.imageUrl}
                                                alt="Variant preview"
                                                className="h-16 w-16 object-cover rounded"
                                            />
                                            <Button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setNewVariant(prev => ({...prev, imageUrl: ''}));
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
                            
                            <div className="flex justify-end gap-2">
                                {editingVariantIndex !== null && (
                                    <Button
                                        type="button"
                                        onClick={resetVariantForm}
                                        variant="outline"
                                    >
                                        Cancel Edit
                                    </Button>
                                )}
                                
                                <Button
                                    type="button"
                                    onClick={editingVariantIndex !== null ? handleUpdateVariant : handleAddVariant}
                                    variant="outline"
                                    disabled={!newVariant.colors.length || !newVariant.sizes.length}
                                >
                                    {editingVariantIndex !== null ? (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                            </svg>
                                            Update Variant
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Variant
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline">
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={isUploading || variants.length === 0}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {productId ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            productId ? 'Update Product' : 'Create Product'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}