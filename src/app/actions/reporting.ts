"use server";

import prisma from "@/lib/prisma";
import { jsonToCsv } from "@/lib/csv";
import { format } from "date-fns";

export async function exportProductsCsv() {
    const products = await prisma.product.findMany({
        include: { category: true },
        orderBy: { name: "asc" }
    });

    const data = products.map(p => ({
        name: p.name,
        category: p.category.name,
        sku: p.sku || "",
        minStock: p.minStockThreshold || "",
        trackExpiry: p.expiryTracking ? "Yes" : "No",
        createdAt: format(p.createdAt, "yyyy-MM-dd")
    }));

    const csv = jsonToCsv(data, [
        { header: "Name", key: "name" },
        { header: "Category", key: "category" },
        { header: "SKU", key: "sku" },
        { header: "Min Stock", key: "minStock" },
        { header: "Track Expiry", key: "trackExpiry" },
        { header: "Created At", key: "createdAt" }
    ]);

    return csv;
}

export async function exportInventoryCsv() {
    const batches = await prisma.inventoryBatch.findMany({
        include: { product: { include: { category: true } } },
        orderBy: { receivedDate: "desc" }
    });

    const data = batches.map(b => ({
        product: b.product.name,
        category: b.product.category.name,
        qty: b.qty,
        receivedDate: format(b.receivedDate, "yyyy-MM-dd"),
        expiryDate: b.expiryDate ? format(b.expiryDate, "yyyy-MM-dd") : "N/A",
        vendor: b.vendor || "",
        lot: b.lotNumber || "",
        location: b.storageLocation || ""
    }));

    const csv = jsonToCsv(data, [
        { header: "Product", key: "product" },
        { header: "Category", key: "category" },
        { header: "Quantity", key: "qty" },
        { header: "Received Date", key: "receivedDate" },
        { header: "Expiry Date", key: "expiryDate" },
        { header: "Vendor", key: "vendor" },
        { header: "Lot #", key: "lot" },
        { header: "Location", key: "location" }
    ]);

    return csv;
}
