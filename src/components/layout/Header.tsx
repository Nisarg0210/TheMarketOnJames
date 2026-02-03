"use client";

import { useSession } from "next-auth/react";
import NotificationBell from "../notifications/NotificationBell";
import GlobalSearch from "@/components/layout/GlobalSearch";
import SignOutButton from "./SignOutButton";
import { usePageContext } from "@/contexts/PageContext";
import { Menu } from "lucide-react";

interface HeaderProps {
    onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { data: session } = useSession();
    const { title, showSearch } = usePageContext();

    return (
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-white px-4 md:px-6 shadow-sm">
            {/* Left Section */}
            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                {/* Mobile Menu Button - Only visible on mobile */}
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2.5 -ml-2 text-gray-900 hover:bg-gray-100 rounded-xl active:scale-90 transition-all touch-manipulation"
                    aria-label="Open menu"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Page Title */}
                <h1 className="text-base md:text-lg font-bold text-gray-900 truncate">
                    {title}
                </h1>

                {/* Search - Hidden on mobile, visible on desktop */}
                {showSearch && (
                    <div className="ml-auto w-full max-w-sm hidden lg:block">
                        <GlobalSearch />
                    </div>
                )}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                {/* Notification Bell */}
                {session?.user && <NotificationBell userId={(session.user as any).id} />}

                {/* User Profile */}
                {session?.user && (
                    <div className="flex items-center gap-2 md:gap-3 border-l pl-2 md:pl-4">
                        {/* User Info - Hidden on small mobile */}
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                                {session.user.name}
                            </span>
                            <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${(session.user as any).role === "admin"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-blue-100 text-blue-800"
                                    }`}
                            >
                                {(session.user as any).role || "Employee"}
                            </span>
                        </div>

                        {/* Avatar */}
                        <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm md:text-base flex-shrink-0">
                            {session.user.name?.[0]?.toUpperCase() || "U"}
                        </div>

                        {/* Sign Out Button - Hidden on small mobile */}
                        <div className="hidden sm:block">
                            <SignOutButton />
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
