"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface PageContextType {
    title: string;
    showSearch: boolean;
    setPageTitle: (title: string, showSearch?: boolean) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export function PageProvider({ children }: { children: ReactNode }) {
    const [title, setTitle] = useState("Dashboard");
    const [showSearch, setShowSearch] = useState(true);

    const setPageTitle = (newTitle: string, newShowSearch: boolean = true) => {
        setTitle(newTitle);
        setShowSearch(newShowSearch);
    };

    return (
        <PageContext.Provider value={{ title, showSearch, setPageTitle }}>
            {children}
        </PageContext.Provider>
    );
}

export function usePageContext() {
    const context = useContext(PageContext);
    if (!context) {
        throw new Error("usePageContext must be used within PageProvider");
    }
    return context;
}
