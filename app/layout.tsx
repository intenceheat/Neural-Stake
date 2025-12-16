// app/layout.tsx

import type { Metadata } from "next";
import { Orbitron, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/wallet/WalletProvider";
import { NavigationProvider } from "@/components/navigation/NavigationProvider"; // ADD THIS

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "700", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Neural Stake - Where Conviction Meets Capital",
  description: "AI-powered prediction markets. Stake your belief. Bank your edge.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${orbitron.variable} ${inter.variable} ${jetbrainsMono.variable} font-inter antialiased bg-slate-950 text-slate-100`}
      >
        <WalletProvider>
          <NavigationProvider> {/* WRAP HERE */}
            {children}
          </NavigationProvider>
        </WalletProvider>
      </body>
    </html>
  );
}