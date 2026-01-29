import Header from "@/components/layout/Header";
import prisma from "@/lib/prisma";
import CategoryForm from "@/components/inventory/CategoryForm";
import { DeleteCategoryButton } from "@/components/inventory/DeleteButtons";

export default async function CategoriesPage() {
    const categories = await prisma.category.findMany({
        include: { _count: { select: { products: true } } },
        orderBy: { name: "asc" },
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-12">
            <Header title="Inventory: Categories" />
            <div className="p-6 flex-1 space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Create Form */}
                    <CategoryForm />

                    {/* List */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="card">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-700 uppercase">
                                        <tr>
                                            <th className="px-6 py-3">Name</th>
                                            <th className="px-6 py-3">Products</th>
                                            <th className="px-6 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map((category) => (
                                            <tr key={category.id} className="border-b hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium">{category.name}</td>
                                                <td className="px-6 py-4">{category._count.products}</td>
                                                <td className="px-6 py-4">
                                                    <DeleteCategoryButton id={category.id} />
                                                </td>
                                            </tr>
                                        ))}
                                        {categories.length === 0 && (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-4 text-center text-muted-foreground">
                                                    No categories found.
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
