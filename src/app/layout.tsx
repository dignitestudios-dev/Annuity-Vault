import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/providers";

export const metadata: Metadata = {
  title: "Annuity Vault",
  description: "A secure, centralized platform for managing your clients' annuity contracts — from purchase to annuitization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
