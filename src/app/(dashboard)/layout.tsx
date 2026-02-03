"use client";

import { useRef } from "react";
import Sidebar, { SidebarHandle } from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { PageProvider } from "@/contexts/PageContext";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const sidebarRef = useRef<SidebarHandle>(null);

    const handleMenuClick = () => {
        sidebarRef.current?.toggle();
    };

    return (
        <PageProvider>
            <div className="flex h-screen overflow-hidden bg-gray-50">
                <Sidebar ref={sidebarRef} />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <Header onMenuClick={handleMenuClick} />
                    <main className="flex-1 overflow-y-auto">
                        <div className="mx-auto min-h-full">{children}</div>
                    </main>
                    <BottomNav />
                </div>
            </div>
        </PageProvider>
    );
}
