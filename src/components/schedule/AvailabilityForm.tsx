"use client";
import { useState } from "react";
import { updateAvailability } from "@/app/actions/schedule";
import { Loader2 } from "lucide-react";
import { addDays, startOfWeek, format } from "date-fns";

type Availability = { date: Date; startTime: string; endTime: string };

export default function AvailabilityForm({ initialAvailability }: { initialAvailability: Availability[] }) {
    const [loading, setLoading] = useState(false);

    // Calculate next 2 weeks starting from next Monday
    const nextMonday = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 7);
    const dates = Array.from({ length: 14 }, (_, i) => addDays(nextMonday, i));

    // Helper to get time for a specific date
    const getStartTime = (date: Date) => {
        const found = initialAvailability.find(a => format(new Date(a.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
        return found?.startTime || "";
    };

    const getEndTime = (date: Date) => {
        const found = initialAvailability.find(a => format(new Date(a.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
        return found?.endTime || "";
    };

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        const res = await updateAvailability(formData);
        if (res?.error) {
            alert(res.error);
        } else {
            alert("Availability saved!");
        }
        setLoading(false);
    };

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="card bg-white p-6 rounded-2xl border shadow-sm">
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 pb-2 border-b text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
                        <span>Date</span>
                        <span>Start Time</span>
                        <span>End Time</span>
                    </div>
                    {dates.map((date) => {
                        const dateStr = format(date, 'yyyy-MM-dd');
                        return (
                            <div key={dateStr} className="grid grid-cols-3 gap-4 items-center py-2 px-2 hover:bg-gray-50/50 rounded-xl transition-colors">
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm text-gray-900">{format(date, 'EEEE')}</span>
                                    <span className="text-[10px] text-gray-400 font-semibold">{format(date, 'MMM dd')}</span>
                                </div>
                                <input
                                    type="time"
                                    name={`startTime_${dateStr}`}
                                    className="input text-sm h-11 rounded-2xl bg-gray-50/50"
                                    defaultValue={getStartTime(date)}
                                />
                                <input
                                    type="time"
                                    name={`endTime_${dateStr}`}
                                    className="input text-sm h-11 rounded-2xl bg-gray-50/50"
                                    defaultValue={getEndTime(date)}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-end sticky bottom-6 z-10">
                <button type="submit" className="btn btn-primary h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Save Availability
                </button>
            </div>
        </form>
    );
}
