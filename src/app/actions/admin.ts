"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleUserStatus(userId: string, currentStatus: boolean, formData: FormData) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { active: !currentStatus },
        });
        revalidatePath("/admin/users");
    } catch (error) {
        console.error("Failed to update user status", error);
    }
}

export async function updateUserRole(userId: string, newRole: string, formData: FormData) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { role: newRole },
        });
        revalidatePath("/admin/users");
    } catch (error) {
        console.error("Failed to update user role", error);
    }
}
