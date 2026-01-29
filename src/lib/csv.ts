export function jsonToCsv(data: any[], columns: { header: string; key: string }[]): string {
    if (!data || data.length === 0) {
        return "";
    }

    const headers = columns.map((c) => c.header).join(",");
    const rows = data.map((row) => {
        return columns
            .map((c) => {
                const value = row[c.key] === null || row[c.key] === undefined ? "" : row[c.key];
                // Escape quotes and wrap in quotes if necessary
                const stringValue = String(value);
                if (stringValue.includes(",") || stringValue.includes("\"") || stringValue.includes("\n")) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            })
            .join(",");
    });

    return [headers, ...rows].join("\n");
}
