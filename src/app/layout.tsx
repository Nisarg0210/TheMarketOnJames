import type { Metadata, Viewport } from "next";
import AuthProvider from "@/components/providers/AuthProvider";
import PWAInit from "@/components/pwa/PWAInit";
import ErrorBoundary from "@/components/providers/ErrorBoundary";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  title: "The Market ON",
  description: "Internal inventory and staff management system",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Market ON",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <AuthProvider>
            {children}
            <PWAInit />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
