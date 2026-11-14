import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rafiq — AI Study Companion | رفيق",
  description: "Personal AI tutoring platform for middle schools in Saudi Arabia",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-screen bg-neutral-50 text-neutral-900 font-sans antialiased selection:bg-primary-100 selection:text-primary-700">
        {children}
      </body>
    </html>
  );
}

