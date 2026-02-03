"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { X, Camera, RotateCcw } from "lucide-react";

interface MobileScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (decodedText: string) => void;
}

export default function MobileScannerModal({ isOpen, onClose, onScan }: MobileScannerModalProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    useEffect(() => {
        if (!isOpen) {
            cleanupScanner();
            return;
        }

        // Initialize scanner when modal opens
        const initScanner = async () => {
            try {
                // Check permissions first
                try {
                    await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                    setHasPermission(true);
                } catch (err) {
                    console.error("Camera permission denied:", err);
                    setHasPermission(false);
                    setError("Camera permission is required to scan barcodes.");
                    return;
                }

                await startScanning();
            } catch (err) {
                console.error("Failed to initialize scanner:", err);
                setError("Failed to start camera. Please try again.");
            }
        };

        // Small delay to ensure DOM is ready
        const timer = setTimeout(initScanner, 100);

        return () => {
            clearTimeout(timer);
            cleanupScanner();
        };
    }, [isOpen]);

    const startScanning = async () => {
        if (scannerRef.current) return;

        const scanner = new Html5Qrcode("reader");
        scannerRef.current = scanner;

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            formatsToSupport: [
                Html5QrcodeSupportedFormats.UPC_A,
                Html5QrcodeSupportedFormats.UPC_E,
                Html5QrcodeSupportedFormats.EAN_13,
                Html5QrcodeSupportedFormats.EAN_8,
                Html5QrcodeSupportedFormats.CODE_128,
                Html5QrcodeSupportedFormats.QR_CODE
            ]
        };

        try {
            await scanner.start(
                { facingMode: "environment" },
                config,
                (decodedText) => {
                    playSuccessSound();
                    onScan(decodedText);
                    onClose();
                },
                (errorMessage) => {
                    // Ignore scan errors as they happen constantly when no code is found
                }
            );
            setError(null);
        } catch (err) {
            console.error("Error starting scanner:", err);
            setError("Could not start video stream. Ensure camera is not in use.");
        }
    };

    const cleanupScanner = async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
                scannerRef.current.clear();
            } catch (err) {
                console.error("Failed to stop scanner:", err);
            }
            scannerRef.current = null;
        }
    };

    const playSuccessSound = () => {
        const audio = new Audio('/sounds/beep.mp3'); // We'll need to add this or use a data URI
        audio.play().catch(() => { }); // Ignore errors
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all backdrop-blur-md"
            >
                <X className="w-6 h-6" />
            </button>

            <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Camera className="w-5 h-5 text-green-400" />
                        <span className="font-bold">Scan Barcode</span>
                    </div>
                </div>

                {/* Scanner Area */}
                <div className="relative bg-black aspect-square overflow-hidden">
                    <div id="reader" className="w-full h-full object-cover"></div>

                    {/* Overlay Guide */}
                    <div className="absolute inset-0 pointer-events-none border-2 border-white/20 m-12 rounded-xl">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-xl"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-xl"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-xl"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-xl"></div>

                        {/* Scanning Line Animation */}
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                    </div>

                    {!hasPermission && hasPermission !== null && (
                        <div className="absolute inset-0 flex items-center justify-center p-6 text-center bg-gray-900/90 text-white">
                            <div>
                                <Camera className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                                <p className="mb-4">Camera access is blocked.</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-4 py-2 bg-white text-black rounded-full text-sm font-bold"
                                >
                                    Reload Page
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer / Instructions */}
                <div className="p-4 bg-white text-center">
                    <p className="text-sm font-medium text-gray-600 mb-3">
                        Point camera at a barcode or QR code
                    </p>
                    {error && (
                        <div className="p-2 mb-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}
                    <button
                        onClick={() => {
                            cleanupScanner();
                            setTimeout(() => startScanning(), 500);
                        }}
                        className="text-xs text-blue-600 font-semibold flex items-center justify-center gap-1 mx-auto hover:underline"
                    >
                        <RotateCcw className="w-3 h-3" />
                        Restart Camera
                    </button>
                </div>
            </div>

            <p className="mt-6 text-white/50 text-xs">
                Supports UPC, EAN, Code 128, and QR Codes
            </p>
        </div>
    );
}

// Add CSS animation for the scanning line
// This should ideally be in your global CSS
const styles = `
@keyframes scan {
    0% { top: 10%; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { top: 90%; opacity: 0; }
}
`;
