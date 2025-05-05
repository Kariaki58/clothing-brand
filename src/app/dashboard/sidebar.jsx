"use client"
import { Package, User, LogOut, PlusCircle, ListOrdered, Home } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Sidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();

    // Function to check if a link is active
    const isActive = (href) => {
        // For the dashboard home link, we need exact match
        if (href === "/dashboard") {
            return pathname === href;
        }
        // For other links, check if pathname starts with the href
        return pathname.startsWith(href);
    };

    return (
        <div className="lg:col-span-1">
            <div className="bg-slate-50 p-6 rounded-lg">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center">
                        <Image
                            src={session?.user?.avatar || "/profile/profile-12.svg.png"}
                            alt="User Avatar"
                            width={40}
                            height={40}
                            className="rounded-full"
                        />
                    </div>
                    <div>
                        <h3 className="font-medium">{session?.user?.name}</h3>
                        <p className="text-sm text-slate-500">Admin</p>
                    </div>
                </div>

                <nav className="space-y-1">
                    <Link
                        href="/dashboard"
                        className={`flex items-center space-x-3 px-3 py-2 rounded-md font-medium ${
                            isActive("/dashboard")
                                ? "bg-white text-slate-900"
                                : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        <Home className="h-5 w-5" />
                        <span>Dashboard</span>
                    </Link>
                    <Link
                        href="/dashboard/products"
                        className={`flex items-center space-x-3 px-3 py-2 rounded-md font-medium ${
                            isActive("/dashboard/products")
                                ? "bg-white text-slate-900"
                                : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        <Package className="h-5 w-5" />
                        <span>Products</span>
                    </Link>
                    <Link
                        href="/dashboard/orders"
                        className={`flex items-center space-x-3 px-3 py-2 rounded-md font-medium ${
                            isActive("/dashboard/orders")
                                ? "bg-white text-slate-900"
                                : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        <ListOrdered className="h-5 w-5" />
                        <span>Orders</span>
                    </Link>
                    <Link
                        href="/dashboard/new"
                        className={`flex items-center space-x-3 px-3 py-2 rounded-md font-medium ${
                            isActive("/dashboard/new")
                                ? "bg-white text-slate-900"
                                : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        <PlusCircle className="h-5 w-5" />
                        <span>Add Product</span>
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-md font-medium"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Sign Out</span>
                    </button>
                </nav>
            </div>
        </div>
    )
}