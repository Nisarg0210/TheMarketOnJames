import Header from "@/components/layout/Header";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { createSchedule } from "@/app/actions/schedule";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AutoScheduleButton from "@/components/schedule/AutoScheduleButton";
import DeleteScheduleButton from "@/components/schedule/DeleteScheduleButton";
import AutoEnsureSchedule from "@/components/schedule/AutoEnsureSchedule";

export default async function ScheduleListPage() {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as any)?.role === "admin" || (session?.user as any)?.role === "manager";

    const schedules = await prisma.schedule.findMany({
        orderBy: { weekStartDate: "desc" },
        include: { _count: { select: { shifts: true } } },
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-12">
            <AutoEnsureSchedule isAdmin={isAdmin} />
            <Header title="Staff Schedules" showSearch={false} />

            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Create Form */}
                    <div className="lg:col-span-4 h-fit">
                        <div className="card bg-white/50 backdrop-blur-sm border shadow-xl shadow-gray-200/50 p-6 rounded-2xl sticky top-24">
                            <div className="flex flex-col gap-4 mb-6">
                                <h3 className="font-bold text-xl text-gray-900">Manage Schedules</h3>
                                {isAdmin && <AutoScheduleButton />}
                            </div>
                            <form action={createSchedule} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Week Start Date (Monday)</label>
                                    <input
                                        type="date"
                                        name="weekStartDate"
                                        className="input w-full bg-white h-12 rounded-xl border-gray-200 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                                        required
                                    />
                                    <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                                        <span className="w-1 h-1 bg-amber-400 rounded-full"></span>
                                        Please select a Monday to start the week.
                                    </p>
                                </div>
                                <button type="submit" className="btn btn-primary w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20">
                                    Create Draft Schedule
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* List */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="flex items-center justify-between mb-2 px-2">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Active Schedules</h3>
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-semibold">{schedules.length} Total</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {schedules.map((schedule) => (
                                <div key={schedule.id} className="relative group bg-white border rounded-2xl shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all overflow-hidden flex items-stretch">
                                    <Link
                                        href={`/schedule/${schedule.id}`}
                                        className="flex-1 flex items-center justify-between p-5 pr-4 hover:bg-gray-50/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                                <Calendar className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">
                                                    Week of {format(new Date(schedule.weekStartDate), "MMMM dd, yyyy")}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <p className="text-xs font-medium text-gray-500">
                                                        {schedule._count.shifts} shifts assigned
                                                    </p>
                                                    <span
                                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${schedule.status === "published"
                                                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                            : "bg-amber-50 text-amber-600 border border-amber-100"
                                                            }`}
                                                    >
                                                        {schedule.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 pr-4">
                                            <span className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg group-hover:scale-110 active:scale-95 transition-transform duration-200 shadow-md">
                                                View Details
                                            </span>
                                        </div>
                                    </Link>

                                    {isAdmin && (
                                        <div className="border-l border-gray-100 flex items-center justify-center bg-gray-50/30 group-hover:bg-white transition-colors">
                                            <div className="px-4">
                                                <DeleteScheduleButton
                                                    scheduleId={schedule.id}
                                                    weekLabel={format(new Date(schedule.weekStartDate), "MMM dd")}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {schedules.length === 0 && (
                                <div className="bg-gray-50/50 border-2 border-dashed border-gray-200 p-12 text-center rounded-3xl">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                        <Calendar className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">No schedules found</h3>
                                    <p className="text-sm text-gray-400 max-w-xs mx-auto mt-1">Create your first schedule draft using the form on the left to get started.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
