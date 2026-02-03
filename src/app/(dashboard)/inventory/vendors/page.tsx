import PageTitle from "@/components/layout/PageTitle";
import prisma from "@/lib/prisma";
import { createVendor, deleteVendor } from "@/app/actions/vendors";
import { Trash2 } from "lucide-react";

export default async function VendorsPage() {
    const vendors = await prisma.vendor.findMany({ orderBy: { name: "asc" } });

    return (
        <>
            <PageTitle title="Inventory: Vendors" />
            <div className="p-4 md:p-6 flex-1 space-y-6 pb-20 md:pb-6">

                <div className="card max-w-lg">
                    <h3 className="font-bold mb-4">Add New Vendor</h3>
                    <form action={createVendor} className="space-y-4">
                        <input name="name" placeholder="Vendor Name *" className="input w-full" required />
                        <input name="email" placeholder="Email" className="input w-full" />
                        <input name="phone" placeholder="Phone" className="input w-full" />
                        <input name="address" placeholder="Address" className="input w-full" />
                        <div className="flex justify-end">
                            <button className="btn btn-primary">Add Vendor</button>
                        </div>
                    </form>
                </div>

                <div className="card">
                    <h3 className="font-bold mb-4">Existing Vendors</h3>
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Contact</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vendors.length === 0 ? (
                                    <tr><td colSpan={3} className="text-center text-gray-400">No vendors found.</td></tr>
                                ) : (
                                    vendors.map(v => (
                                        <tr key={v.id}>
                                            <td className="font-medium">{v.name}</td>
                                            <td className="text-sm">
                                                {v.email && <div>{v.email}</div>}
                                                {v.phone && <div>{v.phone}</div>}
                                            </td>
                                            <td>
                                                <form action={async (formData) => {
                                                    "use server";
                                                    await deleteVendor(v.id, formData);
                                                }}>
                                                    <button className="btn btn-ghost btn-xs text-red-500 hover:bg-red-50">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </form>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
