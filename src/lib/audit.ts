import prisma from "@/lib/prisma";

// Use an enumerated type for actions to ensure consistency
export type AuditAction =
    | "CREATE_PRODUCT"
    | "UPDATE_PRODUCT"
    | "DELETE_PRODUCT"
    | "CREATE_CATEGORY"
    | "DELETE_CATEGORY"
    | "UPDATE_INVENTORY"
    | "CREATE_SCHEDULE"
    | "PUBLISH_SCHEDULE"
    | "UPDATE_USER_ROLE"
    | "LOGIN_SUCCESS"
    | "LOGIN_FAILURE"
    | "BULK_CREATE_PRODUCT";

export async function logAudit(
    userId: string,
    action: AuditAction,
    details: string,
    entityId?: string,
    entityType?: string
) {
    try {
        await prisma.auditLog.create({
            data: {
                actorId: userId,
                action,
                metaJson: JSON.stringify({ details }),
                entityId: entityId || "N/A",
                entityType: entityType || "System"
            }
        });
    } catch (error) {
        // Fallback logging if database fails - critical functionality
        console.error("AUDIT LOG FAILURE:", { userId, action, details, error });
    }
}
