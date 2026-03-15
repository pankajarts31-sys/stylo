import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/Providers";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "STYLO — Your Virtual Fashion Universe",
  description:
    "Discover AI-powered outfit styling, trending fashion, and the best deals across the web — all in one beautiful place.",
  openGraph: {
    title: "STYLO — Your Virtual Fashion Universe",
    description: "AI styling, trending looks, and smart deal hunting.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable}`}>
        {/* Fluid gradient background */}
        <div className="fluid-gradient-bg" aria-hidden="true" />

        {/* Decorative floating orbs */}
        <div className="orb orb-1" aria-hidden="true" />
        <div className="orb orb-2" aria-hidden="true" />
        <div className="orb orb-3" aria-hidden="true" />

        <Providers>
          <Navbar />
          <div className="page-wrapper" style={{ paddingTop: "68px" }}>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
