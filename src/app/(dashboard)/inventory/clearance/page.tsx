import Header from "@/components/layout/Header";
import { getClearanceItems } from "@/app/actions/analytics";
import { format, differenceInDays } from "date-fns";

export default async function ClearancePage() {
    const items = await getClearanceItems();
    const today = new Date();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-12">
            <Header title="Inventory: Clearance" />

            <div className="p-6 flex-1 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Clearance List</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Prioritize items expiring within the next 30 days for sale or removal.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wider">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Live Analytics
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Qty</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Time Remaining</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                                            No clearance items found. All inventory is within safe dates.
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item) => {
                                        const daysLeft = item.expiryDate ? differenceInDays(item.expiryDate, today) : 0;

                                        let statusConfig = {
                                            label: "Safe",
                                            bg: "bg-green-50",
                                            text: "text-green-700",
                                            border: "border-green-100",
                                            dot: "bg-green-500"
                                        };

                                        if (daysLeft < 0) {
                                            statusConfig = { label: "Expired", bg: "bg-red-50", text: "text-red-700", border: "border-red-100", dot: "bg-red-600" };
                                        } else if (daysLeft <= 7) {
                                            statusConfig = { label: "Critical", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-100", dot: "bg-orange-500" };
                                        } else if (daysLeft <= 14) {
                                            statusConfig = { label: "Attention", bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-100", dot: "bg-yellow-500" };
                                        }

                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                                                        {item.product.name}
                                                    </div>
                                                    <div className="text-xs text-gray-400">ID: {item.product.id.slice(-6).toUpperCase()}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center justify-center min-w-[2.5rem] h-8 rounded-lg bg-gray-100 text-gray-700 font-bold text-sm">
                                                        {item.qty}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {item.expiryDate ? format(new Date(item.expiryDate), "MMMM dd, yyyy") : "—"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className={`text-sm font-bold ${daysLeft < 0 ? 'text-red-600' : daysLeft <= 7 ? 'text-orange-600' : 'text-gray-700'}`}>
                                                        {daysLeft < 0
                                                            ? `${Math.abs(daysLeft)} days overdue`
                                                            : daysLeft === 0
                                                                ? "Expires today"
                                                                : `${daysLeft} days left`
                                                        }
                                                    </div>
                                                    <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${daysLeft < 0 ? 'bg-red-500' : daysLeft <= 7 ? 'bg-orange-500' : 'bg-green-500'}`}
                                                            style={{ width: `${Math.max(0, Math.min(100, (daysLeft / 30) * 100))}%` }}
                                                        ></div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}></span>
                                                        {statusConfig.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
