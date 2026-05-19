import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glucose Monitor",
  description: "Track Eaglenos CGM readings and get AI-powered insights.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
