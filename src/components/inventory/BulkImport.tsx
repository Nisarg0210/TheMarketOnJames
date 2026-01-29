"use client";

import { useState } from "react";
import { bulkCreateProducts } from "@/app/actions/inventory";
import { parseProductCSV, generateCSVTemplate } from "@/lib/csvParser";
import { Upload, FileText, CheckCircle2, XCircle, Download, Loader2, AlertCircle } from "lucide-react";

interface ImportResult {
    success: boolean;
    name: string;
    error?: string;
}

export default function BulkImport() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<any[]>([]);
    const [parseErrors, setParseErrors] = useState<{ line: number; message: string }[]>([]);
    const [importing, setImporting] = useState(false);
    const [importResults, setImportResults] = useState<ImportResult[] | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = async (selectedFile: File | null) => {
        if (!selectedFile) return;

        setFile(selectedFile);
        setPreview([]);
        setParseErrors([]);
        setImportResults(null);

        try {
            const text = await selectedFile.text();
            const result = parseProductCSV(text);

            if (result.errors.length > 0) {
                setParseErrors(result.errors);
            }

            if (result.data.length > 0) {
                setPreview(result.data);
            }
        } catch (error) {
            setParseErrors([{ line: 0, message: "Failed to read file" }]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleImport = async () => {
        if (preview.length === 0) return;

        setImporting(true);
        try {
            const result = await bulkCreateProducts(preview);

            if (result.error) {
                setParseErrors([{ line: 0, message: result.error }]);
            } else if (result.results) {
                setImportResults(result.results);
            }
        } catch (error) {
            setParseErrors([{ line: 0, message: "Import failed" }]);
        } finally {
            setImporting(false);
        }
    };

    const handleDownloadTemplate = () => {
        const template = generateCSVTemplate();
        const blob = new Blob([template], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "product-import-template.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleReset = () => {
        setFile(null);
        setPreview([]);
        setParseErrors([]);
        setImportResults(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Upload className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Bulk Product Import</h3>
                            <p className="text-sm text-gray-500">Upload CSV file to import multiple products</p>
                        </div>
                    </div>
                    <button
                        onClick={handleDownloadTemplate}
                        className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Download Template
                    </button>
                </div>

                {/* File Upload Area */}
                {!importResults && (
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive
                                ? "border-primary bg-primary/5"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                    >
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-2">
                            Drag and drop your CSV file here, or
                        </p>
                        <label className="btn btn-primary cursor-pointer inline-block">
                            Browse Files
                            <input
                                type="file"
                                accept=".csv"
                                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                                className="hidden"
                            />
                        </label>
                        {file && (
                            <p className="text-sm text-gray-500 mt-3">
                                Selected: {file.name}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Parse Errors */}
            {parseErrors.length > 0 && (
                <div className="card bg-red-50 border-red-200">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <h4 className="font-bold text-red-900">Validation Errors</h4>
                    </div>
                    <div className="space-y-1">
                        {parseErrors.map((err, idx) => (
                            <p key={idx} className="text-sm text-red-700">
                                {err.line > 0 ? `Line ${err.line}: ` : ""}{err.message}
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* Preview Table */}
            {preview.length > 0 && !importResults && (
                <div className="card">
                    <h4 className="font-bold text-lg mb-4">
                        Preview ({preview.length} products)
                    </h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 px-3 font-semibold">Name</th>
                                    <th className="text-left py-2 px-3 font-semibold">SKU</th>
                                    <th className="text-left py-2 px-3 font-semibold">Category</th>
                                    <th className="text-left py-2 px-3 font-semibold">Min Stock</th>
                                    <th className="text-left py-2 px-3 font-semibold">Initial Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {preview.map((row, idx) => (
                                    <tr key={idx} className="border-b last:border-0">
                                        <td className="py-2 px-3">{row.name}</td>
                                        <td className="py-2 px-3 font-mono text-xs">{row.sku}</td>
                                        <td className="py-2 px-3">{row.categoryName}</td>
                                        <td className="py-2 px-3">{row.minStockThreshold || "-"}</td>
                                        <td className="py-2 px-3">{row.initialQty || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t">
                        <button
                            onClick={handleImport}
                            disabled={importing || parseErrors.length > 0}
                            className="btn btn-primary flex-1"
                        >
                            {importing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Importing...
                                </>
                            ) : (
                                `Import ${preview.length} Products`
                            )}
                        </button>
                        <button
                            onClick={handleReset}
                            disabled={importing}
                            className="btn bg-gray-100 hover:bg-gray-200 text-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Import Results */}
            {importResults && (
                <div className="card">
                    <h4 className="font-bold text-lg mb-4">Import Results</h4>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-600 font-semibold uppercase">Total</p>
                            <p className="text-2xl font-bold text-blue-900">{importResults.length}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-xs text-green-600 font-semibold uppercase">Successful</p>
                            <p className="text-2xl font-bold text-green-900">
                                {importResults.filter(r => r.success).length}
                            </p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                            <p className="text-xs text-red-600 font-semibold uppercase">Failed</p>
                            <p className="text-2xl font-bold text-red-900">
                                {importResults.filter(r => !r.success).length}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {importResults.map((result, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center justify-between p-3 rounded-lg ${result.success ? "bg-green-50" : "bg-red-50"
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    {result.success ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <XCircle className="w-4 h-4 text-red-600" />
                                    )}
                                    <span className="font-medium">{result.name}</span>
                                </div>
                                {result.error && (
                                    <span className="text-sm text-red-600">{result.error}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleReset}
                        className="btn btn-primary w-full mt-4"
                    >
                        Import More Products
                    </button>
                </div>
            )}
        </div>
    );
}
