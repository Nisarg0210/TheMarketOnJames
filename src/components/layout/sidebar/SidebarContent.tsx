"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Calendar, Settings, TrendingDown, AlertTriangle, DollarSign } from "lucide-react";
import { useSession } from "next-auth/react";

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Analytics", href: "/inventory/analytics", icon: TrendingDown },
    { name: "Clearance", href: "/inventory/clearance", icon: AlertTriangle },
    { name: "Schedule", href: "/schedule", icon: Calendar },
    { name: "Settings", href: "/settings", icon: Settings },
];

export default function SidebarContent() {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <div className="flex h-full flex-col bg-white">
            <div className="flex h-16 items-center border-b px-6">
                <span className="text-xl font-bold tracking-tight text-primary">Market ON</span>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                    ? "bg-accent text-accent-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    }`}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        );
                    })}

                    <div className="pt-4 pb-2">
                        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Staff
                        </p>
                        <Link href="/schedule/my-shifts" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === "/schedule/my-shifts" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                            <Calendar className="h-4 w-4" />
                            My Shifts
                        </Link>
                        <Link href="/schedule/availability" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === "/schedule/availability" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                            <Calendar className="h-4 w-4" />
                            {(session?.user as any)?.role === "admin" || (session?.user as any)?.role === "manager" ? "Staff Availability" : "My Availability"}
                        </Link>
                    </div>

                    {(session?.user as any)?.role === "admin" || (session?.user as any)?.role === "manager" ? (
                        <div className="pt-4 pb-2">
                            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Management
                            </p>
                            <Link href="/admin/swaps" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === "/admin/swaps" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                                <Package className="h-4 w-4" />
                                Swap Requests
                            </Link>
                            <Link href="/admin/payroll" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === "/admin/payroll" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                                <DollarSign className="h-4 w-4" />
                                Payroll Report
                            </Link>
                        </div>
                    ) : null}
                </nav>
            </div>

            {/* User Profile moved to Header */}
        </div>
    );
}
