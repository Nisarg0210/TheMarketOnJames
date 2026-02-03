import PageTitle from "@/components/layout/PageTitle";
import AvailabilityForm from "@/components/schedule/AvailabilityForm";
import StaffAvailabilityList from "@/components/schedule/StaffAvailabilityList";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { addDays, startOfWeek, format } from "date-fns";

export default async function AvailabilityPage() {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const role = (session?.user as any)?.role;

    if (!userId) {
        redirect("/auth/signin");
    }

    const isAdmin = role === "admin" || role === "manager";
    const nextMonday = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 7);
    const endOfPeriod = addDays(nextMonday, 14);

    if (isAdmin) {
        const allAvailability = await prisma.availability.findMany({
            where: {
                date: {
                    gte: nextMonday,
                    lt: endOfPeriod
                }
            },
            include: { user: true },
            orderBy: { userId: "asc" }
        });

        return (
            <>
                <PageTitle title="Staff Availability" />
                <div className="p-6 md:p-8 space-y-6">
                    <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Observation Period</h3>
                            <p className="text-lg font-bold text-gray-900 italic lowercase tracking-tight">
                                {format(nextMonday, 'MMM dd')} - {format(addDays(nextMonday, 13), 'MMM dd')}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Next 2 Weeks View</span>
                        </div>
                    </div>
                    <StaffAvailabilityList availabilities={allAvailability as any} />
                </div>
            </>
        );
    }

    const availability = await prisma.availability.findMany({
        where: {
            userId,
            date: {
                gte: nextMonday,
                lt: endOfPeriod
            }
        }
    });

    return (
        <>
            <PageTitle title="My Availability" />
            <div className="max-w-4xl mx-auto w-full p-6 md:p-8">
                <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 p-8 rounded-[2.5rem] mb-8 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm text-primary">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Set Your Schedule</h3>
                            <p className="text-sm text-gray-600 mt-1 max-w-md">
                                Please provide your preferred working hours for the 2-week block starting <span className="font-bold text-primary">{format(nextMonday, 'EEEE, MMM dd')}</span>.
                                Leave fields blank for days you are unavailable.
                            </p>
                        </div>
                    </div>
                </div>
                <AvailabilityForm initialAvailability={availability as any} />
            </div>
        </>
    );
}
