import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GitRoast — Your GitHub, roasted.",
  description:
    "Drop a GitHub username and get a brutally honest AI-powered roast of your code life choices.",
  openGraph: {
    title: "GitRoast — Your GitHub, roasted.",
    description: "Get your GitHub profile roasted by AI.",
    url: "https://gitroast.dev",
    siteName: "GitRoast",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GitRoast — Your GitHub, roasted.",
    description: "Get your GitHub profile roasted by AI.",
    images: ["/og.png"],
  },
  metadataBase: new URL("https://gitroast.dev"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}