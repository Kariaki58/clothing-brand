import Link from "next/link";
import { Instagram, Twitter, Facebook } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-slate-50 border-t border-slate-100 py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-lg font-bold mb-4">ELEGANCE</h3>
                        <p className="text-slate-600 text-sm">
                            Minimalist clothing for the modern individual.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold mb-4">SHOP</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/products" className="text-slate-600 text-sm hover:text-slate-900">
                                All Products
                                </Link>
                            </li>
                            <li>
                                <Link href="/products?category=men" className="text-slate-600 text-sm hover:text-slate-900">
                                Men
                                </Link>
                            </li>
                            <li>
                                <Link href="/products?category=women" className="text-slate-600 text-sm hover:text-slate-900">
                                Women
                                </Link>
                            </li>
                            <li>
                                <Link href="/products?category=accessories" className="text-slate-600 text-sm hover:text-slate-900">
                                Accessories
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold mb-4">HELP</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/faq" className="text-slate-600 text-sm hover:text-slate-900">
                                FAQ
                                </Link>
                            </li>
                            <li>
                                <Link href="/tracking" className="text-slate-600 text-sm hover:text-slate-900">
                                Track Order
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-slate-600 text-sm hover:text-slate-900">
                                Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold mb-4">CONNECT</h4>
                        <div className="flex space-x-4">
                            <Link href="#" className="text-slate-600 hover:text-slate-900">
                                <Instagram className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-slate-600 hover:text-slate-900">
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-slate-600 hover:text-slate-900">
                                <Facebook className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="border-t border-slate-200 mt-8 pt-8 text-center text-sm text-slate-500">
                    <p>© {new Date().getFullYear()} Elegance. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}