"use client";

import { useState } from "react";
import { approveShiftSwap } from "@/app/actions/schedule";
import { Loader2 } from "lucide-react";

export default function SwapActions({ requestId }: { requestId: string }) {
    const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

    const handleAction = async (approved: boolean) => {
        setLoading(approved ? "approve" : "reject");
        try {
            const result = await approveShiftSwap(requestId, approved);
            if (result?.error) {
                alert(result.error);
            }
        } catch (e) {
            alert("An unexpected error occurred");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="flex justify-end gap-2">
            <button
                onClick={() => handleAction(true)}
                disabled={!!loading}
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1"
            >
                {loading === "approve" && <Loader2 className="w-3 h-3 animate-spin" />}
                Approve
            </button>
            <button
                onClick={() => handleAction(false)}
                disabled={!!loading}
                className="px-3 py-1.5 bg-white text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
                {loading === "reject" && <Loader2 className="w-3 h-3 animate-spin" />}
                Reject
            </button>
        </div>
    );
}
