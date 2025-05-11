"use client";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Plus, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import React from "react";
import { useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 10;

export default function DashboardProduct() {
    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [expandedRows, setExpandedRows] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/products?page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (!data.data || !Array.isArray(data.data)) {
                    throw new Error('Invalid data format');
                }
                
                setProducts(data.data);
                setTotalProducts(data.pagination.total);
                setTotalPages(data.pagination.totalPages);
            } catch (error) {
                toast.error('Failed to load products. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [currentPage]);

    const handleDelete = async (productId) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        
        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.error) {
                    toast.error(errorData.error);
                } else {
                    toast.error('Failed to delete product. Please try again.');
                }
                return
            }
            
            // Refresh the product list
            const newProducts = products.filter(p => p._id !== productId);
            setProducts(newProducts);
            
            // Reset to first page if we deleted the last item on current page
            if (newProducts.length === 0 && currentPage > 1) {
                setCurrentPage(1);
            } else {
                // Re-fetch to update pagination
                const res = await fetch(`/api/products?page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
                const data = await res.json();
                setProducts(data.data);
                setTotalProducts(data.pagination.total);
                setTotalPages(data.pagination.totalPages);
            }
            
            toast.success('Product deleted successfully');
        } catch (error) {
            toast.error('Failed to delete product. Please try again.');
        }
    };

    const toggleExpand = (productId) => {
        setExpandedRows(prev => ({
            ...prev,
            [productId]: !prev[productId],
        }));
    };

    const handlePrevious = () => currentPage > 1 && setCurrentPage(currentPage - 1);
    const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
    const handlePageChange = (page) => setCurrentPage(page);

    const getPaginationItems = () => {
        const items = [];
        const maxVisiblePages = typeof window !== 'undefined' && window.innerWidth < 640 ? 3 : 5;
        
        // Always show first page
        items.push(1);
        
        // Show ellipsis if current page is beyond the visible range
        if (currentPage > maxVisiblePages) {
            items.push('...');
        }
        
        // Calculate range of pages to show
        let start = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
        let end = Math.min(totalPages - 1, start + maxVisiblePages - 1);
        
        // Adjust if we're at the end
        if (end === totalPages - 1) {
            start = Math.max(2, totalPages - maxVisiblePages + 1);
        }
        
        // Add page numbers
        for (let i = start; i <= end; i++) {
            if (i > 1 && i < totalPages) items.push(i);
        }
        
        // Show ellipsis if there are more pages after
        if (currentPage < totalPages - (maxVisiblePages - 1)) {
            items.push('...');
        }
        
        // Always show last page if there is more than one page
        if (totalPages > 1) {
            items.push(totalPages);
        }
        
        return items;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold">Products</h1>
                <Link href="/dashboard/products/new" passHref>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Product</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <React.Fragment key={product._id}>
                                <TableRow key={product._id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => toggleExpand(product._id)}
                                                className="text-gray-500 hover:text-gray-800 focus:outline-none"
                                                aria-label={expandedRows[product._id] ? "Collapse details" : "Expand details"}
                                            >
                                                {expandedRows[product._id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                            {product.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        ${product.basePrice.toFixed(2)}
                                        {product.variants.length > 0 && (
                                            <>
                                                <br />
                                                <span className="text-xs text-muted-foreground">
                                                    +${Math.max(...product.variants.map(v => v.priceAdjustment || 0)).toFixed(2)} max adj.
                                                </span>
                                            </>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {product.variants.reduce((sum, variant) => sum + variant.stock, 0)}
                                        <br />
                                        <span className="text-xs text-muted-foreground">
                                            {product.variants.length} variant{product.variants.length !== 1 ? "s" : ""}
                                        </span>
                                    </TableCell>
                                    <TableCell>{product.category || 'Uncategorized'}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            product.isActive ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                        }`}>
                                            {product.isActive ? "Published" : "Draft"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link 
                                                        href={`/dashboard/new?id=${product._id}`} 
                                                        className="flex items-center cursor-pointer"
                                                        passHref
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                    onSelect={() => handleDelete(product._id)}
                                                >
                                                    <div className="flex items-center w-full">
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </div>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>

                                {expandedRows[product._id] && product.variants.map((variant, i) => (
                                    <TableRow key={`${product._id}-variant-${i}`} className="bg-muted/20">
                                        <TableCell colSpan={6}>
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                                {variant.imageUrl && (
                                                    <img
                                                        src={variant.imageUrl}
                                                        alt={variant.name}
                                                        className="w-16 h-16 object-cover rounded-md border"
                                                        loading="lazy"
                                                    />
                                                )}
                                                <div className="space-y-1">
                                                    <p className="font-semibold">{variant.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Price Adj: ${(variant.priceAdjustment || 0).toFixed(2)} | Stock: {variant.stock}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </React.Fragment>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                <div className="text-sm text-muted-foreground">
                    Showing{" "}
                    <strong>
                        {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalProducts)}
                    </strong>{" "}
                    of <strong>{totalProducts}</strong> products
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                        className="hidden sm:inline-flex"
                        aria-label="Previous page"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                        {getPaginationItems().map((item, index) =>
                            item === '...' ? (
                                <span key={`ellipsis-${index}`} className="px-2 py-1">...</span>
                            ) : (
                                <Button
                                    key={item}
                                    variant={currentPage === item ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handlePageChange(item)}
                                    className="min-w-[2.5rem]"
                                    aria-label={`Page ${item}`}
                                    aria-current={currentPage === item ? "page" : undefined}
                                >
                                    {item}
                                </Button>
                            )
                        )}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        className="hidden sm:inline-flex"
                        aria-label="Next page"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    <div className="flex sm:hidden gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            aria-label="Next page"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}