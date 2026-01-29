"use client";

import { Bell } from "lucide-react";
import { useState, useEffect } from "react";
// import Link from "next/link"; 
// Client side fetch for MVP notifications
// In production, use SWR or React Query or Server Components with polling

interface Notification {
    id: string;
    title: string;
    message: string;
    createdAt: string;
    read: boolean;
}

export default function NotificationBell({ userId }: { userId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Poll for notifications every 60s
        const fetchNotifications = async () => {
            try {
                // Needs an API route to fetch notifications for user
                const res = await fetch(`/api/notifications?userId=${userId}`);
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data);
                    setUnreadCount(data.filter((n: Notification) => !n.read).length);
                }
            } catch (e) {
                console.error("Failed to fetch notifications", e);
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [userId]);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((n) => (
                                <div key={n.id} className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${!n.read ? 'bg-blue-50/50' : ''}`}>
                                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                                    <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                                    <p className="text-xs text-gray-400 mt-1 text-right">{new Date(n.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-center text-sm text-gray-500">
                                No notifications
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
