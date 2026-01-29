"use client";

import { useState } from "react";
import { requestShiftSwap } from "@/app/actions/schedule";
import { Loader2 } from "lucide-react";

export default function SwapRequestDialog({ shiftId }: { shiftId: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        await requestShiftSwap(shiftId, formData.get("message") as string);
        setLoading(false);
        setOpen(false);
        alert("Request sent!");
    };

    if (!open) return <button onClick={() => setOpen(true)} className="btn btn-xs btn-outline">Request Swap</button>;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                <h3 className="font-bold text-lg mb-4">Request Shift Swap</h3>
                <form action={handleSubmit} className="space-y-4">
                    <textarea
                        name="message"
                        className="textarea w-full"
                        placeholder="Reason for swap..."
                        required
                    />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost">Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
