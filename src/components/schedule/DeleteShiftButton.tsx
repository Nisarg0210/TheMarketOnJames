"use client";

import { deleteShift } from "@/app/actions/schedule";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export function DeleteShiftButton({ shiftId, scheduleId }: { shiftId: string, scheduleId: string }) {
    const [loading, setLoading] = useState(false);

    return (
        <button
            onClick={async () => {
                if (confirm("Delete this shift?")) {
                    setLoading(true);
                    await deleteShift(shiftId, scheduleId);
                    setLoading(false);
                }
            }}
            disabled={loading}
            className="text-red-400 hover:text-red-600 disabled:opacity-50 p-1"
            title="Delete"
        >
            <Trash2 className="w-3 h-3" />
        </button>
    );
}
