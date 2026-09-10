import type { Metadata } from "next";
import "./globals.css";
import Local from "next/font/local";
import { Suspense } from "react";
import { Root } from "@/components/index";
import "react-day-picker/style.css";

const SN = Local({
  src: "../assets/fonts/sn.ttf",
  variable: "--font-sn",
});

const supreme = Local({
  src: "../assets/fonts/supreme.ttf",
  variable: "--font-supreme",
});

export const metadata: Metadata = {
  title: "Nippy Travels",
  description: "Your express travel management agency",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${SN.variable} ${supreme.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <Root>{children}</Root>
        </Suspense>
      </body>
    </html>
  );
}
