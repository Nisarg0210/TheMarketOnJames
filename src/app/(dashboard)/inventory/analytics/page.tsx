import PageTitle from "@/components/layout/PageTitle";
import AnalyticsDashboard from "@/components/inventory/analytics/AnalyticsDashboard";
import { getInventoryAnalytics } from "@/app/actions/analytics";

export default async function AnalyticsPage() {
    const data = await getInventoryAnalytics();

    return (
        <>
            <PageTitle title="Inventory: Analytics" />
            <div className="p-4 md:p-6 flex-1 space-y-6 pb-20 md:pb-6">
                <AnalyticsDashboard data={data} />

                <div className="card p-6">
                    <h3 className="font-bold text-lg mb-4">Insights</h3>
                    <p className="text-gray-500">
                        This dashboard helps you track expiry risk and stock health.
                        Use the "Clearance" tab to actionable lists of expiring products.
                    </p>
                </div>
            </div>
        </>
    );
}
