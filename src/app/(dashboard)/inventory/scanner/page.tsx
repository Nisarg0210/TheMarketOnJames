import Header from "@/components/layout/Header";
import BarcodeScanner from "@/components/inventory/BarcodeScanner";

export default function ScannerPage() {
    return (
        <div className="space-y-6">
            <Header title="Barcode Scanner" />
            <BarcodeScanner />
        </div>
    );
}
