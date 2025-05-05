"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function CheckoutForm({ onSubmit, formData, setFormData }) {

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h2 className="text-lg font-medium text-slate-900 mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <Label htmlFor="email" className="mb-2">Email Address</Label>
                        <Input 
                            type="email" 
                            id="email" 
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-lg font-medium text-slate-900 mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="firstName" className="mb-2">First Name</Label>
                            <Input 
                                type="text" 
                                id="firstName" 
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="lastName" className="mb-2">Last Name</Label>
                            <Input 
                                type="text" 
                                id="lastName" 
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="address" className="mb-2">Address</Label>
                        <Input 
                            type="text" 
                            id="address" 
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="apartment" className="mb-2">Apartment, suite, etc. (optional)</Label>
                        <Input 
                            type="text" 
                            id="apartment" 
                            value={formData.apartment}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="city" className="mb-2">City</Label>
                            <Input 
                                type="text" 
                                id="city" 
                                value={formData.city}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="country" className="mb-2">Country</Label>
                            <select
                                id="country"
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.country}
                                onChange={handleChange}
                            >
                                <option>United States</option>
                                <option>Canada</option>
                                <option>United Kingdom</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="state" className="mb-2">State/Province</Label>
                            <Input 
                                type="text" 
                                id="state" 
                                value={formData.state}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="zip" className="mb-2">ZIP/Postal Code</Label>
                            <Input 
                                type="text" 
                                id="zip" 
                                value={formData.zip}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="phone" className="mb-2">Phone</Label>
                            <Input 
                                type="tel" 
                                id="phone" 
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                    </div>
                </div>
            </div>
            <button type="submit" className="hidden">Submit</button>
        </form>
    );
}