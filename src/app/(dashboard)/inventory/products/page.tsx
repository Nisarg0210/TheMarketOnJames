import PageTitle from "@/components/layout/PageTitle";
import prisma from "@/lib/prisma";
import ProductForm from "@/components/inventory/ProductForm";
import { DeleteProductButton } from "@/components/inventory/DeleteButtons";
import Link from "next/link";
import { Barcode, Upload, Package, Calendar, AlertTriangle } from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default async function ProductsPage() {
    const today = new Date();

    // Fetch products with their batches
    const products = await prisma.product.findMany({
        include: {
            category: true,
            batches: {
                orderBy: { expiryDate: "asc" },
                where: {
                    qty: { gt: 0 }
                }
            }
        },
        orderBy: { name: "asc" },
    });

    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
    });

    // Helper function to get expiry status
    const getExpiryStatus = (expiryDate: Date | null) => {
        if (!expiryDate) return { status: 'none', color: 'gray', label: 'No expiry' };

        const daysLeft = differenceInDays(expiryDate, today);

        if (daysLeft < 0) {
            return { status: 'expired', color: 'red', label: 'EXPIRED', daysLeft };
        } else if (daysLeft <= 3) {
            return { status: 'critical', color: 'orange', label: `${daysLeft}d left`, daysLeft };
        } else if (daysLeft <= 20) {
            return { status: 'warning', color: 'yellow', label: `${daysLeft}d left`, daysLeft };
        } else {
            return { status: 'ok', color: 'green', label: `${daysLeft}d left`, daysLeft };
        }
    };

    return (
        <>
            <PageTitle title="Inventory: Products" />

            {/* Quick Action Buttons */}
            <div className="px-4 md:px-6 pt-4 flex gap-3">
                <Link href="/inventory/scanner" className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                    <Barcode className="w-4 h-4" />
                    Barcode Scanner
                </Link>
                <Link href="/inventory/bulk-import" className="btn bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Bulk Import
                </Link>
            </div>

            <div className="p-4 md:p-6 flex-1 space-y-6 pb-20 md:pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Create Form - Sticky on larger screens */}
                    <div className="lg:col-span-1">
                        <div className="lg:sticky lg:top-4">
                            <ProductForm categories={categories} />
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="lg:col-span-3">
                        {products.length === 0 ? (
                            <div className="card p-12 text-center">
                                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No products yet</h3>
                                <p className="text-sm text-gray-500">Create your first product using the form</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {products.map((product) => {
                                    const totalStock = product.batches.reduce((sum, b) => sum + b.qty, 0);
                                    const earliestBatch = product.batches[0]; // Already sorted by expiry date
                                    const expiryInfo = earliestBatch?.expiryDate
                                        ? getExpiryStatus(earliestBatch.expiryDate)
                                        : { status: 'none', color: 'gray', label: 'No expiry', daysLeft: null };

                                    // Determine card border color based on expiry status
                                    const borderColorClass = {
                                        'expired': 'border-l-4 border-l-red-500',
                                        'critical': 'border-l-4 border-l-orange-500',
                                        'warning': 'border-l-4 border-l-yellow-500',
                                        'ok': 'border-l-4 border-l-green-500',
                                        'none': 'border-l-4 border-l-gray-300'
                                    }[expiryInfo.status];

                                    return (
                                        <div
                                            key={product.id}
                                            className={`card hover:shadow-lg transition-all ${borderColorClass}`}
                                        >
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                        {product.category.name}
                                                    </span>
                                                </div>
                                                <DeleteProductButton id={product.id} />
                                            </div>

                                            {/* Stock Info */}
                                            <div className="flex items-center gap-2 mb-3 pb-3 border-b">
                                                <Package className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-semibold text-gray-700">
                                                    Total Stock: <span className="text-primary">{totalStock}</span>
                                                </span>
                                            </div>

                                            {/* Expiry Tracking Status */}
                                            {product.expiryTracking ? (
                                                <>
                                                    <div className="space-y-2">
                                                        {product.batches.length > 0 ? (
                                                            <>
                                                                {/* Show up to 3 batches */}
                                                                {product.batches.slice(0, 3).map((batch) => {
                                                                    const batchExpiry = batch.expiryDate
                                                                        ? getExpiryStatus(batch.expiryDate)
                                                                        : null;

                                                                    return (
                                                                        <div
                                                                            key={batch.id}
                                                                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-xs"
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                <Calendar className="w-3 h-3 text-gray-400" />
                                                                                <span className="font-medium text-gray-600">
                                                                                    Qty: {batch.qty}
                                                                                </span>
                                                                            </div>
                                                                            {batch.expiryDate && batchExpiry ? (
                                                                                <div className="flex flex-col items-end">
                                                                                    <span className="text-gray-600">
                                                                                        {format(batch.expiryDate, "MMM dd, yyyy")}
                                                                                    </span>
                                                                                    <span className={`font-bold ${batchExpiry.status === 'expired' ? 'text-red-600' :
                                                                                            batchExpiry.status === 'critical' ? 'text-orange-600' :
                                                                                                batchExpiry.status === 'warning' ? 'text-yellow-600' :
                                                                                                    'text-green-600'
                                                                                        }`}>
                                                                                        {batchExpiry.label}
                                                                                    </span>
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-gray-400">No expiry set</span>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                                {product.batches.length > 3 && (
                                                                    <p className="text-xs text-gray-500 text-center">
                                                                        + {product.batches.length - 3} more batch{product.batches.length - 3 !== 1 ? 'es' : ''}
                                                                    </p>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                                                                <AlertTriangle className="w-4 h-4 text-blue-600" />
                                                                <p className="text-xs text-blue-700 font-medium">
                                                                    Expiry tracking enabled • No batches yet
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                                    <span className="text-xs text-gray-500">Expiry tracking: Disabled</span>
                                                </div>
                                            )}

                                            {/* SKU if available */}
                                            {product.sku && (
                                                <div className="mt-2 pt-2 border-t">
                                                    <p className="text-xs text-gray-500">
                                                        SKU: <span className="font-mono font-semibold">{product.sku}</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
