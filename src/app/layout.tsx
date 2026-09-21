import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import Local from "next/font/local";
import { Suspense } from "react";
import { Root } from "@/components/index";

const title = Local({
  src: "../assets/fonts/Tanker-Regular.ttf",
  variable: "--font-t",
});

const admin = Geist({
  variable: "--font-admin",
});

const display = Local({
  src: "../assets/fonts/BespokeSerif-Regular.ttf",
  variable: "--font-sub",
});

export const metadata: Metadata = {
  title: "Nippy Travels",
  description: "Your express travel management agency",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${title.variable} ${display.variable} ${admin.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <Root>{children}</Root>
        </Suspense>
      </body>
    </html>
  );
}
