import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) return new NextResponse("User ID required", { status: 400 });

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 20,
        });
        return NextResponse.json(notifications);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}
