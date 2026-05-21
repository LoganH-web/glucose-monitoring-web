import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Wellness",
  description: "Track CGM readings and get AI-powered wellness insights.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
