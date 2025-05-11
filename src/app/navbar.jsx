"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useCartStore } from "../../store/cartStore";
import Image from "next/image";

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();
    const { items: cartItems } = useCartStore();
    const cartItemCount = cartItems.length;


    const links = [
        { name: "Home", href: "/" },
        { name: "Shop", href: "/products" },
        { name: "FAQ", href: "/faq" },
        { name: "Track Order", href: "/tracking" },
        { name: "Contact", href: "/contact" },
    ];

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-100">
            <div className="container flex items-center justify-between h-16 px-4 mx-auto">
                <Link href="/" className="text-xl font-bold">
                    ELEGANCE
                </Link>

                <nav className="hidden md:flex items-center space-x-8">
                    {links.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`text-sm font-medium transition-colors hover:text-slate-900 ${
                                pathname === link.href ? "text-slate-900" : "text-slate-500"
                            }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center space-x-4">
                    <Link href="/cart" className="relative">
                        <Button variant="ghost" size="icon">
                            <ShoppingBag className="h-5 w-5" />
                            {cartItemCount > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center  p-1 text-xs font-medium text-white bg-red-600 rounded-full">
                                    {cartItemCount}
                                </span>
                            )}
                        </Button>
                    </Link>

                    {session ? (
                        <div className="flex items-center space-x-4">
                            <Link href={session?.user?.role !== "admin" ? "/dashboard": "/dashboard"}>
                                <Button variant="ghost" size="icon" className="p-0">
                                    {session.user?.avatar ? (
                                        <div className="relative h-8 w-8 rounded-full overflow-hidden">
                                            <Image
                                                src={session.user.avatar}
                                                alt="User avatar"
                                                width={32}
                                                height={32}
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <User className="h-5 w-5" />
                                    )}
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Link href="/auth/login">
                            <Button variant="outline">Login</Button>
                        </Link>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>
            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-slate-100">
                    <div className="container px-4 py-3">
                        <nav className="flex flex-col space-y-3">
                            {links.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`text-sm font-medium transition-colors hover:text-slate-900 ${
                                        pathname === link.href ? "text-slate-900" : "text-slate-500"
                                    }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            {session && (
                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="text-sm font-medium text-slate-500 hover:text-slate-900 text-left"
                                >
                                    Sign Out
                                </button>
                            )}
                        </nav>
                    </div>
                </div>
            )}
        </header>
    );
}