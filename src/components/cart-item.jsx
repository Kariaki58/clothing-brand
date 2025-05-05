"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function CartItem({ item, onRemove, onQuantityChange }) {
    return (
        <div className="py-4 grid grid-cols-5 gap-4 items-center">
            <div className="col-span-2 flex items-center">
                <div className="relative h-16 w-16 rounded-md overflow-hidden">
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover object-center"
                    />
                </div>
                <div className="ml-4">
                    <h3 className="text-sm font-medium text-slate-900">{item.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                        {item.color} / {item.size}
                    </p>
                </div>
            </div>
            <div className="text-sm font-medium text-slate-900">
                ${item.price.toFixed(2)}
            </div>
            <div>
                <select
                    value={item.quantity}
                    onChange={(e) => onQuantityChange(parseInt(e.target.value))}
                    className="max-w-full rounded-md border border-slate-300 py-1.5 text-left text-sm font-medium text-slate-700 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                >
                    {[1, 2, 3, 4, 5].map((quantity) => (
                        <option key={quantity} value={quantity}>
                            {quantity}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">
                    ${(item.price * item.quantity).toFixed(2)}
                </span>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onRemove}
                    aria-label="Remove item"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}