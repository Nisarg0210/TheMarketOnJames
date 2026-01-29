"use client";

import { useEffect, useRef } from "react";
import { ensureNextWeekSchedule } from "@/app/actions/schedule";
import { useRouter } from "next/navigation";

export default function AutoEnsureSchedule({ isAdmin }: { isAdmin: boolean }) {
    const hasChecked = useRef(false);
    const router = useRouter();

    useEffect(() => {
        if (isAdmin && !hasChecked.current) {
            hasChecked.current = true;

            // Check if we already tried to auto-ensure today
            const todayKey = `auto-ensure-${new Date().toISOString().split('T')[0]}`;
            if (localStorage.getItem(todayKey)) return;

            const timer = setTimeout(async () => {
                const result = await ensureNextWeekSchedule();
                localStorage.setItem(todayKey, 'true');
                if (result?.created) {
                    router.refresh();
                }
            }, 2000); // 2 second delay to be non-intrusive
            return () => clearTimeout(timer);
        }
    }, [isAdmin, router]);

    return null;
}
