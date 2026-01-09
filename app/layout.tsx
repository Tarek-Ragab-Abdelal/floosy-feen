import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DateProvider } from "@/contexts/DateContext";
import { RepositoryProvider } from "@/contexts/RepositoryContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Floosy Feen - Personal Finance Tracker",
  description: "Local-first personal finance management with multi-currency support and projections",
  keywords: ["finance", "budget", "money", "tracking", "personal finance"],
  authors: [{ name: "Tarek Ragab" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <RepositoryProvider>
          <DateProvider>
            {children}
          </DateProvider>
        </RepositoryProvider>
      </body>
    </html>
  );
}
