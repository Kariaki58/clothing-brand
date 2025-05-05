"use client";
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const CreatableSelect = React.forwardRef(
    ({ className, children, onAddNew, ...props }, ref) => {
        return (
        <SelectPrimitive.Root {...props}>
            <SelectPrimitive.Trigger
            ref={ref}
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            >
            <SelectPrimitive.Value />
            <SelectPrimitive.Icon asChild>
                <ChevronDown className="h-4 w-4 opacity-50" />
            </SelectPrimitive.Icon>
            </SelectPrimitive.Trigger>
            <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                className={cn(
                "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80",
                className
                )}
            >
                <SelectPrimitive.Viewport className="p-1">
                {children}
                {onAddNew && (
                    <div
                    className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                    onClick={onAddNew}
                    >
                    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                        <Plus className="h-4 w-4" />
                    </span>
                    Add new...
                    </div>
                )}
                </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
        );
    }
);
CreatableSelect.displayName = SelectPrimitive.Root.displayName;

const CreatableSelectItem = React.forwardRef(
    ({ className, children, ...props }, ref) => {
        return (
        <SelectPrimitive.Item
            ref={ref}
            className={cn(
            "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            className
            )}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <SelectPrimitive.ItemIndicator>
                <Check className="h-4 w-4" />
            </SelectPrimitive.ItemIndicator>
            </span>
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
        );
    }
);
CreatableSelectItem.displayName = SelectPrimitive.Item.displayName;

export { CreatableSelect, CreatableSelectItem };