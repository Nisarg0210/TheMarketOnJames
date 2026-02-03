"use client";

import { useEffect } from "react";
import { usePageContext } from "@/contexts/PageContext";

interface PageTitleProps {
    title: string;
    showSearch?: boolean;
}

export default function PageTitle({ title, showSearch = true }: PageTitleProps) {
    const { setPageTitle } = usePageContext();

    useEffect(() => {
        setPageTitle(title, showSearch);
    }, [title, showSearch, setPageTitle]);

    return null; // This component doesn't render anything
}
