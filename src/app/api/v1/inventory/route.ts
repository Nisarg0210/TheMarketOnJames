import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
    // API Key Authentication (Simple Header Check)
    const apiKey = req.headers.get("x-api-key");
    const validKey = process.env.POS_API_KEY;

    if (!validKey || apiKey !== validKey) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const products = await prisma.product.findMany({
            include: {
                batches: {
                    select: {
                        id: true,
                        qty: true,
                        expiryDate: true,
                        lotNumber: true,
                        location: { select: { name: true } }
                    }
                },
                location: { select: { name: true } }
            }
        });

        // Format for optimal POS consumption (flat structure or grouped)
        const inventory = products.map(p => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            category: p.categoryId, // Ideally fetch category name
            totalStock: p.batches.reduce((sum, b) => sum + b.qty, 0),
            location: p.location?.name || "Global",
            batches: p.batches.map(b => ({
                qty: b.qty,
                expiry: b.expiryDate,
                location: b.location?.name
            }))
        }));

        return NextResponse.json({ success: true, count: inventory.length, data: inventory });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
