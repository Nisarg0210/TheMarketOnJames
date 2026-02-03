import PageTitle from "@/components/layout/PageTitle";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import SwapRequestDialog from "@/components/schedule/SwapRequestDialog";
import { calculateShiftHours, formatHours } from "@/lib/utils/schedule";
import { Clock } from "lucide-react";

export default async function MyShiftsPage() {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
        redirect("/auth/signin");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const shifts = await prisma.shift.findMany({
        where: {
            userId: userId,
            date: { gte: today }
        },
        orderBy: { date: "asc" },
        include: { schedule: true }
    });

    return (
        <div className="space-y-6">
            <PageTitle title="My Upcoming Shifts" />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {shifts.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-gray-500">
                        No upcoming shifts scheduled.
                    </div>
                ) : (
                    shifts.map((shift) => (
                        <div key={shift.id} className="card bg-white border shadow-sm p-4 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="font-bold text-lg text-primary">
                                        {format(shift.date, "EEEE, MMM dd")}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {shift.startTime} - {shift.endTime}
                                    </div>
                                    <div className="flex items-center gap-1 mt-1 text-xs font-medium text-blue-600">
                                        <Clock className="w-3 h-3" />
                                        <span>
                                            {formatHours(shift.actualHours !== null ? shift.actualHours : calculateShiftHours(shift.startTime, shift.endTime))}
                                            {shift.actualHours !== null && <span className="ml-1 text-amber-600 font-bold">(Adjusted)</span>}
                                        </span>
                                    </div>
                                </div>
                                {shift.schedule.status === "draft" && (
                                    <span className="badge badge-warning text-xs">Draft</span>
                                )}
                            </div>

                            {shift.notes && (
                                <div className="text-sm italic text-gray-600 mb-4 bg-gray-50 p-2 rounded">
                                    "{shift.notes}"
                                </div>
                            )}

                            <div className="flex justify-end pt-2 border-t mt-2">
                                <SwapRequestDialog shiftId={shift.id} />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
