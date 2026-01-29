"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createVendor(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;

    if (!name) return;

    try {
        await prisma.vendor.create({
            data: { name, email, phone, address }
        });
        revalidatePath("/inventory/vendors");
        revalidatePath("/inventory/vendors");
    } catch (e) {
        console.error("Failed to create vendor", e);
    }
}

export async function deleteVendor(id: string, formData: FormData) {
    try {
        await prisma.vendor.delete({ where: { id } });
        revalidatePath("/inventory/vendors");
    } catch (e) {
        console.error("Failed to delete vendor", e);
    }
}
