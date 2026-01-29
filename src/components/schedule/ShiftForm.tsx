"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { addShift } from "@/app/actions/schedule";
import { Loader2, Plus, X } from "lucide-react";
import { format } from "date-fns";

interface User {
    id: string;
    name: string | null;
}

export default function ShiftForm({
    scheduleId,
    date,
    users
}: {
    scheduleId: string;
    date: Date;
    users: User[];
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const result = await addShift(formData);
        setLoading(false);
        if (result?.error) {
            alert(result.error);
        } else {
            setIsOpen(false);
        }
    }

    const dateStr = format(date, 'yyyy-MM-dd');
    const timeOptions = Array.from({ length: 48 }, (_, i) => {
        const hour = Math.floor(i / 2).toString().padStart(2, '0');
        const min = (i % 2 === 0 ? '00' : '30');
        return `${hour}:${min}`;
    });

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="w-full py-2 hover:bg-gray-100 text-gray-400 hover:text-primary border border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 transition-all text-xs font-semibold group active:scale-95"
            >
                <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" /> Add Shift
            </button>

            {isOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => !loading && setIsOpen(false)}
                    />

                    {/* Modal Content */}
                    <div className="relative w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-gray-100 p-10 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 ease-out">
                        {/* Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-10 text-center">
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Assign Shift</h2>
                            <p className="text-sm font-semibold text-primary mt-2 flex items-center justify-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                {format(date, 'EEEE, MMMM dd')}
                            </p>
                        </div>

                        <form action={handleSubmit} className="space-y-8">
                            <input type="hidden" name="scheduleId" value={scheduleId} />
                            <input type="hidden" name="date" value={dateStr} />

                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] px-1">Staff Member</label>
                                <select
                                    name="userId"
                                    className="w-full bg-gray-50/50 border border-gray-100 text-sm h-14 rounded-2xl px-5 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-semibold text-gray-900"
                                    required
                                >
                                    <option value="">Select an employee...</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name || u.id}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] px-1">Start Time</label>
                                    <select
                                        name="startTime"
                                        className="w-full bg-gray-50/50 border border-gray-100 text-sm h-14 rounded-2xl px-5 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-semibold text-gray-900"
                                        required
                                        defaultValue="09:00"
                                    >
                                        {timeOptions.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] px-1">End Time</label>
                                    <select
                                        name="endTime"
                                        className="w-full bg-gray-50/50 border border-gray-100 text-sm h-14 rounded-2xl px-5 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-semibold text-gray-900"
                                        required
                                        defaultValue="17:00"
                                    >
                                        {timeOptions.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em] px-1">Internal Notes</label>
                                <input
                                    type="text"
                                    name="notes"
                                    placeholder="Optional instructions..."
                                    className="w-full bg-gray-50/50 border border-gray-100 text-sm h-14 rounded-2xl px-5 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-semibold text-gray-900"
                                />
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    disabled={loading}
                                    className="h-14 px-8 rounded-2xl text-xs font-bold text-gray-500 hover:bg-gray-100 border border-transparent transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 btn btn-primary h-14 rounded-2xl text-xs font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Shift"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
