import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "../components/app-providers";

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NØX | Own The Dark",
  description: "NØX conceptual luxury streetwear experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning lang="en" className="bg-black text-white">
      <body
        suppressHydrationWarning
        className={`${bebas.variable} ${inter.variable} font-body antialiased`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}