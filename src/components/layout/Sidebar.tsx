"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import SidebarContent from "./sidebar/SidebarContent";

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Toggle Button - Fixed to top left, visible only on mobile */}
            <div className="fixed top-0 left-0 z-[60] p-3 md:hidden">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2.5 text-gray-900 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 active:scale-90 transition-all"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Desktop Sidebar - hidden on mobile, fixed width on desktop */}
            <aside className="hidden md:flex h-screen w-64 flex-col border-r bg-white fixed inset-y-0 z-30">
                <SidebarContent />
            </aside>
            {/* Spacer for desktop layout to push content */}
            <div className="hidden md:block w-64 flex-shrink-0" />

            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Drawer */}
                    <div className="relative flex w-64 max-w-xs flex-1 flex-col bg-white pt-5 pb-4 shadow-xl">
                        <div className="absolute top-0 right-0 -mr-12 pt-2">
                            <button
                                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                onClick={() => setIsOpen(false)}
                            >
                                <span className="sr-only">Close sidebar</span>
                                <X className="h-6 w-6 text-white" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="h-full" onClick={() => setIsOpen(false)}> {/* Close on nav click */}
                            <SidebarContent />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
