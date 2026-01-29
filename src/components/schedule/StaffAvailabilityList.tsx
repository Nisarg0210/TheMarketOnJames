"use client";
import { format, addDays, startOfWeek } from "date-fns";

interface Availability {
    id: string;
    userId: string;
    date: Date;
    startTime: string;
    endTime: string;
    user: {
        name: string | null;
        email: string | null;
    };
}

export default function StaffAvailabilityList({
    availabilities
}: {
    availabilities: Availability[]
}) {
    // Group by user
    const grouped = availabilities.reduce((acc, curr) => {
        if (!acc[curr.userId]) {
            acc[curr.userId] = {
                name: curr.user.name || "Unknown Staff",
                avail: {} as Record<string, string>
            };
        }
        const dateStr = format(new Date(curr.date), 'yyyy-MM-dd');
        acc[curr.userId].avail[dateStr] = `${curr.startTime} - ${curr.endTime}`;
        return acc;
    }, {} as Record<string, { name: string; avail: Record<string, string> }>);

    const staffIds = Object.keys(grouped);

    // Generate dates for the 2-week period
    const nextMonday = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 7);
    const dates = Array.from({ length: 14 }, (_, i) => addDays(nextMonday, i));

    if (staffIds.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400">
                No staff availability has been submitted for the upcoming 2-week period yet.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {staffIds.map(id => (
                <div key={id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            {grouped[id].name}
                        </h3>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Employee</span>
                    </div>

                    <div className="p-6 overflow-x-auto">
                        <div className="flex gap-4 min-w-max pb-4">
                            {dates.map((date) => {
                                const dateStr = format(date, 'yyyy-MM-dd');
                                const hours = grouped[id].avail[dateStr];
                                return (
                                    <div key={dateStr} className={`w-32 p-4 rounded-xl border transition-all flex-shrink-0 ${hours ? 'bg-blue-50/50 border-blue-200 ring-4 ring-blue-500/5' : 'bg-gray-50/30 border-gray-100 opacity-60'}`}>
                                        <div className="mb-2">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight">{format(date, 'EEEE')}</p>
                                            <p className="text-[11px] font-bold text-gray-900">{format(date, 'MMM dd')}</p>
                                        </div>
                                        <p className={`text-xs font-bold ${hours ? 'text-blue-700' : 'text-gray-400 italic'}`}>
                                            {hours || "Unavailable"}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
