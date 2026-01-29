import type { Metadata, Viewport } from "next";
import AuthProvider from "@/components/providers/AuthProvider";
import ServiceWorkerRegister from "@/components/providers/ServiceWorkerRegister";
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
  title: "The Market ON - Internal",
  description: "Internal inventory and scheduling system",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Market ON",
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
            <ServiceWorkerRegister />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
