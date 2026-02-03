import PageTitle from "@/components/layout/PageTitle";
import Link from "next/link";
import { ChevronLeft, Calendar } from "lucide-react";
import ScheduleComments from "@/components/schedule/ScheduleComments";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addDays, startOfDay, format, isSameDay } from "date-fns";
import { publishSchedule } from "@/app/actions/schedule";
import { DeleteShiftButton } from "@/components/schedule/DeleteShiftButton";
import ShiftForm from "@/components/schedule/ShiftForm";
import ShiftHours from "@/components/schedule/ShiftHours";
import { calculateShiftHours, formatHours } from "@/lib/utils/schedule";

export default async function ScheduleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const schedule = await prisma.schedule.findUnique({
        where: { id },
        include: {
            shifts: {
                include: { user: true },
                orderBy: { startTime: "asc" },
            },
            comments: {
                include: { user: true },
                orderBy: { createdAt: "desc" }
            }
        },
    });

    if (!schedule) {
        return <div className="p-8 text-center">Schedule not found</div>;
    }

    const { weekStartDate } = schedule;
    const users = await prisma.user.findMany({
        where: { active: true },
        select: { id: true, name: true },
    });

    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as any)?.role === "admin" || (session?.user as any)?.role === "manager";

    // Generate days of the week
    const days = Array.from({ length: 7 }, (_, i) => {
        const date = addDays(startOfDay(schedule.weekStartDate), i);
        const dayShifts = schedule.shifts.filter(s => isSameDay(new Date(s.date), date));
        const totalDayHours = dayShifts.reduce((acc, s) => {
            return acc + (s.actualHours !== null ? s.actualHours : calculateShiftHours(s.startTime, s.endTime));
        }, 0);

        return {
            date,
            label: format(date, "EEEE"),
            subLabel: format(date, "MMM dd"),
            totalDayHours,
        };
    });

    const totalWeekHours = days.reduce((acc, day) => acc + day.totalDayHours, 0);

    return (
        <>
            <PageTitle title={`Schedule: ${format(schedule.weekStartDate, "MMM dd")}`} showSearch={false} />

            <div className="p-4 md:p-6 lg:p-8 flex-1">
                <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
                    {/* Compact Sticky Header */}
                    <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-gray-100 shadow-sm sticky top-16 z-20 mb-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <Link href="/schedule" className="w-10 h-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-xl transition-all group">
                                    <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                                </Link>
                                <div>
                                    <div className="flex items-center gap-3 mb-0.5">
                                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                                            Week of {format(schedule.weekStartDate, "MMM dd")}
                                        </h1>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border tracking-tight ${schedule.status === 'published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                            {schedule.status}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{format(schedule.weekStartDate, "yyyy")}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="flex flex-col items-end px-4 py-1.5 bg-blue-50/50 rounded-xl border border-blue-100">
                                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest leading-none mb-1">Weekly Commitment</span>
                                    <span className="text-lg font-bold text-blue-700">{formatHours(totalWeekHours)}</span>
                                </div>
                                {isAdmin && schedule.status === "draft" && (
                                    <form action={publishSchedule.bind(null, schedule.id)} className="flex-1 md:flex-initial">
                                        <button type="submit" className="w-full btn btn-primary h-11 px-6 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                                            Publish Week
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Schedule Grid with Horizontal Scroll protection */}
                    <div className="overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
                        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 min-w-[1400px] md:min-w-0">
                            {days.map((day) => {
                                const dayShifts = schedule.shifts.filter(s => isSameDay(new Date(s.date), day.date));
                                const isToday = isSameDay(day.date, new Date());

                                return (
                                    <div key={day.label} className={`flex flex-col h-full bg-white/50 backdrop-blur-sm rounded-2xl border transition-all snap-center ${isToday ? 'border-primary ring-4 ring-primary/5 shadow-2xl shadow-primary/10' : 'border-gray-100'}`}>
                                        <div className={`p-4 text-center border-b ${isToday ? 'bg-gradient-to-b from-primary/5 to-transparent' : 'bg-gray-50/10'} rounded-t-2xl`}>
                                            <p className={`font-bold tracking-tight text-sm ${isToday ? 'text-primary' : 'text-gray-900'}`}>{day.label}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{day.subLabel}</p>
                                            {day.totalDayHours > 0 && (
                                                <div className="inline-block mt-2 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold border border-blue-100">
                                                    {formatHours(day.totalDayHours).toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-3 flex-1 space-y-3 min-h-[500px]">
                                            {dayShifts.map(shift => (
                                                <div key={shift.id} className="p-4 bg-white border border-gray-100 rounded-xl relative group hover:shadow-xl hover:shadow-primary/5 transition-all hover:border-primary/20 flex flex-col gap-2">
                                                    <div className="flex justify-between items-start pr-6">
                                                        <div className="font-semibold text-gray-900 text-sm tracking-tight truncate leading-none mb-1">
                                                            {shift.user.name || "Unknown"}
                                                        </div>
                                                        {isAdmin && (
                                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <DeleteShiftButton shiftId={shift.id} scheduleId={schedule.id} />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col gap-1.5 pt-1">
                                                        <div className="text-primary font-bold text-xs">
                                                            {shift.startTime} - {shift.endTime}
                                                        </div>
                                                        <ShiftHours
                                                            shiftId={shift.id}
                                                            startTime={shift.startTime}
                                                            endTime={shift.endTime}
                                                            actualHours={shift.actualHours}
                                                            isAdmin={isAdmin}
                                                        />
                                                    </div>

                                                    {shift.notes && (
                                                        <div className="mt-1 text-[10px] leading-relaxed text-gray-400 italic bg-gray-50 p-2 rounded-xl border border-gray-100 line-clamp-2" title={shift.notes}>
                                                            &ldquo;{shift.notes}&rdquo;
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            {dayShifts.length === 0 && (
                                                <div className="flex items-center justify-center py-12 text-center">
                                                    <div className="space-y-2">
                                                        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto opacity-40">
                                                            <Calendar className="w-5 h-5 text-gray-400" />
                                                        </div>
                                                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Rest Day</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {isAdmin && (
                                            <div className="p-3 pt-0">
                                                <div className="p-1 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                                    <ShiftForm scheduleId={schedule.id} date={day.date} users={users} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="pt-8">
                        <div className="bg-white/50 backdrop-blur-sm p-8 rounded-[3rem] border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3 lowercase tracking-tight">
                                <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm">#</span>
                                internal communication
                            </h3>
                            <ScheduleComments
                                scheduleId={schedule.id}
                                comments={schedule.comments as any}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
