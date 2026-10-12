import type { Metadata } from "next";
import "./globals.css";
import Local from "next/font/local";
import { Suspense } from "react";

const serif = Local({
  src: "../assets/fonts/bricolage.ttf",
  variable: "--font-bricolage",
});

const sans = Local({
  src: "../assets/fonts/onest.ttf",
  variable: "--font-onest",
});

export const metadata: Metadata = {
  title: "Nippy Travels",
  description: "Your express travel management agency",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>{children}</Suspense>
      </body>
    </html>
  );
}
