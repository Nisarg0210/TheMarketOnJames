"use client";

import { AlertTriangle, Archive, CalendarClock, TrendingDown } from "lucide-react";

type AnalyticsData = {
    expiringSoonCount: number;
    expiredInStockCount: number;
    lowStockCount: number;
    totalItems: number;
};

export default function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="card p-6 border-l-4 border-l-yellow-500">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full">
                        <CalendarClock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Expiring Soon (7 Days)</p>
                        <h3 className="text-2xl font-bold">{data.expiringSoonCount}</h3>
                    </div>
                </div>
            </div>

            <div className="card p-6 border-l-4 border-l-red-500">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-100 text-red-600 rounded-full">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Expired (In Stock)</p>
                        <h3 className="text-2xl font-bold">{data.expiredInStockCount}</h3>
                    </div>
                </div>
            </div>

            <div className="card p-6 border-l-4 border-l-orange-500">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-full">
                        <TrendingDown className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Low Stock Alerts</p>
                        <h3 className="text-2xl font-bold">{data.lowStockCount}</h3>
                    </div>
                </div>
            </div>

            <div className="card p-6 border-l-4 border-l-blue-500">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                        <Archive className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Items</p>
                        <h3 className="text-2xl font-bold">{data.totalItems}</h3>
                    </div>
                </div>
            </div>
        </div>
    );
}
