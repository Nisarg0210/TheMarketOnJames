"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addDays, startOfWeek, isAfter } from "date-fns";

export async function createSchedule(formData: FormData) {
    const weekStartDate = formData.get("weekStartDate") as string;

    if (!weekStartDate) return;

    try {
        await prisma.schedule.create({
            data: {
                weekStartDate: new Date(weekStartDate),
                status: "draft",
            },
        });
        revalidatePath("/schedule");
    } catch (error) {
        console.error("Failed to create schedule", error);
    }
}

export async function publishSchedule(scheduleId: string) {
    try {
        await prisma.schedule.update({
            where: { id: scheduleId },
            data: { status: "published" },
        });
        // TODO: Send notifications to all employees?
        revalidatePath("/schedule");
    } catch (error) {
        console.error("Failed to publish schedule", error);
    }
}

export async function deleteSchedule(scheduleId: string) {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as any)?.role === "admin" || (session?.user as any)?.role === "manager";

    if (!isAdmin) {
        return { error: "Unauthorized" };
    }

    try {
        await prisma.$transaction([
            // 1. Delete all swap requests for shifts in this schedule
            prisma.shiftSwapRequest.deleteMany({
                where: { shift: { scheduleId } }
            }),
            // 2. Delete all comments for this schedule or its shifts
            prisma.scheduleComment.deleteMany({
                where: { OR: [{ scheduleId }, { shift: { scheduleId } }] }
            }),
            // 3. Delete all shifts in this schedule
            prisma.shift.deleteMany({
                where: { scheduleId }
            }),
            // 4. Delete the schedule itself
            prisma.schedule.delete({
                where: { id: scheduleId }
            })
        ]);

        revalidatePath("/schedule");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete schedule", error);
        return { error: "Failed to delete schedule" };
    }
}

export async function ensureNextWeekSchedule() {
    const nextMonday = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 7);

    try {
        const existing = await prisma.schedule.findFirst({
            where: {
                weekStartDate: {
                    equals: nextMonday
                }
            }
        });

        if (!existing) {
            await prisma.schedule.create({
                data: {
                    weekStartDate: nextMonday,
                    status: "draft",
                },
            });
            return { success: true, created: true };
        }
        return { success: true, created: false };
    } catch (error) {
        console.error("Failed to ensure next week schedule", error);
        return { error: "Failed to create next week's draft" };
    }
}

export async function addShift(formData: FormData) {
    const scheduleId = formData.get("scheduleId") as string;
    const userId = formData.get("userId") as string;
    const dateStr = formData.get("date") as string;
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    const notes = formData.get("notes") as string;

    if (!scheduleId || !userId || !dateStr || !startTime || !endTime) {
        return { error: "Missing required fields" };
    }

    try {
        const shiftDate = new Date(dateStr + "T00:00:00");

        // Helper to convert HH:mm to minutes from start of day
        const toMinutes = (time: string) => {
            const [h, m] = time.split(':').map(Number);
            return h * 60 + m;
        };

        const newStart = toMinutes(startTime);
        let newEnd = toMinutes(endTime);

        // If end time is before start time, it's an overnight shift
        const isOvernight = newEnd < newStart;
        if (isOvernight) {
            newEnd += 24 * 60; // Add 24 hours in minutes
        }

        // Validation: Check for Overlaps
        // We check shifts starting on the same day
        const existingShifts = await prisma.shift.findMany({
            where: {
                userId,
                date: shiftDate,
            }
        });

        const hasOverlap = existingShifts.some(shift => {
            const exStart = toMinutes(shift.startTime);
            let exEnd = toMinutes(shift.endTime);
            if (exEnd < exStart) exEnd += 24 * 60;

            return (newStart < exEnd && newEnd > exStart);
        });

        if (hasOverlap) {
            return { error: "Shift overlaps with an existing shift." };
        }

        await prisma.shift.create({
            data: {
                scheduleId,
                userId,
                date: shiftDate,
                startTime,
                endTime,
                notes,
            },
        });
        revalidatePath(`/schedule/${scheduleId}`);
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Failed to add shift" };
    }
}

export async function updateShiftHours(shiftId: string, hours: number | null) {
    try {
        const shift = await prisma.shift.update({
            where: { id: shiftId },
            data: { actualHours: hours },
            include: { schedule: true }
        });
        revalidatePath(`/schedule/${shift.scheduleId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update shift hours", error);
        return { error: "Failed to update shift hours" };
    }
}

export async function deleteShift(shiftId: string, scheduleId: string) {
    try {
        await prisma.shift.delete({ where: { id: shiftId } });
        revalidatePath(`/schedule/${scheduleId}`);
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete shift" };
    }
}

export async function updateAvailability(formData: FormData) {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) return { error: "Unauthorized" };

    try {
        const entries = Array.from(formData.entries());

        for (const [key, value] of entries) {
            if (key.startsWith("startTime_")) {
                const dateStr = key.replace("startTime_", "");
                const startTime = value as string;
                const endTime = formData.get(`endTime_${dateStr}`) as string;

                const date = new Date(dateStr + "T00:00:00");

                if (startTime && endTime) {
                    await prisma.availability.upsert({
                        where: {
                            userId_date: {
                                userId,
                                date
                            }
                        },
                        update: { startTime, endTime },
                        create: { userId, date, startTime, endTime }
                    });
                } else {
                    // If cleared, delete it
                    await prisma.availability.deleteMany({
                        where: { userId, date }
                    });
                }
            }
        }
        revalidatePath("/schedule/availability");
        return { success: true };
    } catch (error) {
        console.error("Failed to update availability", error);
        return { error: "Failed to update availability" };
    }
}

export async function addScheduleComment(formData: FormData) {
    const scheduleId = formData.get("scheduleId") as string;
    const content = formData.get("content") as string;
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId || !scheduleId || !content) return;

    try {
        await prisma.scheduleComment.create({
            data: { scheduleId, userId, comment: content }, // NOTE: Schema has 'comment', not 'content'. Fixed.
        });
        revalidatePath(`/schedule/${scheduleId}`);
    } catch (error) {
        console.error("Failed to add comment", error);
    }
}

export async function requestShiftSwap(shiftId: string, message: string) {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) return;

    try {
        await prisma.shiftSwapRequest.create({
            data: {
                shiftId,
                requestingUserId: userId,
                message,
                status: "PENDING"
            }
        });
        revalidatePath("/schedule/my-shifts");
    } catch (error) {
        console.error(error);
    }
}

export async function approveShiftSwap(requestId: string, approved: boolean) {
    try {
        const request = await prisma.shiftSwapRequest.findUnique({
            where: { id: requestId },
            include: { shift: { include: { schedule: true } } }
        });
        if (!request) return { error: "Request not found" };

        if (!approved) {
            await prisma.shiftSwapRequest.update({
                where: { id: requestId },
                data: { status: "REJECTED" }
            });
            revalidatePath("/admin/swaps");
            return { success: true };
        }

        // APPROVED CASE
        await prisma.$transaction([
            // 1. Delete all swap requests for this shift (including the current one)
            prisma.shiftSwapRequest.deleteMany({
                where: { shiftId: request.shiftId }
            }),
            // 2. Delete all comments for this shift
            prisma.scheduleComment.deleteMany({
                where: { shiftId: request.shiftId }
            }),
            // 3. Delete the shift itself
            prisma.shift.delete({
                where: { id: request.shiftId }
            })
        ]);

        revalidatePath("/admin/swaps");
        revalidatePath(`/schedule/${request.shift.scheduleId}`);
        revalidatePath("/schedule");
        return { success: true };
    } catch (error) {
        console.error("Failed to process swap request:", error);
        return { error: "Failed to process swap request" };
    }
}
