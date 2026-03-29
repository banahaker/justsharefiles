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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-silver-bg font-sans min-h-screen">{children}</body>
    </html>
  );
}
