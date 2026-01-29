import Header from "@/components/layout/Header";
import prisma from "@/lib/prisma";
import IntakeForm from "@/components/inventory/IntakeForm";

export default async function IntakePage() {
    const products = await prisma.product.findMany({
        select: {
            id: true,
            name: true,
            sku: true,
            expiryTracking: true
        },
        orderBy: { name: "asc" },
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-12">
            <Header title="Inventory: Intake" />
            <div className="p-6 flex-1 space-y-6">
                <IntakeForm products={products} />
            </div>
        </div>
    );
}
