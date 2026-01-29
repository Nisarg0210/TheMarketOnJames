import Header from "@/components/layout/Header";
import AnalyticsDashboard from "@/components/inventory/analytics/AnalyticsDashboard";
import { getInventoryAnalytics } from "@/app/actions/analytics";

export default async function AnalyticsPage() {
    const data = await getInventoryAnalytics();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-12">
            <Header title="Inventory: Analytics" />
            <div className="p-6 flex-1 space-y-6">
                <AnalyticsDashboard data={data} />

                <div className="card p-6">
                    <h3 className="font-bold text-lg mb-4">Insights</h3>
                    <p className="text-gray-500">
                        This dashboard helps you track expiry risk and stock health.
                        Use the "Clearance" tab to actionable lists of expiring products.
                    </p>
                </div>
            </div>
        </div>
    );
}
