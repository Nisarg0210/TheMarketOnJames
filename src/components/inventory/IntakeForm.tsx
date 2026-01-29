"use client";

import { useState, useRef, useEffect } from "react";
import { createBatch, getProductBySKU } from "@/app/actions/inventory";
import { Loader2, Barcode, CheckCircle2, XCircle, Package } from "lucide-react";

interface Product {
    id: string;
    name: string;
    sku?: string | null;
    expiryTracking?: boolean;
}

export default function IntakeForm({ products }: { products: Product[] }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scanning, setScanning] = useState(false);
    const [sku, setSku] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [scanSuccess, setScanSuccess] = useState(false);

    const skuInputRef = useRef<HTMLInputElement>(null);
    const qtyInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (selectedProduct) {
            qtyInputRef.current?.focus();
        }
    }, [selectedProduct]);

    const handleScan = async (scannedSku: string) => {
        if (!scannedSku.trim()) return;

        setScanning(true);
        setError(null);
        setScanSuccess(false);

        try {
            const result = await getProductBySKU(scannedSku.trim());

            if (result.error) {
                setError(result.error);
            } else if (result.product) {
                const product = products.find(p => p.id === result.product.id);
                if (product) {
                    setSelectedProduct(product);
                    setScanSuccess(true);
                    setTimeout(() => setScanSuccess(false), 2000);
                } else {
                    setError("Product not found in list");
                }
            }
        } catch (err) {
            setError("Failed to scan product");
        } finally {
            setScanning(false);
            setSku("");
        }
    };

    const handleScanKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleScan(sku);
        }
    };

    const handleClearScan = () => {
        setSelectedProduct(null);
        setSku("");
        setError(null);
        setScanSuccess(false);
        skuInputRef.current?.focus();
    };

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        try {
            const result = await createBatch(formData);
            if (result?.error) {
                setError(result.error);
            }
        } catch (e) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="card max-w-2xl mx-auto">
            {/* Barcode Scanner Section */}
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                    <Barcode className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Quick Scan</h4>
                </div>

                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <input
                            ref={skuInputRef}
                            type="text"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            onKeyDown={handleScanKeyDown}
                            placeholder="Scan or type SKU..."
                            className="input font-mono"
                            disabled={scanning || loading}
                            autoFocus
                        />
                        {scanning && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => handleScan(sku)}
                        disabled={scanning || loading || !sku.trim()}
                        className="btn bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Scan
                    </button>
                </div>

                {scanSuccess && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <p className="text-sm text-green-700 font-medium">Product found!</p>
                    </div>
                )}
            </div>

            {/* Selected Product Preview */}
            {selectedProduct && (
                <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Package className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="font-semibold text-green-900">{selectedProduct.name}</p>
                                {selectedProduct.sku && (
                                    <p className="text-sm text-green-700 font-mono">{selectedProduct.sku}</p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleClearScan}
                            className="text-sm text-green-700 hover:text-green-900 font-medium"
                        >
                            Change
                        </button>
                    </div>
                </div>
            )}

            <form action={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Product</label>
                        <select
                            name="productId"
                            className="input"
                            required
                            value={selectedProduct?.id || ""}
                            onChange={(e) => {
                                const product = products.find(p => p.id === e.target.value);
                                setSelectedProduct(product || null);
                            }}
                            disabled={loading}
                        >
                            <option value="" disabled>Select Product</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} {p.sku ? `(${p.sku})` : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Quantity</label>
                        <input
                            ref={qtyInputRef}
                            type="number"
                            name="qty"
                            className="input"
                            min="1"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Received Date</label>
                        <input
                            type="date"
                            name="receivedDate"
                            className="input"
                            defaultValue={new Date().toISOString().split("T")[0]}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Vendor (Optional)</label>
                        <input
                            type="text"
                            name="vendor"
                            className="input"
                            placeholder="Supplier Name"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Lot Number (Optional)</label>
                        <input
                            type="text"
                            name="lotNumber"
                            className="input"
                            placeholder="Batch/Lot #"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Storage Location (Optional)</label>
                        <input
                            type="text"
                            name="storageLocation"
                            className="input"
                            placeholder="Shelf A1"
                            disabled={loading}
                        />
                    </div>

                    <div className="col-span-2 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                        <h4 className="text-sm font-semibold text-yellow-800 mb-2">Expiry Information</h4>
                        <p className="text-xs text-yellow-700 mb-3">
                            If the selected product requires expiry tracking, you must provide the date below.
                        </p>
                        <label className="block text-sm font-medium mb-1 text-yellow-900">Expiry Date</label>
                        <input
                            type="date"
                            name="expiryDate"
                            className="input border-yellow-200 focus:ring-yellow-500"
                            disabled={loading}
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <div className="pt-4 border-t">
                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Record Delivery"}
                    </button>
                </div>
            </form>
        </div>
    );
}
