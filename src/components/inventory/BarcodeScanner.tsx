"use client";

import { useState, useRef, useEffect } from "react";
import { getProductBySKU } from "@/app/actions/inventory";
import { Barcode, Loader2, CheckCircle2, XCircle, Package, Tag, Layers } from "lucide-react";
import Link from "next/link";

interface ScannedProduct {
    id: string;
    name: string;
    sku: string | null;
    category: string;
    categoryId: string;
    expiryTracking: boolean;
    minStockThreshold: number | null;
    totalStock: number;
    batches: Array<{
        id: string;
        qty: number;
        expiryDate: string | null;
        receivedDate: string;
    }>;
}

interface ScanHistory {
    sku: string;
    timestamp: Date;
    success: boolean;
    productName?: string;
}

export default function BarcodeScanner() {
    const [sku, setSku] = useState("");
    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState<ScannedProduct | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus on mount and after each scan
    useEffect(() => {
        inputRef.current?.focus();
    }, [product]);

    const handleScan = async (scannedSku: string) => {
        if (!scannedSku.trim()) return;

        setLoading(true);
        setError(null);
        setProduct(null);
        setShowSuccess(false);

        try {
            const result = await getProductBySKU(scannedSku.trim());

            if (result.error) {
                setError(result.error);
                setScanHistory(prev => [{
                    sku: scannedSku,
                    timestamp: new Date(),
                    success: false
                }, ...prev.slice(0, 9)]);
            } else if (result.product) {
                setProduct(result.product);
                setShowSuccess(true);
                setScanHistory(prev => [{
                    sku: scannedSku,
                    timestamp: new Date(),
                    success: true,
                    productName: result.product.name
                }, ...prev.slice(0, 9)]);

                // Auto-hide success message after 2 seconds
                setTimeout(() => setShowSuccess(false), 2000);
            }
        } catch (err) {
            setError("An unexpected error occurred");
            setScanHistory(prev => [{
                sku: scannedSku,
                timestamp: new Date(),
                success: false
            }, ...prev.slice(0, 9)]);
        } finally {
            setLoading(false);
            setSku("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleScan(sku);
        }
    };

    const handleClear = () => {
        setSku("");
        setProduct(null);
        setError(null);
        setShowSuccess(false);
        inputRef.current?.focus();
    };

    return (
        <div className="space-y-6">
            {/* Scanner Input */}
            <div className="card">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Barcode className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Barcode Scanner</h3>
                        <p className="text-sm text-gray-500">Scan or type SKU/Barcode</p>
                    </div>
                </div>

                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Scan barcode or type SKU..."
                        className="input pr-12 text-lg font-mono"
                        disabled={loading}
                        autoFocus
                    />
                    {loading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        </div>
                    )}
                </div>

                <div className="flex gap-2 mt-3">
                    <button
                        onClick={() => handleScan(sku)}
                        disabled={loading || !sku.trim()}
                        className="btn btn-primary flex-1"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Scan"}
                    </button>
                    <button
                        onClick={handleClear}
                        disabled={loading}
                        className="btn bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                        Clear
                    </button>
                </div>

                {/* Success Animation */}
                {showSuccess && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <p className="text-sm text-green-700 font-medium">Product found!</p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                )}
            </div>

            {/* Product Details */}
            {product && (
                <div className="card animate-in fade-in slide-in-from-bottom-4">
                    <h4 className="font-bold text-lg mb-4">Product Details</h4>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Name</label>
                                <p className="text-lg font-medium">{product.name}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">SKU</label>
                                <p className="text-lg font-mono">{product.sku}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Category</label>
                                <p className="text-base">{product.category}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Total Stock</label>
                                <p className="text-base font-semibold text-primary">{product.totalStock} units</p>
                            </div>
                        </div>

                        {product.minStockThreshold && (
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Min Stock Alert</label>
                                <p className="text-base">{product.minStockThreshold} units</p>
                            </div>
                        )}

                        {/* Batches */}
                        {product.batches.length > 0 && (
                            <div className="pt-4 border-t">
                                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">
                                    Inventory Batches ({product.batches.length})
                                </label>
                                <div className="space-y-2">
                                    {product.batches.map(batch => (
                                        <div key={batch.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Layers className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium">{batch.qty} units</span>
                                            </div>
                                            {batch.expiryDate && (
                                                <span className="text-xs text-gray-500">
                                                    Expires: {new Date(batch.expiryDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="flex gap-2 pt-4 border-t">
                            <Link href={`/inventory?productId=${product.id}`} className="btn btn-primary flex-1">
                                Add Stock
                            </Link>
                            <button
                                onClick={handleClear}
                                className="btn bg-gray-100 hover:bg-gray-200 text-gray-700"
                            >
                                Scan Next
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Scan History */}
            {scanHistory.length > 0 && (
                <div className="card">
                    <h4 className="font-bold text-base mb-3">Recent Scans</h4>
                    <div className="space-y-2">
                        {scanHistory.map((scan, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                            >
                                <div className="flex items-center gap-2">
                                    {scan.success ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <XCircle className="w-4 h-4 text-red-600" />
                                    )}
                                    <span className="font-mono">{scan.sku}</span>
                                    {scan.productName && (
                                        <span className="text-gray-600">- {scan.productName}</span>
                                    )}
                                </div>
                                <span className="text-xs text-gray-400">
                                    {scan.timestamp.toLocaleTimeString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
