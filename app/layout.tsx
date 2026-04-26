import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./styles/globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PaySplit",
  description: "Split expenses easily with friends",
};

import { Navigation } from "./components/ui/Navigation";
import { NotificationPanel } from "./components/ui/NotificationPanel";
import { OfflineIndicator } from "./components/layout/OfflineIndicator";
import { CurrencyRatesBootstrap } from "./components/layout/CurrencyRatesBootstrap";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="dark">
        <CurrencyRatesBootstrap />
        <OfflineIndicator />
        <main className=" pb-20">
          {children}
        </main>
        <Navigation />
        <NotificationPanel />
      </body>
    </html>
  );
}

