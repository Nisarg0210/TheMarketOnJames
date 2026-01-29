import Header from "@/components/layout/Header";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";

export default async function AuditLogsPage() {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== "admin") {
        redirect("/");
    }

    const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 100, // Limit for MVP
        include: { actor: true },
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-12">
            <Header title="Admin: Audit Logs" />
            <div className="p-6 flex-1 space-y-6">
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 uppercase">
                                <tr>
                                    <th className="px-6 py-3">Time</th>
                                    <th className="px-6 py-3">Actor</th>
                                    <th className="px-6 py-3">Action</th>
                                    <th className="px-6 py-3">Entity</th>
                                    <th className="px-6 py-3">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                                            {format(log.createdAt, "MMM dd HH:mm:ss")}
                                        </td>
                                        <td className="px-6 py-4 font-medium">
                                            {log.actor.name || log.actor.email || "Unknown"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded bg-gray-100 text-xs font-mono">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            {log.entityType}: {log.entityId}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate">
                                            {log.metaJson}
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">
                                            No audit logs found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
