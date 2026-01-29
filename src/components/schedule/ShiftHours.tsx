"use client";

import { useState } from "react";
import { Edit2, Clock } from "lucide-react";
import UpdateHoursDialog from "./UpdateHoursDialog";
import { calculateShiftHours, formatHours } from "@/lib/utils/schedule";

interface ShiftHoursProps {
    shiftId: string;
    startTime: string;
    endTime: string;
    actualHours: number | null;
    isAdmin: boolean;
}

export default function ShiftHours({
    shiftId,
    startTime,
    endTime,
    actualHours,
    isAdmin
}: ShiftHoursProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const calculatedHours = calculateShiftHours(startTime, endTime);
    const displayHours = actualHours !== null ? actualHours : calculatedHours;
    const isOverridden = actualHours !== null;

    return (
        <>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-medium">
                <Clock className="w-3 h-3 text-blue-500" />
                <span className={isOverridden ? "text-amber-600 font-bold" : "text-blue-600"}>
                    {formatHours(displayHours)}
                </span>
                {isAdmin && (
                    <button
                        onClick={() => setIsDialogOpen(true)}
                        className="ml-auto p-0.5 hover:bg-blue-100 rounded text-blue-400 hover:text-blue-600 transition-colors"
                        title="Edit worked hours"
                    >
                        <Edit2 className="w-2.5 h-2.5" />
                    </button>
                )}
            </div>

            {isDialogOpen && (
                <UpdateHoursDialog
                    shiftId={shiftId}
                    currentHours={displayHours}
                    isOverridden={isOverridden}
                    onClose={() => setIsDialogOpen(false)}
                />
            )}
        </>
    );
}
