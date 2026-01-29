"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

interface ExportButtonProps {
    action: () => Promise<string>; // Server action that returns CSV string
    filename: string;
    label: string;
}

export default function ExportButton({ action, filename, label }: ExportButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            const csv = await action();
            // Create a blob and download
            const blob = new Blob([csv], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Export failed", error);
            alert("Failed to export data");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className="btn btn-outline flex items-center gap-2 text-sm"
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {label}
        </button>
    );
}
