"use client";

import { deleteCategory, deleteProduct } from "@/app/actions/inventory";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export function DeleteCategoryButton({ id }: { id: string }) {
    const [loading, setLoading] = useState(false);

    return (
        <button
            onClick={async () => {
                if (confirm("Are you sure?")) {
                    setLoading(true);
                    const result = await deleteCategory(id);
                    setLoading(false);
                    if (result?.error) alert(result.error);
                }
            }}
            disabled={loading}
            className="text-red-600 hover:text-red-900 disabled:opacity-50"
            title="Delete"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    );
}

export function DeleteProductButton({ id }: { id: string }) {
    const [loading, setLoading] = useState(false);

    return (
        <button
            onClick={async () => {
                if (confirm("Are you sure?")) {
                    setLoading(true);
                    const result = await deleteProduct(id);
                    setLoading(false);
                    if (result?.error) alert(result.error);
                }
            }}
            disabled={loading}
            className="text-red-600 hover:text-red-900 disabled:opacity-50"
            title="Delete"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    );
}
