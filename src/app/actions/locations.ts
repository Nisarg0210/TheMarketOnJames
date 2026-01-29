"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createLocation(formData: FormData) {
    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const timezone = formData.get("timezone") as string;

    if (!name) return;

    try {
        await prisma.location.create({
            data: { name, address, timezone: timezone || "America/Toronto" }
        });
        revalidatePath("/settings/locations");
        revalidatePath("/settings/locations");
    } catch (e) {
        console.error("Failed to create location", e);
    }
}

export async function deleteLocation(id: string, formData: FormData) {
    try {
        await prisma.location.delete({ where: { id } });
        revalidatePath("/settings/locations");
    } catch (e) {
        console.error("Failed to delete location", e);
    }
}
