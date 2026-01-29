"use server";

import prisma from "@/lib/prisma";
import { calculateShiftHours } from "@/lib/utils/schedule";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getPayrollSummary(startDate: Date, endDate: Date) {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as any)?.role === "admin" || (session?.user as any)?.role === "manager";

    if (!isAdmin) {
        throw new Error("Unauthorized");
    }

    try {
        const shifts = await prisma.shift.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                }
            },
            include: {
                user: true,
            }
        });

        const employeeSummary: Record<string, { name: string, totalHours: number, shiftCount: number }> = {};

        shifts.forEach(shift => {
            const userId = shift.userId;
            const userName = shift.user.name || "Unknown";
            const hours = shift.actualHours !== null ? shift.actualHours : calculateShiftHours(shift.startTime, shift.endTime);

            if (!employeeSummary[userId]) {
                employeeSummary[userId] = {
                    name: userName,
                    totalHours: 0,
                    shiftCount: 0,
                };
            }

            employeeSummary[userId].totalHours += hours;
            employeeSummary[userId].shiftCount += 1;
        });

        return Object.entries(employeeSummary).map(([id, data]) => ({
            id,
            ...data
        })).sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error("Failed to fetch payroll summary", error);
        return [];
    }
}
