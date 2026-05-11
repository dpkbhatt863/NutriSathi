import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import Providers from "@/components/layout/Providers";
import BottomNav from "@/components/layout/BottomNav";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "NutriSathi — Indian Diet Tracker",
  description: "Track your Indian meals with AI-powered nutrition insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full bg-[#fdf6ee] text-[#3d2b0e] antialiased pb-14 md:pb-0">
        <Providers>
          {children}
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
