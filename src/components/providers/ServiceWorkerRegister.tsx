"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").then(
                (registration) => {
                    // Service Worker registered successfully

                    // Request notification permission if not already granted
                    if ("Notification" in window && Notification.permission === "default") {
                        Notification.requestPermission().then(permission => {
                            if (permission === 'granted') {
                                // Notification permission granted.
                            }
                        });
                    }
                },
                (err) => {
                    // Service Worker registration failed silently
                }
            );
        }
    }, []);

    return null;
}
