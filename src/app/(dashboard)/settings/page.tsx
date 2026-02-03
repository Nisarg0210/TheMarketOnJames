import Link from "next/link";
import { MapPin } from "lucide-react";
import PageTitle from "@/components/layout/PageTitle";

export default function SettingsPage() {
    return (
        <>
            <PageTitle title="Settings" showSearch={false} />
            <div className="p-4 md:p-6 flex-1 space-y-6 pb-20 md:pb-6">
                <h1 className="text-2xl font-bold tracking-tight">Settings Overview</h1>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Link href="/settings/locations" className="block p-6 bg-white border rounded-lg shadow-sm hover:border-primary hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <MapPin className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900">Locations</h2>
                                <p className="text-sm text-gray-500">Manage store locations and addresses</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </>
    );
}
