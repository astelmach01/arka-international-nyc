import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const title = "Arka International | Ukrainian Art & Heritage in New York";
const description =
  "Explore Arka International’s collection of Ukrainian art, handcrafts, textiles, icons, books, and keepsakes in New York City.";
const siteUrl = "https://astelmach01.github.io/arka-international-nyc/";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  icons: {
    icon: "/arka-international-nyc/favicon.png",
    shortcut: "/arka-international-nyc/favicon.png",
    apple: "/arka-international-nyc/favicon.png",
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: siteUrl,
    images: [{
      url: `${siteUrl}og.png`,
      width: 1200,
      height: 630,
      alt: "Arka International — Ukrainian heritage in New York",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [`${siteUrl}og.png`],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable}`}>{children}</body>
    </html>
  );
}
