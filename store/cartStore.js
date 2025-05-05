"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => {
                const existingItemIndex = get().items.findIndex(
                (cartItem) =>
                    cartItem._id === item._id &&
                    cartItem.color === item.color &&
                    cartItem.size === item.size
                );

                if (existingItemIndex >= 0) {
                    const updatedItems = [...get().items];
                    updatedItems[existingItemIndex].quantity += item.quantity;
                    return set({ items: updatedItems });
                } else {
                    return set({ items: [...get().items, {
                        _id: item._id || `${item.productId}-${item.variantId}-${item.color}-${item.size}`,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        size: item.size,
                        color: item.color,
                        quantity: item.quantity,
                        ...(item.productId && { productId: item.productId }),
                        ...(item.variantId && { variantId: item.variantId }),
                        ...(item.stock && { stock: item.stock }),
                    }] });
                }
            },
            removeItem: (itemId) => {
                return set({
                    items: get().items.filter((item) => item._id !== itemId),
                });
            },
            updateQuantity: (itemId, newQuantity) => {
                const updatedItems = get().items.map((item) => {
                    if (item._id === itemId) {
                        return { ...item, quantity: newQuantity };
                    }
                    return item;
                });
                return set({ items: updatedItems });
            },
            clearCart: () => {
                return set({ items: [] });
            },
            getTotalItems: () => {
                return get().items.reduce((total, item) => total + item.quantity, 0);
            },
            getTotalPrice: () => {
                return get().items.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                );
            },
        }),
        {
            name: "cart-storage",
            storage: createJSONStorage(() => localStorage),
        }
    )
);