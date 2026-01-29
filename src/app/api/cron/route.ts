import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { addDays, startOfDay, endOfDay } from "date-fns";
import { sendEmail } from "@/lib/email";

export const dynamic = 'force-dynamic'; // Ensure this route is not cached

export async function GET(req: Request) {
    try {
        const today = new Date();
        const targetDate20 = addDays(today, 20);
        const targetDate1 = addDays(today, 1);

        const expiringIn20 = await prisma.inventoryBatch.findMany({
            where: {
                expiryDate: {
                    gte: startOfDay(targetDate20),
                    lte: endOfDay(targetDate20),
                },
                alert20Sent: false,
            },
            include: { product: true }
        });

        const expiringIn1 = await prisma.inventoryBatch.findMany({
            where: {
                expiryDate: {
                    gte: startOfDay(targetDate1),
                    lte: endOfDay(targetDate1),
                },
                alert1Sent: false,
            },
            include: { product: true }
        });

        const admins = await prisma.user.findMany({
            where: { role: { in: ["admin", "manager"] } }
        });

        const adminEmails = admins.map(u => u.email).filter(Boolean) as string[];
        let notificationCount = 0;

        // Process 20-day alerts
        if (expiringIn20.length > 0) {
            const itemsList = expiringIn20.map(b => `<li>${b.product.name} (Qty: ${b.qty})</li>`).join("");
            await sendEmail({
                to: adminEmails,
                subject: `Expiring Soon: ${expiringIn20.length} items (20 days)`,
                html: `<p>The following items expire in 20 days:</p><ul>${itemsList}</ul><a href="${process.env.NEXTAUTH_URL}/inventory/expiry">View Inventory</a>`
            });
        }

        for (const batch of expiringIn20) {
            for (const admin of admins) {
                await prisma.notification.create({
                    data: {
                        userId: admin.id,
                        type: "expiry_20",
                        title: "Expiry Alert: 20 Days",
                        message: `${batch.product.name} (Qty: ${batch.qty}) expires in 20 days`,
                        link: "/inventory/expiry"
                    }
                });
            }
            await prisma.inventoryBatch.update({
                where: { id: batch.id },
                data: { alert20Sent: true }
            });
            notificationCount++;
        }

        // Process 1-day alerts
        if (expiringIn1.length > 0) {
            const itemsList = expiringIn1.map(b => `<li>${b.product.name} (Qty: ${b.qty})</li>`).join("");
            await sendEmail({
                to: adminEmails,
                subject: `URGENT: ${expiringIn1.length} items expire TOMORROW`,
                html: `<p>The following items expire TOMORROW:</p><ul>${itemsList}</ul><a href="${process.env.NEXTAUTH_URL}/inventory/expiry">View Inventory</a>`
            });
        }

        for (const batch of expiringIn1) {
            for (const admin of admins) {
                await prisma.notification.create({
                    data: {
                        userId: admin.id,
                        type: "expiry_1",
                        title: "URGENT: Expiry Tomorrow",
                        message: `${batch.product.name} (Qty: ${batch.qty}) expires TOMORROW!`,
                        link: "/inventory/expiry"
                    }
                });
            }
            await prisma.inventoryBatch.update({
                where: { id: batch.id },
                data: { alert1Sent: true }
            });
            notificationCount++;
        }

        return NextResponse.json({
            success: true,
            processed: {
                expired20: expiringIn20.length,
                expired1: expiringIn1.length,
                notificationsCreated: notificationCount * admins.length
            }
        });

    } catch (error) {
        console.error("Cron Job Error:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
