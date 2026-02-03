import PageTitle from "@/components/layout/PageTitle";
import prisma from "@/lib/prisma";
import { format, differenceInDays } from "date-fns";

export const dynamic = "force-dynamic";

export default async function ExpiryPage() {
    const today = new Date();
    const twentyDaysFromNow = new Date();
    twentyDaysFromNow.setDate(today.getDate() + 20);

    const expiringBatches = await prisma.inventoryBatch.findMany({
        where: {
            expiryDate: {
                not: null,
            },
        },
        include: {
            product: {
                include: {
                    category: true,
                },
            },
        },
        orderBy: {
            expiryDate: "asc",
        },
    });

    const expired = expiringBatches.filter(
        (b) => b.expiryDate && new Date(b.expiryDate) < today
    );

    const expiringSoon = expiringBatches.filter(
        (b) =>
            b.expiryDate &&
            new Date(b.expiryDate) >= today &&
            new Date(b.expiryDate) <= twentyDaysFromNow
    );

    return (
        <>
            <PageTitle title="Inventory: Expiry Tracking" />
            <div className="p-4 md:p-6 flex-1 space-y-6 pb-20 md:pb-6">

                <div className="space-y-8">
                    {/* Expired Section */}
                    <section>
                        <h2 className="text-lg font-semibold text-red-700 mb-4 flex items-center gap-2">
                            ⚠️ Expired Items
                            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                {expired.length}
                            </span>
                        </h2>
                        <div className="card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-red-50 text-red-900 uppercase">
                                        <tr>
                                            <th className="px-4 md:px-6 py-3">Product</th>
                                            <th className="px-4 md:px-6 py-3">Category</th>
                                            <th className="px-4 md:px-6 py-3">Quantity</th>
                                            <th className="px-4 md:px-6 py-3">Expiry Date</th>
                                            <th className="px-4 md:px-6 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expired.map((batch) => (
                                            <tr key={batch.id} className="border-b hover:bg-red-50/50">
                                                <td className="px-4 md:px-6 py-4 font-medium">{batch.product.name}</td>
                                                <td className="px-4 md:px-6 py-4">{batch.product.category.name}</td>
                                                <td className="px-4 md:px-6 py-4">{batch.qty}</td>
                                                <td className="px-4 md:px-6 py-4 font-bold text-red-600">
                                                    {batch.expiryDate ? format(new Date(batch.expiryDate), "MMM dd, yyyy") : "-"}
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                                        EXPIRED
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {expired.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-4 md:px-6 py-4 text-center text-muted-foreground">
                                                    No expired items found. Good job!
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* Expiring Soon Section */}
                    <section>
                        <h2 className="text-lg font-semibold text-yellow-700 mb-4 flex items-center gap-2">
                            ⏳ Expiring Soon (Next 20 Days)
                            <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                {expiringSoon.length}
                            </span>
                        </h2>
                        <div className="card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-yellow-50 text-yellow-900 uppercase">
                                        <tr>
                                            <th className="px-4 md:px-6 py-3">Product</th>
                                            <th className="px-4 md:px-6 py-3">Category</th>
                                            <th className="px-4 md:px-6 py-3">Quantity</th>
                                            <th className="px-4 md:px-6 py-3">Expiry Date</th>
                                            <th className="px-4 md:px-6 py-3">Days Left</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expiringSoon.map((batch) => {
                                            const daysLeft = batch.expiryDate
                                                ? differenceInDays(new Date(batch.expiryDate), today)
                                                : 0;
                                            return (
                                                <tr key={batch.id} className="border-b hover:bg-yellow-50/50">
                                                    <td className="px-4 md:px-6 py-4 font-medium">{batch.product.name}</td>
                                                    <td className="px-4 md:px-6 py-4">{batch.product.category.name}</td>
                                                    <td className="px-4 md:px-6 py-4">{batch.qty}</td>
                                                    <td className="px-4 md:px-6 py-4">
                                                        {batch.expiryDate ? format(new Date(batch.expiryDate), "MMM dd, yyyy") : "-"}
                                                    </td>
                                                    <td className="px-4 md:px-6 py-4">
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${daysLeft <= 3
                                                                ? "bg-orange-100 text-orange-700"
                                                                : "bg-yellow-100 text-yellow-700"
                                                                }`}
                                                        >
                                                            {daysLeft} days
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {expiringSoon.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-4 md:px-6 py-4 text-center text-muted-foreground">
                                                    No items expiring soon.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
