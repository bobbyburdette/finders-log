import type { Metadata } from "next";
import localFont from "next/font/local";
import { appConfig } from "@/lib/app-config";
import "./globals.css";

const playfairDisplay = localFont({
  src: "../../public/PlayfairDisplay-VariableFont_wght.ttf",
  variable: "--font-display"
});

const crimsonPro = localFont({
  src: "../../public/CrimsonPro-VariableFont_wght.ttf",
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: appConfig.name,
  description: appConfig.description
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfairDisplay.variable} ${crimsonPro.variable}`}>{children}</body>
    </html>
  );
}
