import type { Metadata } from "next";
import {
  Playfair_Display,
  Source_Serif_4,
  Space_Mono,
  Work_Sans,
} from "next/font/google";
import "./globals.css";

const displaySerif = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display-serif",
});

const bodySerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body-serif",
});

const uiSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-ui-sans",
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "gen-ui-nextjs",
  description: "Prompt-driven forms rendered from an LLM-generated schema in Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${displaySerif.variable} ${bodySerif.variable} ${uiSans.variable} ${mono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
