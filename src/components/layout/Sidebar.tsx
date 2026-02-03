"use client";

import { Menu, X } from "lucide-react";
import { useState, forwardRef, useImperativeHandle } from "react";
import SidebarContent from "./sidebar/SidebarContent";

export interface SidebarHandle {
    toggle: () => void;
}

const Sidebar = forwardRef<SidebarHandle>((props, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    useImperativeHandle(ref, () => ({
        toggle: () => setIsOpen((prev) => !prev),
    }));

    return (
        <>
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
                        <div className="h-full" onClick={() => setIsOpen(false)}>
                            {" "}
                            {/* Close on nav click */}
                            <SidebarContent />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});

Sidebar.displayName = "Sidebar";

export default Sidebar;
