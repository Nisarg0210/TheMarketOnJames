"use client";

import { useState } from "react";
import { createCategory } from "@/app/actions/inventory";
import { Loader2 } from "lucide-react";

export default function CategoryForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError(null);

        try {
            const result = await createCategory(formData);
            if (result?.error) {
                setError(result.error);
            } else {
                // Reset form or show success toast
                // ideally reset the form using ref or key
                (document.getElementById("category-form") as HTMLFormElement).reset();
            }
        } catch (e) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="card h-fit">
            <h3 className="font-semibold mb-4">Add New Category</h3>
            <form id="category-form" action={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                        type="text"
                        name="name"
                        className="input"
                        placeholder="e.g. Dairy"
                        required
                        disabled={loading}
                    />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Create Category"}
                </button>
            </form>
        </div>
    );
}
