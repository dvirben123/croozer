import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import "./globals.css";

export const metadata: Metadata = {
  title: "בוט וואטסאפ לעסקים - חסוך זמן וכסף עם אוטומציה חכמה",
  description:
    "פתרון בוט וואטסאפ מתקדם לעסקים קטנים ובינוניים. אוטומציה של שירות לקוחות, ניהול הזמנות וחיסכון בעלויות תפעול. התחל עכשיו!",
  keywords:
    "בוט וואטסאפ, אוטומציה לעסקים, שירות לקוחות אוטומטי, WhatsApp Business, צ'אטבוט",
  authors: [{ name: "WhatsApp Business Bot" }],
  openGraph: {
    title: "בוט וואטסאפ לעסקים - חסוך זמן וכסף",
    description: "פתרון בוט וואטסאפ מתקדם לעסקים קטנים ובינוניים",
    type: "website",
    locale: "he_IL",
    siteName: "בוט וואטסאפ לעסקים",
  },
  twitter: {
    card: "summary_large_image",
    title: "בוט וואטסאפ לעסקים - חסוך זמן וכסף",
    description: "פתרון בוט וואטסאפ מתקדם לעסקים קטנים ובינוניים",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  const locale = await getLocale();

  return (
    <html lang={locale} dir={locale === 'he' ? 'rtl' : 'ltr'} className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
