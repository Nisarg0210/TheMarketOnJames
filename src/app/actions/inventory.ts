"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
    const name = formData.get("name") as string;

    if (!name) return { error: "Name is required" };

    try {
        await prisma.category.create({
            data: { name },
        });
        revalidatePath("/inventory/categories");
        return { success: true };
    } catch (error) {
        return { error: "Failed to create category" };
    }
}

export async function deleteCategory(id: string) {
    try {
        await prisma.category.delete({ where: { id } });
        revalidatePath("/inventory/categories");
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete category" };
    }
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function createProduct(formData: FormData) {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || "system"; // Fallback if no session (shouldn't happen in protected route)

    const name = formData.get("name") as string;
    const categoryId = formData.get("categoryId") as string;
    const expiryTracking = formData.get("expiryTracking") === "on";
    const sku = formData.get("sku") as string || null;
    const minStockThreshold = formData.get("minStockThreshold") ? parseInt(formData.get("minStockThreshold") as string) : null;
    const locationId = formData.get("locationId") as string || null;

    // New fields
    const initialQty = formData.get("initialQty") ? parseInt(formData.get("initialQty") as string) : 0;
    const expiryDateStr = formData.get("expiryDate") as string;

    if (!name || !categoryId) return { error: "Name and Category are required" };

    try {
        const product = await prisma.product.create({
            data: {
                name,
                categoryId,
                expiryTracking,
                sku,
                minStockThreshold,
                locationId
            },
        });

        // Create initial batch if qty is provided
        if (initialQty > 0) {
            await prisma.inventoryBatch.create({
                data: {
                    productId: product.id,
                    qty: initialQty,
                    expiryDate: expiryDateStr ? new Date(expiryDateStr) : null,
                    locationId: locationId
                }
            });
        }

        await logAudit(userId, "CREATE_PRODUCT", `Created product: ${name}${initialQty > 0 ? ` with ${initialQty} initial stock` : ""}`, product.id, "Product");
        revalidatePath("/inventory/products");
        revalidatePath("/inventory");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Failed to create product" };
    }
}

export async function deleteProduct(id: string) {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || "system";

    try {
        // Delete related batches first to avoid foreign key constraints
        await prisma.inventoryBatch.deleteMany({
            where: { productId: id }
        });

        await prisma.product.delete({ where: { id } });
        await logAudit(userId, "DELETE_PRODUCT", `Deleted product ID: ${id}`, id, "Product");
        revalidatePath("/inventory/products");
        revalidatePath("/inventory");
        return { success: true };
    } catch (error) {
        console.error("Delete product error:", error);
        return { error: "Failed to delete product. Ensure it has no active inventory batches." };
    }
}

import { redirect } from "next/navigation";

export async function createBatch(formData: FormData) {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || "system";

    const productId = formData.get("productId") as string;
    const qty = parseInt(formData.get("qty") as string);
    const expiryDateString = formData.get("expiryDate") as string;
    const receivedDateString = formData.get("receivedDate") as string;
    const vendorId = formData.get("vendorId") as string || null; // Changed to vendorId
    const lotNumber = formData.get("lotNumber") as string || null;
    const storageLocation = formData.get("storageLocation") as string || null;
    const locationId = formData.get("locationId") as string || null;

    if (!productId || !qty) return { error: "Product and Quantity are required" };

    try {
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) return { error: "Product not found" };

        let expiryDate = null;
        if (product.expiryTracking) {
            if (!expiryDateString) return { error: "Expiry Date is required for this product" };
            expiryDate = new Date(expiryDateString);
        }

        const batch = await prisma.inventoryBatch.create({
            data: {
                productId,
                qty,
                expiryDate,
                receivedDate: receivedDateString ? new Date(receivedDateString) : new Date(),
                vendorId,
                lotNumber,
                storageLocation,
                locationId
            },
        });
        await logAudit(userId, "UPDATE_INVENTORY", `Added ${qty} to product ${product.name}`, batch.id, "InventoryBatch");

        revalidatePath("/inventory");
        revalidatePath("/inventory/products");
        revalidatePath("/");
    } catch (error) {
        console.error(error);
        return { error: "Failed to create batch" };
    }

    redirect("/inventory");
}

/**
 * Get product by SKU for barcode scanning
 */
export async function getProductBySKU(sku: string) {
    if (!sku) return { error: "SKU is required" };

    try {
        const product = await prisma.product.findFirst({
            where: { sku },
            include: {
                category: true,
                batches: {
                    orderBy: { expiryDate: 'asc' }
                }
            }
        });

        if (!product) {
            return { error: "Product not found" };
        }

        const totalStock = product.batches.reduce((sum, batch) => sum + batch.qty, 0);

        return {
            success: true,
            product: {
                id: product.id,
                name: product.name,
                sku: product.sku,
                category: product.category.name,
                categoryId: product.categoryId,
                expiryTracking: product.expiryTracking,
                minStockThreshold: product.minStockThreshold,
                totalStock,
                batches: product.batches.map(b => ({
                    id: b.id,
                    qty: b.qty,
                    expiryDate: b.expiryDate?.toISOString() ?? null,
                    receivedDate: b.receivedDate.toISOString()
                }))
            }
        };
    } catch (error) {
        console.error("Get product by SKU error:", error);
        return { error: "Failed to fetch product" };
    }
}

/**
 * Bulk create products from CSV import
 */
export async function bulkCreateProducts(products: Array<{
    name: string;
    sku: string;
    categoryName: string;
    minStockThreshold?: number;
    initialQty?: number;
}>) {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id || "system";

    const results: Array<{ success: boolean; name: string; error?: string }> = [];

    try {
        // Get all categories first
        const categories = await prisma.category.findMany();
        const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));

        for (const productData of products) {
            try {
                // Find or create category
                let categoryId = categoryMap.get(productData.categoryName.toLowerCase());

                if (!categoryId) {
                    const newCategory = await prisma.category.create({
                        data: { name: productData.categoryName }
                    });
                    categoryId = newCategory.id;
                    categoryMap.set(productData.categoryName.toLowerCase(), categoryId);
                }

                // Check if SKU already exists
                const existing = await prisma.product.findFirst({
                    where: { sku: productData.sku }
                });

                if (existing) {
                    results.push({
                        success: false,
                        name: productData.name,
                        error: `SKU ${productData.sku} already exists`
                    });
                    continue;
                }

                // Create product
                const product = await prisma.product.create({
                    data: {
                        name: productData.name,
                        categoryId,
                        sku: productData.sku,
                        minStockThreshold: productData.minStockThreshold || null,
                        expiryTracking: false
                    }
                });

                // Create initial batch if quantity provided
                if (productData.initialQty && productData.initialQty > 0) {
                    await prisma.inventoryBatch.create({
                        data: {
                            productId: product.id,
                            qty: productData.initialQty
                        }
                    });
                }

                await logAudit(
                    userId,
                    "BULK_CREATE_PRODUCT",
                    `Bulk imported product: ${productData.name}`,
                    product.id,
                    "Product"
                );

                results.push({
                    success: true,
                    name: productData.name
                });

            } catch (error) {
                console.error(`Error creating product ${productData.name}:`, error);
                results.push({
                    success: false,
                    name: productData.name,
                    error: "Failed to create product"
                });
            }
        }

        revalidatePath("/inventory");
        revalidatePath("/inventory/products");

        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;

        return {
            success: true,
            results,
            summary: {
                total: products.length,
                successful: successCount,
                failed: failCount
            }
        };

    } catch (error) {
        console.error("Bulk create error:", error);
        return { error: "Failed to process bulk import" };
    }
}
