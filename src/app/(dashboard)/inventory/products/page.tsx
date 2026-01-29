import Header from "@/components/layout/Header";
import prisma from "@/lib/prisma";
import ProductForm from "@/components/inventory/ProductForm";
import { DeleteProductButton } from "@/components/inventory/DeleteButtons";
import ExportButton from "@/components/reporting/ExportButton";
import { exportProductsCsv } from "@/app/actions/reporting";
import Link from "next/link";
import { Barcode, Upload } from "lucide-react";

export default async function ProductsPage() {
    const products = await prisma.product.findMany({
        include: { category: true },
        orderBy: { name: "asc" },
    });

    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-12">
            <Header title="Inventory: Products" />

            {/* Quick Action Buttons */}
            <div className="px-6 pt-4 flex gap-3">
                <Link href="/inventory/scanner" className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                    <Barcode className="w-4 h-4" />
                    Barcode Scanner
                </Link>
                <Link href="/inventory/bulk-import" className="btn bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Bulk Import
                </Link>
            </div>

            <div className="p-6 flex-1 space-y-6">


                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Create Form */}
                    <ProductForm categories={categories} />

                    {/* List */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="card">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-700 uppercase">
                                        <tr>
                                            <th className="px-6 py-3">Name</th>
                                            <th className="px-6 py-3">Category</th>
                                            <th className="px-6 py-3">Expiry Tracking</th>
                                            <th className="px-6 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product) => (
                                            <tr key={product.id} className="border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium">{product.name}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                                        {product.category.name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {product.expiryTracking ? (
                                                        <span className="text-green-600 font-medium">Yes</span>
                                                    ) : (
                                                        <span className="text-gray-400">No</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <DeleteProductButton id={product.id} />
                                                </td>
                                            </tr>
                                        ))}
                                        {products.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-4 text-center text-muted-foreground">
                                                    No products found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
