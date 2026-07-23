import type { Metadata, Viewport } from "next";
import { Archivo, Saira_Condensed } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/TopNav";

const archivo = Archivo({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans", display: "swap" });
const saira = Saira_Condensed({ weight: ["500", "600", "700", "800"], subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Edge Engine — Calibrated UFC Forecasting", template: "%s · Edge Engine" },
  description:
    "Live UFC schedules, fighter stats and fight history, official rankings, real-time Vegas odds, and a market-anchored prediction engine with honest win/method/round probabilities — never locks.",
  applicationName: "Edge Engine",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Edge Engine — Calibrated UFC Forecasting",
    description:
      "Honest, calibrated UFC predictions: win probability, method, and the Veteran-Gate round call — anchored to the market, never sold as locks.",
    siteName: "Edge Engine",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Edge Engine — UFC Forecasting" },
};

export const viewport: Viewport = {
  themeColor: "#0c0a0b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivo.variable} ${saira.variable}`}>
      <body>
        <TopNav />
        {children}
        <footer className="site">
          Probabilities, not locks — a single punch can end any fight. If you bet, bet only what you
          can afford to lose. <b>21+.</b> Not affiliated with the UFC or ESPN.
        </footer>
      </body>
    </html>
  );
}
