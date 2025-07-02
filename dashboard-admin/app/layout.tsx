import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopBar from "./components/TopBar";
import { ClerkProvider } from "@clerk/nextjs";
import { SubscriptionProvider } from "../lib/subscription-context";
import { CacheProvider } from "../lib/cache-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Subleet",
  description: "Dashboard Web App for Subleet Clients",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <CacheProvider>
            <SubscriptionProvider>
              <TopBar />
              {children}
            </SubscriptionProvider>
          </CacheProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
