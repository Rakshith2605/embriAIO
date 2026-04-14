import type { Metadata } from "next";
import { Inter, Playfair_Display, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-source-serif",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LLMs from Scratch — Interactive Learning Platform",
  description:
    "Navigate, watch, and run all content from 'Build A Large Language Model (From Scratch)' by Sebastian Raschka. 7 chapters, 25+ notebooks, in-browser Python execution.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} ${playfair.variable} ${sourceSerif.variable} ${jetbrains.variable}`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
