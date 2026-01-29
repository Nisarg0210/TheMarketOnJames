"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GlobalSearch() {
    const router = useRouter();
    const [query, setQuery] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
            setQuery("");
        }
    };

    return (
        <form onSubmit={handleSearch} className="relative w-full max-w-sm hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
                type="search"
                placeholder="Search products..."
                className="input !pl-10 h-9 text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </form>
    );
}
