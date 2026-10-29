import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geist = localFont({ src: "./fonts/GeistVF.woff", variable: "--font-geist" });

export const metadata: Metadata = {
  title: "pulse. | Live polling for better conversations",
  description: "Create engaging live polls and make every voice count.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={geist.variable}>{children}</body></html>;
}
