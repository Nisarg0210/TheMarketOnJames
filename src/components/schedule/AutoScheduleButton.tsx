"use client";

import { useState } from "react";
import { ensureNextWeekSchedule } from "@/app/actions/schedule";
import { Sparkles, Loader2 } from "lucide-react";

export default function AutoScheduleButton() {
    const [loading, setLoading] = useState(false);

    async function handleAutoCreate() {
        setLoading(true);
        const result = await ensureNextWeekSchedule();
        setLoading(false);
        if (result.error) {
            alert(result.error);
        } else if (result.created) {
            alert("Next week's draft schedule has been created!");
        } else {
            alert("Next week's schedule already exists.");
        }
    }

    return (
        <button
            onClick={handleAutoCreate}
            disabled={loading}
            className="btn btn-outline btn-sm flex items-center gap-2"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-500" />}
            Auto-Generate Next Week
        </button>
    );
}
