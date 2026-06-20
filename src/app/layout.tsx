import type { Metadata, Viewport } from "next";
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
  description: appConfig.description,
  applicationName: appConfig.name,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: appConfig.name
  }
};

export const viewport: Viewport = {
  themeColor: "#080704",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
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
