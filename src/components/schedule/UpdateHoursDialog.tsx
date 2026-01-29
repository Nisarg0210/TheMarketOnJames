"use client";

import { useState } from "react";
import { updateShiftHours } from "@/app/actions/schedule";
import { Loader2, X, Check } from "lucide-react";

interface UpdateHoursDialogProps {
    shiftId: string;
    currentHours: number;
    isOverridden: boolean;
    onClose: () => void;
}

export default function UpdateHoursDialog({
    shiftId,
    currentHours,
    isOverridden,
    onClose
}: UpdateHoursDialogProps) {
    const [hours, setHours] = useState<string>(currentHours.toString());
    const [loading, setLoading] = useState(false);

    async function handleSave() {
        setLoading(true);
        const numHours = parseFloat(hours);
        if (isNaN(numHours)) {
            alert("Please enter a valid number for hours.");
            setLoading(false);
            return;
        }
        const result = await updateShiftHours(shiftId, numHours);
        setLoading(false);
        if (result?.error) {
            alert(result.error);
        } else {
            onClose();
        }
    }

    async function handleReset() {
        setLoading(true);
        const result = await updateShiftHours(shiftId, null);
        setLoading(false);
        if (result?.error) {
            alert(result.error);
        } else {
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Update Worked Hours</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total Hours
                        </label>
                        <input
                            type="number"
                            step="0.25"
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            className="input w-full"
                            placeholder="e.g. 8.5"
                            disabled={loading}
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Manually override the calculated hours from the schedule.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="btn btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Save Hours
                        </button>

                        {isOverridden && (
                            <button
                                onClick={handleReset}
                                disabled={loading}
                                className="btn btn-outline w-full"
                            >
                                Reset to Scheduled
                            </button>
                        )}

                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="btn btn-ghost w-full"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
