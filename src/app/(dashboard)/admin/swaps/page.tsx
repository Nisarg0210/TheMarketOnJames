import Header from "@/components/layout/Header";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import SwapActions from "@/components/admin/SwapActions";

export default async function AdminSwapsPage() {
    const session = await getServerSession(authOptions);
    const user = (session?.user as any);

    if (!user || (user.role !== "admin" && user.role !== "manager")) {
        redirect("/");
    }

    const requests = await prisma.shiftSwapRequest.findMany({
        where: { status: "PENDING" },
        include: {
            shift: { include: { schedule: true } },
            requestingUser: true,
        },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-12">
            <Header title="Admin: Swap Requests" />

            <div className="p-6 flex-1 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Shift Swap Requests</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Review and approve staff requests to trade or drop shifts.
                        </p>
                    </div>
                    <div className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-100 italic">
                        Pending Review
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Requested By</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Shift Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Reason</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {requests.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                                            No pending swap requests at this time.
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((req) => (
                                        <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-gray-900">
                                                {req.requestingUser.name || req.requestingUser.email}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {format(req.shift.date, "EEEE, MMM dd")}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-blue-700">
                                                {req.shift.startTime} - {req.shift.endTime}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 italic max-w-xs truncate">
                                                "{req.message}"
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <SwapActions requestId={req.id} />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
