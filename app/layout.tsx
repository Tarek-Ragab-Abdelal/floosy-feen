import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DateProvider } from "@/contexts/DateContext";
import { RepositoryProvider } from "@/contexts/RepositoryContext";
import { SITE_URL } from "./config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const BASE_URL = SITE_URL;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Floosy Feen - Personal Finance Tracker",
    template: "%s | Floosy Feen",
  },
  description:
    "Floosy Feen is a local-first personal finance tracker with multi-currency support, budget streams, automated recurrences, and future balance projections. All your data stays on your device.",
  keywords: [
    "personal finance",
    "budget tracker",
    "money management",
    "expense tracking",
    "multi-currency",
    "finance projections",
    "local-first",
    "offline finance app",
    "budget planner",
    "floosy feen",
  ],
  authors: [{ name: "Tarek Ragab", url: "https://github.com/Tarek-Ragab-Abdelal" }],
  creator: "Tarek Ragab",
  publisher: "Tarek Ragab",
  category: "finance",
  applicationName: "Floosy Feen",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Floosy Feen",
    title: "Floosy Feen - Personal Finance Tracker",
    description:
      "Track your finances locally with multi-currency support, budget streams, and future balance projections. No account needed — your data stays on your device.",
    images: [
      {
        url: `${BASE_URL}/logo-white-bg.png`,
        width: 1200,
        height: 630,
        alt: "Floosy Feen - Personal Finance Tracker",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Floosy Feen - Personal Finance Tracker",
    description:
      "Track your finances locally with multi-currency support, budget streams, and future balance projections.",
    images: [`${BASE_URL}/logo-white-bg.png`],
    creator: "@TarekRagab",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo-no-bg.png",
  },
  manifest: `${BASE_URL}/manifest.json`,
  alternates: {
    canonical: BASE_URL,
  },
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
