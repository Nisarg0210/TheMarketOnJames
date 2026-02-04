"use client";

import Link from "next/link";
import { WifiOff, RefreshCw, Home } from "lucide-react";

export default function OfflinePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
            <div className="p-6 bg-white rounded-3xl shadow-xl w-full max-w-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <WifiOff className="w-10 h-10 text-gray-400" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">You are offline</h1>
                    <p className="text-gray-500">
                        Check your internet connection to access the full features of Market ON.
                    </p>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-left">
                    <p className="text-xs font-semibold text-amber-700 uppercase mb-2">
                        Available Offline
                    </p>
                    <ul className="space-y-2 text-sm text-amber-800">
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                            View previously loaded schedules
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                            View categories list
                        </li>
                    </ul>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-primary w-full gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                    <Link href="/" className="btn btn-secondary w-full gap-2">
                        <Home className="w-4 h-4" />
                        Go to Dashboard
                    </Link>
                </div>
            </div>

            <p className="text-xs text-gray-400 mt-8">
                Market ON Internal System &bull; v1.0
            </p>
        </div>
    );
}
