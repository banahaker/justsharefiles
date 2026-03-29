import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SecureShare - Temporary File Sharing",
  description: "Share files securely with time-limited links",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
