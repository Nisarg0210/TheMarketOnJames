import Header from "@/components/layout/Header";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function SearchPage({ searchParams }: { searchParams: { q: string } }) {
    const query = searchParams.q;

    if (!query) {
        return <div className="p-6">Please enter a search term.</div>;
    }

    const products = await prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: query } }, // Case-insensitive in some DBs, partial match
                { sku: { contains: query } }
            ]
        },
        include: { category: true, batches: true }
    });

    return (
        <div className="space-y-6">
            <Header title={`Search Results for "${query}"`} />

            <div className="card">
                <h3 className="font-semibold mb-4">Products ({products.length})</h3>
                {products.length === 0 ? (
                    <p className="text-gray-500">No products found.</p>
                ) : (
                    <div className="space-y-4">
                        {products.map(p => (
                            <div key={p.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                                <div>
                                    <div className="font-medium text-lg">{p.name}</div>
                                    <div className="text-sm text-gray-500">
                                        Category: {p.category.name} | SKU: {p.sku || "N/A"}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        Total Stock: {p.batches.reduce((sum, b) => sum + b.qty, 0)}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {/* Link to intake or edit? For now, no direct link unless we make product details page */}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
