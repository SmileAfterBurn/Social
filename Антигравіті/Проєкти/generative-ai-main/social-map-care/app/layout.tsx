import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { TimeThemeProvider } from "@/components/theme/TimeThemeProvider";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Social Map Care Premium — Пані Думка",
  description: "Преміальна соціальна мапа турботи з Пані Думкою, дистанційною підтримкою, гарячими лініями та динамічним освітленням за часом доби.",
  icons: {
    icon: '/assets/smile-after-burn-logo.png',
    apple: '/assets/smile-after-burn-logo.png',
  },
  verification: {
    google: "KQJFO18dB3KmorL9evNBHLqYf46SQXBS5TVWU6TrZ_Q",
  },
  other: {
    google: "notranslate",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

import { AuthProvider } from "@/components/features/AuthProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" translate="no" className={`${inter.variable} ${outfit.variable} notranslate`}>
      <head>
        <meta name="google" content="notranslate" />
        {/* frame-ancestors не підтримується в <meta>, перенесено в .htaccess
            wasm-unsafe-eval потрібен для Google Maps WebAssembly */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self' data: blob: https:; base-uri 'self'; object-src 'none'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https: wss:; media-src 'self' blob: https:; worker-src 'self' blob:; frame-src 'self' https:; form-action 'self' https:; upgrade-insecure-requests"
        />
      </head>
      <body translate="no" className="antialiased font-sans notranslate">
        <TimeThemeProvider>
          <AuthProvider>
            <LanguageProvider>
              {children}
            </LanguageProvider>
          </AuthProvider>
        </TimeThemeProvider>
      </body>
    </html>
  );
}
