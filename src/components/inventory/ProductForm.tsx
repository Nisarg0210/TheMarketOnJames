"use client";

import { useState } from "react";
import { createProduct } from "@/app/actions/inventory";
import { Loader2, CheckCircle2, Scan } from "lucide-react";
import MobileScannerModal from "./MobileScannerModal";

interface Category {
    id: string;
    name: string;
}

export default function ProductForm({ categories }: { categories: Category[] }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [trackExpiry, setTrackExpiry] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scannedSku, setScannedSku] = useState("");

    const handleScan = (code: string) => {
        setScannedSku(code);
        // Also update the input value directly if needed, but react state should handle it
    };

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const result = await createProduct(formData);
            if (result?.error) {
                setError(result.error);
            } else {
                (document.getElementById("product-form") as HTMLFormElement).reset();
                setTrackExpiry(false);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (e) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="card h-fit">
            <h3 className="font-bold text-lg mb-4 text-gray-900">Add New Product</h3>
            <form id="product-form" action={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                        type="text"
                        name="name"
                        className="input"
                        placeholder="e.g. 2% Milk"
                        required
                        disabled={loading}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select name="categoryId" className="input" required defaultValue="" disabled={loading || categories.length === 0}>
                            <option value="" disabled>
                                {categories.length === 0 ? "No categories found" : "Select a category"}
                            </option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {categories.length === 0 && (
                            <p className="text-xs text-red-500 mt-1">
                                Create categories in Inventory Settings first.
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Initial Stock (Qty)</label>
                        <input
                            type="number"
                            name="initialQty"
                            className="input"
                            placeholder="0"
                            min="0"
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="space-y-4 pt-2 border-t">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="expiryTracking"
                            id="expiryTracking"
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={trackExpiry}
                            onChange={(e) => setTrackExpiry(e.target.checked)}
                            disabled={loading}
                        />
                        <label htmlFor="expiryTracking" className="text-sm font-medium">Track Expiry Date</label>
                    </div>

                    {trackExpiry && (
                        <div className="pl-6 animate-in fade-in slide-in-from-top-1">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Expire Date</label>
                            <input
                                type="date"
                                name="expiryDate"
                                className="input h-9"
                                required={trackExpiry}
                                disabled={loading}
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">SKU / Barcode</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                name="sku"
                                className="input"
                                placeholder="Optional"
                                disabled={loading}
                                value={scannedSku}
                                onChange={(e) => setScannedSku(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setIsScannerOpen(true)}
                                className="btn btn-outline px-3"
                                title="Scan Barcode"
                                disabled={loading}
                            >
                                <Scan className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Min Stock Alert</label>
                        <input
                            type="number"
                            name="minStockThreshold"
                            className="input"
                            placeholder="Optional"
                            min="0"
                            disabled={loading}
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                        <p className="text-sm text-red-600 font-medium">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="p-3 bg-green-50 border border-green-100 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <p className="text-sm text-green-600 font-medium">Product created successfully!</p>
                    </div>
                )}

                <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Create Product"}
                </button>
            </form>

            <MobileScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScan={handleScan}
            />
        </div>
    );
}
