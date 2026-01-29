/**
 * CSV Parser utility for bulk product imports
 */

export interface ProductCSVRow {
    name: string;
    sku: string;
    categoryName: string;
    minStockThreshold?: number;
    initialQty?: number;
}

export interface ParseResult {
    success: boolean;
    data: ProductCSVRow[];
    errors: { line: number; message: string }[];
}

/**
 * Parse CSV content into product data
 */
export function parseProductCSV(csvContent: string): ParseResult {
    const errors: { line: number; message: string }[] = [];
    const data: ProductCSVRow[] = [];

    const lines = csvContent.trim().split('\n');
    
    if (lines.length === 0) {
        return { success: false, data: [], errors: [{ line: 0, message: 'CSV file is empty' }] };
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredFields = ['name', 'sku', 'categoryname'];
    
    const missingFields = requiredFields.filter(field => !header.includes(field));
    if (missingFields.length > 0) {
        return {
            success: false,
            data: [],
            errors: [{ line: 1, message: `Missing required columns: ${missingFields.join(', ')}` }]
        };
    }

    // Get column indices
    const nameIndex = header.indexOf('name');
    const skuIndex = header.indexOf('sku');
    const categoryIndex = header.indexOf('categoryname');
    const minStockIndex = header.indexOf('minstockthreshold');
    const initialQtyIndex = header.indexOf('initialqty');

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines

        const values = parseCSVLine(line);
        const lineNumber = i + 1;

        // Validate required fields
        const name = values[nameIndex]?.trim();
        const sku = values[skuIndex]?.trim();
        const categoryName = values[categoryIndex]?.trim();

        if (!name) {
            errors.push({ line: lineNumber, message: 'Name is required' });
            continue;
        }

        if (!sku) {
            errors.push({ line: lineNumber, message: 'SKU is required' });
            continue;
        }

        if (!categoryName) {
            errors.push({ line: lineNumber, message: 'Category name is required' });
            continue;
        }

        // Parse optional fields
        const row: ProductCSVRow = {
            name,
            sku,
            categoryName,
        };

        if (minStockIndex !== -1 && values[minStockIndex]) {
            const minStock = parseInt(values[minStockIndex]);
            if (isNaN(minStock) || minStock < 0) {
                errors.push({ line: lineNumber, message: 'Min stock threshold must be a positive number' });
                continue;
            }
            row.minStockThreshold = minStock;
        }

        if (initialQtyIndex !== -1 && values[initialQtyIndex]) {
            const qty = parseInt(values[initialQtyIndex]);
            if (isNaN(qty) || qty < 0) {
                errors.push({ line: lineNumber, message: 'Initial quantity must be a positive number' });
                continue;
            }
            row.initialQty = qty;
        }

        data.push(row);
    }

    return {
        success: errors.length === 0,
        data,
        errors
    };
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    values.push(current);
    return values;
}

/**
 * Generate a sample CSV template
 */
export function generateCSVTemplate(): string {
    return `name,sku,categoryName,minStockThreshold,initialQty
Organic Milk 2%,SKU001,Dairy,10,50
Whole Wheat Bread,SKU002,Bakery,15,30
Fresh Apples,SKU003,Produce,20,100`;
}
