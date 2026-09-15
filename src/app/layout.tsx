import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/providers";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Annuity Vault",
  description: "A secure, centralized platform for managing your clients' annuity contracts — from purchase to annuitization.",
  icons: {
    icon: [
      {
        // White logo — visible on dark browser tabs
        url: "/icon-white.png",
        media: "(prefers-color-scheme: dark)",
        type: "image/png",
      },
      {
        // Black logo (same shape) — visible on light browser tabs
        url: "/icon-black.png",
        media: "(prefers-color-scheme: light)",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable}`}>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#0C1116',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#0C1116',
                },
              },
              error: {
                iconTheme: {
                  primary: '#FF3E46',
                  secondary: '#0C1116',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
