"use server";

import prisma from "@/lib/prisma";
import { addDays, subDays } from "date-fns";

export async function getInventoryAnalytics() {
    const today = new Date();
    const next7Days = addDays(today, 7);
    const last30Days = subDays(today, 30);

    // 1. Expiring Soon (Next 7 Days)
    const expiringSoonCount = await prisma.inventoryBatch.count({
        where: {
            expiryDate: {
                gte: today,
                lte: next7Days
            },
            qty: { gt: 0 } // Only count items in stock
        }
    });

    // 2. Already Expired (In Stock)
    const expiredInStockCount = await prisma.inventoryBatch.count({
        where: {
            expiryDate: { lt: today },
            qty: { gt: 0 }
        }
    });

    // 3. Low Stock Products
    const lowStockProducts = await prisma.product.findMany({
        where: {
            minStockThreshold: { not: null }
        },
        include: {
            batches: true
        }
    });

    // Calculate actual low stock count (where total qty < threshold)
    let lowStockCount = 0;
    for (const product of lowStockProducts) {
        // Explicitly type batch as any or specific type if needed, but inference should work
        // Using reduce with explicit initial value
        const totalQty = product.batches.reduce((sum, b) => sum + b.qty, 0);
        const threshold = (product as any).minStockThreshold; // Type safety workaround until full regeneration
        if (threshold !== null && threshold !== undefined && totalQty < threshold) {
            lowStockCount++;
        }
    }

    // 4. Total Value (Optional - if we had cost) - for now just Total Items
    const totalItems = await prisma.inventoryBatch.aggregate({
        _sum: { qty: true }
    });

    return {
        expiringSoonCount,
        expiredInStockCount,
        lowStockCount,
        totalItems: totalItems._sum.qty || 0
    };
}

export async function getClearanceItems() {
    const today = new Date();
    const next30Days = addDays(today, 30); // Configurable "Clearance" window

    return await prisma.inventoryBatch.findMany({
        where: {
            expiryDate: {
                gte: today,
                lte: next30Days
            },
            qty: { gt: 0 }
        },
        include: {
            product: true
        },
        orderBy: {
            expiryDate: 'asc'
        }
    });
}
