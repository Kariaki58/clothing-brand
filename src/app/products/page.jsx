import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/product-card";


export default async function ProductsPage({ searchParams }) {
    const searchData = await searchParams
    const currentPage = Number(searchData.page) || 1;
    const categoryFilter = searchData.category || "All";

    console.log(searchData)

    const itemsPerPage = 8;

    let products = [];
    let categories = [];
    let error = null;

    try {
        const response = await fetch(`${process.env.HOST}/api/products`);
        const response2 = await fetch(`${process.env.HOST}/api/category`);

        if (!response.ok || !response2.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        products = data.data;
        categories = await response2.json();

        console.log({products})


    } catch (error) {
        error = error.message || "An error occurred while fetching products";
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-lg font-semibold text-red-500">Error: {error}</p>
            </div>
        );
    }

    // Filter products by category
    const filteredProducts =
        categoryFilter === "All"
        ? products
        : products.filter((product) => product.category === categoryFilter);

    // Pagination logic
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = filteredProducts.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    return (
        <div className="py-8">
            <div className="container px-4 mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <h1 className="text-2xl font-bold">Shop</h1>
                    <div className="mt-4 md:mt-0">
                        <p className="text-sm text-slate-500">
                            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredProducts.length)} of{" "}
                            {filteredProducts.length} products
                        </p>
                    </div>
                </div>
                {/* Category filters */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <Link
                        href={`/products`}
                        className={`px-4 py-2 text-sm rounded-full border ${
                            categoryFilter === "All" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                    >
                        All
                    </Link>
                    {categories.map((category) => (
                        <Link
                            key={category._id}
                            href={`/products?category=${category.name === "All" ? "" : category.name}`}
                            className={`px-4 py-2 text-sm rounded-full border ${
                                categoryFilter === category.name || (category.name === "All" && !categoryFilter)
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                            {category.name}
                        </Link>
                    ))}
                </div>
                {/* Products grid */}
                {paginatedProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {paginatedProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-slate-500">No products found in this category.</p>
                            <Link href="/products">
                                <Button variant="outline" className="mt-4">
                                    Clear filters
                                </Button>
                            </Link>
                        </div>
                    )
                }

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-12">
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="icon"
                                asChild
                                disabled={currentPage <= 1}
                            >
                                <Link
                                    href={{
                                        pathname: "/products",
                                        query: {
                                        ...(categoryFilter !== "All" && { category: categoryFilter }),
                                        page: currentPage - 1,
                                        },
                                    }}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Link>
                            </Button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="icon"
                                    asChild
                                >
                                <Link
                                    href={{
                                    pathname: "/products",
                                    query: {
                                        ...(categoryFilter !== "All" && { category: categoryFilter }),
                                        page,
                                    },
                                    }}
                                >
                                    {page}
                                </Link>
                                </Button>
                            ))}

                            <Button
                                variant="outline"
                                size="icon"
                                asChild
                                disabled={currentPage >= totalPages}
                            >
                                <Link
                                    href={{
                                        pathname: "/products",
                                        query: {
                                        ...(categoryFilter !== "All" && { category: categoryFilter }),
                                        page: currentPage + 1,
                                        },
                                    }}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}