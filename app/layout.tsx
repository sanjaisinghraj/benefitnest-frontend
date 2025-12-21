// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "BenefitNest Platform",
  description: "Employee benefits, rewards, and recognition platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        {/* Global Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1">{children}</main>

        {/* Global Footer */}
        <footer className="border-t bg-white py-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} BenefitNest · All rights reserved
        </footer>
      </body>
    </html>
  );
}