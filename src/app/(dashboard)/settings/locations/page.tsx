import PageTitle from "@/components/layout/PageTitle";
import prisma from "@/lib/prisma";
import { createLocation, deleteLocation } from "@/app/actions/locations";
import { Trash2, MapPin } from "lucide-react";

export default async function LocationsPage() {
    const locations = await prisma.location.findMany({ orderBy: { name: "asc" } });

    return (
        <>
            <PageTitle title="Location Management" />
            <div className="p-4 md:p-6 space-y-6 pb-20 md:pb-6">

                <div className="card max-w-lg">
                    <h3 className="font-bold mb-4">Add New Location</h3>
                    <form action={createLocation} className="space-y-4">
                        <input name="name" placeholder="Location Name *" className="input w-full" required />
                        <input name="address" placeholder="Address" className="input w-full" />
                        <select name="timezone" className="select w-full">
                            <option value="America/Toronto">America/Toronto</option>
                            <option value="America/Vancouver">America/Vancouver</option>
                            <option value="UTC">UTC</option>
                        </select>
                        <div className="flex justify-end">
                            <button className="btn btn-primary">Add Location</button>
                        </div>
                    </form>
                </div>

                <div className="card">
                    <h3 className="font-bold mb-4">Active Locations</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {locations.length === 0 ? (
                            <div className="col-span-full text-center text-gray-400 py-10">No locations configured.</div>
                        ) : (
                            locations.map(loc => (
                                <div key={loc.id} className="border rounded-lg p-4 flex justify-between items-start bg-gray-50">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            <span className="font-bold">{loc.name}</span>
                                        </div>
                                        <div className="text-sm text-gray-500">{loc.address || "No address"}</div>
                                        <div className="text-xs text-gray-400 mt-1">{loc.timezone}</div>
                                    </div>
                                    <form action={async (formData) => {
                                        "use server";
                                        await deleteLocation(loc.id, formData);
                                    }}>
                                        <button className="text-red-500 hover:bg-red-100 p-1 rounded">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </form>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
