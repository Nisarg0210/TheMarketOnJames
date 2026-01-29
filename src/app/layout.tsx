import type { Metadata } from "next";
import AuthProvider from "@/components/providers/AuthProvider";
import ServiceWorkerRegister from "@/components/providers/ServiceWorkerRegister";
import ErrorBoundary from "@/components/providers/ErrorBoundary";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Market ON - Internal",
  description: "Internal inventory and scheduling system",
  manifest: "/manifest.json",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
  themeColor: "#2563eb",
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
