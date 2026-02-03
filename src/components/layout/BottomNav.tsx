"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, Calendar, User } from "lucide-react";

const navItems = [
    {
        name: "Dashboard",
        href: "/",
        icon: Home,
    },
    {
        name: "Inventory",
        href: "/inventory/products",
        icon: Package,
    },
    {
        name: "Schedule",
        href: "/schedule",
        icon: Calendar,
    },
    {
        name: "Profile",
        href: "/settings",
        icon: User,
    },
];

export default function BottomNav() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/") {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-inset-bottom">
            <div className="grid grid-cols-4 h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-center gap-1 transition-colors touch-manipulation active:scale-95 ${active
                                    ? "text-blue-600 bg-blue-50"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                }`}
                        >
                            <Icon className={`w-6 h-6 ${active ? "stroke-[2.5]" : ""}`} />
                            <span className={`text-xs font-medium ${active ? "font-bold" : ""}`}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
