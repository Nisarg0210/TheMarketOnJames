"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function PWAInit() {
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Register Service Worker
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/sw.js")
                .then((registration) => {
                    console.log("SW registered:", registration);
                })
                .catch((error) => {
                    console.error("SW registration failed:", error);
                });
        }

        // Listen for install prompt
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setInstallPrompt(e);
            // Show prompt only if not already installed and on mobile
            if (window.matchMedia("(max-width: 768px)").matches) {
                setShowPrompt(true);
            }
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        installPrompt.userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === "accepted") {
                console.log("User accepted the install prompt");
            }
            setInstallPrompt(null);
            setShowPrompt(false);
        });
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-white rounded-xl shadow-xl border border-blue-100 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <Download className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm">Install App</h3>
                        <p className="text-xs text-gray-500">Add to home screen for offline use</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowPrompt(false)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleInstallClick}
                        className="btn btn-primary btn-sm rounded-lg px-3 py-1.5 text-xs"
                    >
                        Install
                    </button>
                </div>
            </div>
        </div>
    );
}
