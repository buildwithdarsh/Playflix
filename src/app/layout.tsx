import type { Metadata, Viewport } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import { APP_NAME, APP_TAGLINE, BASE_URL, COLORS } from "@/lib/constants";
import DesktopBackground from "@/components/DesktopBackground";
import SplashScreen from "@/components/SplashScreen";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-dm-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s — ${APP_NAME}`,
  },
  description:
    "Host movie rooms with Google Drive links. Watch together in Sync Mode or at your own pace in Solo Mode. Pay-per-minute, live chat, emoji reactions. India\u2019s social cinema platform.",
  keywords: [
    "watch movies together",
    "movie watch party",
    "sync watch",
    "google drive movie room",
    "playflix",
    "social cinema india",
    "pay per minute movies",
  ],
  authors: [{ name: APP_NAME, url: BASE_URL }],
  creator: APP_NAME,
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: "Host movie rooms with GDrive links. Watch together or solo. Live chat, PPM billing, social cinema.",
    images: [{ url: `${BASE_URL}/logo.svg`, width: 512, height: 512, alt: `${APP_NAME} logo` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: "Host movie rooms with GDrive links. Watch together or solo. Live chat, PPM billing, social cinema.",
    images: [`${BASE_URL}/logo.svg`],
  },
  alternates: {
    canonical: BASE_URL,
    languages: { "en-IN": BASE_URL },
  },
  robots: { index: true, follow: true },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: COLORS.bgPrimary,
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${dmSerif.variable}`}>
      <body className="antialiased">
        <noscript>
          <div style={{ padding: '2rem', textAlign: 'center', color: '#fafafa', backgroundColor: '#0E0E0E', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>JavaScript is required to use {APP_NAME}. Please enable JavaScript in your browser settings.</p>
          </div>
        </noscript>
        <SplashScreen />
        <DesktopBackground />
        <div className="app-frame">
          {children}
        </div>
      </body>
    </html>
  );
}
