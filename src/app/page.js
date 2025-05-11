import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/product-card";



export default async function Home() {
  let error = null;
  let products = [];
  let loading = true;
  try {
    const res = await fetch(`${process.env.HOST}/api/products?page=1&limit=10`, {
      cache: "no-store",
    });
    if (!res.ok) {
      const errorData = await res.json();
      error = errorData.error || "Failed to fetch products";
    }
    const data = await res.json();
    products = data.data;
  } catch (error) {
      error = error.message || "An error occurred while fetching products";
  } finally {
      loading = false;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold text-red-500">Error: {error.message}</p>
      </div>
    );
  }
  if (!products || products.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold">No products found</p>
      </div>
    );
  }
  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[80vh] bg-[url('/fasion-image/product-1.webp')] bg-cover bg-center flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container relative z-10 px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Minimalist Essentials</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Timeless pieces designed for everyday wear.
          </p>
          <Button asChild size="lg">
            <Link href="/products">
              Shop Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container px-4 mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link href="/products" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-slate-50">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Our Philosophy</h2>
            <p className="text-slate-600 mb-8">
              We believe in creating clothing that transcends trends. Our pieces are designed with
              simplicity, quality, and versatility in mind—crafted to become staples in your wardrobe
              for years to come.
            </p>
            {/* <Button variant="outline" asChild>
              <Link href="/about">Learn More</Link>
            </Button> */}
          </div>
        </div>
      </section>
    </div>
  );
}