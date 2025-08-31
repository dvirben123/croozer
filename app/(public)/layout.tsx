import React from "react";
import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
  title: "עמוד נחיתה לבוט וואטסאפ",
  description: "פיתרון מתקדם לניהול שיחות וואטסאפ עסקיות עם אוטומציה חכמה",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen bg-background text-foreground dark">
        {children}
      </body>
    </html>
  );
}
