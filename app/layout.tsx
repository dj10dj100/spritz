import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, JetBrains_Mono } from "next/font/google";
import BackgroundMotifs from "@/components/BackgroundMotifs";
import GrainOverlay from "@/components/GrainOverlay";
import HeaderChrome from "@/components/HeaderChrome";
import { TRIP_NAME } from "@/lib/trip-config";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: `spritzulator — ${TRIP_NAME}`,
  description: "A leaderboard for friends drinking too many Aperol spritzes.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon.svg" }],
  },
  appleWebApp: {
    capable: true,
    title: "spritzulator",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF6B1A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${geist.variable} ${jetbrainsMono.variable}`}>
      <body>
        <BackgroundMotifs />
        <GrainOverlay />
        <div className="relative z-10 mx-auto flex min-h-dvh max-w-[560px] flex-col px-4 pb-[96px] pt-4">
          <HeaderChrome />
          {children}
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {})); }`,
          }}
        />
      </body>
    </html>
  );
}
