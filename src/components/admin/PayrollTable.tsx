"use client";

import { useState, useEffect } from "react";
import { getPayrollSummary } from "@/app/actions/payroll";
import { format, startOfWeek, addDays, subDays } from "date-fns";
import { Calendar, Loader2, Download, AlertTriangle } from "lucide-react";
import { formatHours } from "@/lib/utils/schedule";

export default function PayrollTable() {
    const today = new Date();
    // Default to a 2-week period: from last Monday to this Sunday
    const thisMonday = startOfWeek(today, { weekStartsOn: 1 });
    const lastMonday = subDays(thisMonday, 7);
    const thisSunday = addDays(thisMonday, 6);

    const [startDate, setStartDate] = useState(format(lastMonday, "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState(format(thisSunday, "yyyy-MM-dd"));
    const [summary, setSummary] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchSummary() {
        setLoading(true);
        const data = await getPayrollSummary(new Date(startDate + "T00:00:00"), new Date(endDate + "T23:59:59"));
        setSummary(data || []);
        setLoading(false);
    }

    useEffect(() => {
        fetchSummary();
    }, []);

    const totalPeriodHours = summary.reduce((acc, item) => acc + item.totalHours, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 flex flex-col lg:flex-row lg:items-center gap-8">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Reporting Period: From</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="input w-full focus:ring-4 focus:ring-primary/10 transition-all bg-gray-50/50 border-gray-100 h-12 rounded-xl font-semibold px-6 text-gray-900 shadow-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Reporting Period: To</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="input w-full focus:ring-4 focus:ring-primary/10 transition-all bg-gray-50/50 border-gray-100 h-12 rounded-xl font-semibold px-6 text-gray-900 shadow-sm"
                        />
                    </div>
                </div>
                <button
                    onClick={fetchSummary}
                    disabled={loading}
                    className="btn btn-primary h-12 px-10 rounded-xl font-bold shadow-lg shadow-primary/20 whitespace-nowrap lg:mt-6 transition-all active:scale-95"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Run Payroll Report"}
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-8 border-b bg-gray-50/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight leading-none mb-1.5">Payroll Summary</h3>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-primary opacity-50" />
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                {format(new Date(startDate + "T00:00:00"), "MMM dd")} — {format(new Date(endDate + "T00:00:00"), "MMM dd, yyyy")}
                            </p>
                        </div>
                    </div>
                    <div className="bg-primary/5 px-6 py-4 rounded-xl border border-primary/10 text-right min-w-[200px]">
                        <p className="text-[10px] font-bold text-primary/50 uppercase tracking-widest mb-1.5">Estimated Period Hours</p>
                        <p className="text-2xl font-bold text-primary leading-none tracking-tight">{formatHours(totalPeriodHours)}</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/20 border-b border-gray-100">
                                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee Record</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shift Volume</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Aggregated Hours</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-8 py-20 text-center text-gray-400">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto opacity-10" />
                                        <p className="text-xs font-medium mt-4">Compiling Data...</p>
                                    </td>
                                </tr>
                            ) : summary.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-8 py-20 text-center opacity-30">
                                        <Calendar className="w-10 h-10 mx-auto text-gray-300" />
                                        <p className="text-sm font-medium mt-4">No data found for the selected range.</p>
                                    </td>
                                </tr>
                            ) : (
                                summary.map((item) => (
                                    <tr key={item.id} className="group hover:bg-gray-50/50 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm border border-blue-50 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300">
                                                    {item.name[0]?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900 leading-none mb-1.5">{item.name}</div>
                                                    <div className="text-[10px] font-semibold text-gray-400 tracking-tight uppercase">REF: {item.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80"></span>
                                                <span className="text-sm font-medium text-gray-600">{item.shiftCount} Assigned Shifts</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="inline-flex items-center bg-blue-50/50 px-4 py-2 rounded-xl border border-blue-100 group-hover:border-primary/20 transition-colors">
                                                <span className="text-sm font-bold text-blue-700">{formatHours(item.totalHours)}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-amber-50/50 rounded-2xl border border-amber-100 p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100/30 flex items-center justify-center flex-shrink-0 border border-amber-100">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                    <h4 className="font-bold text-amber-900/80 text-sm mb-1">Administrative Notice</h4>
                    <p className="text-xs text-amber-700/80 leading-relaxed font-medium">
                        Reported totals include all manual overrides for actual hours worked. Bi-weekly cycles are approximated.
                        Please verify entries against official logs before processing.
                    </p>
                </div>
            </div>
        </div>
    );
}
