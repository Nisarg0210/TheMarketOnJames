import PageTitle from "@/components/layout/PageTitle";
import BarcodeScanner from "@/components/inventory/BarcodeScanner";

export default function ScannerPage() {
    return (
        <div className="space-y-6">
            <PageTitle title="Barcode Scanner" />
            <BarcodeScanner />
        </div>
    );
}
