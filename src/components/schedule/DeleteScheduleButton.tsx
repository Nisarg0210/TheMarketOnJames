"use client";

import { useState } from "react";
import { deleteSchedule } from "@/app/actions/schedule";
import { Trash2, Loader2, AlertTriangle, X } from "lucide-react";

export default function DeleteScheduleButton({ scheduleId, weekLabel }: { scheduleId: string, weekLabel: string }) {
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    async function handleDelete() {
        setLoading(true);
        const result = await deleteSchedule(scheduleId);
        setLoading(false);
        if (result?.error) {
            alert(result.error);
        } else {
            setIsModalOpen(false);
        }
    }

    return (
        <>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsModalOpen(true);
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all group"
                title={`Delete schedule for ${weekLabel}`}
            >
                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Schedule?</h3>
                            <p className="text-gray-500 mb-6">
                                Are you sure you want to delete the schedule for <span className="font-semibold text-gray-900">{weekLabel}</span>?
                                This action cannot be undone and will remove all assigned shifts.
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                    Delete Schedule
                                </button>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={loading}
                                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
