import PageTitle from "@/components/layout/PageTitle";
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
        <>
            <PageTitle title="Inventory: Intake" />
            <div className="p-4 md:p-6 flex-1 space-y-6 pb-20 md:pb-6">
                <IntakeForm products={products} />
            </div>
        </>
    );
}
