"use client";

import { WifiOff } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-gray-200">
                    <WifiOff className="w-10 h-10 text-gray-300" />
                </div>

                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-4">You&apos;re Offline</h1>

                <p className="text-gray-500 font-medium mb-12 leading-relaxed">
                    It looks like you don&apos;t have an active internet connection.
                    Don&apos;t worry, your last viewed schedule might still be available
                    in your offline data.
                </p>

                <div className="space-y-4">
                    <Link
                        href="/schedule/my-shifts"
                        className="block w-full btn btn-primary py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                    >
                        View Cached Shifts
                    </Link>

                    <button
                        onClick={() => window.location.reload()}
                        className="block w-full bg-white text-gray-700 py-4 rounded-2xl font-bold border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                        Try Reconnecting
                    </button>
                </div>
            </div>
        </div>
    );
}
