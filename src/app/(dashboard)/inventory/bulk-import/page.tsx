import PageTitle from "@/components/layout/PageTitle";
import BulkImport from "@/components/inventory/BulkImport";

export default function BulkImportPage() {
    return (
        <div className="space-y-6">
            <PageTitle title="Bulk Product Import" />
            <div className="p-6">
                <BulkImport />
            </div>
        </div>
    );
}
