import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { AccessibilityProvider } from "@/context/AccessibilityContext";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "NeuroLearn",
  description:
    "Paste any topic, set how your brain feels right now, and get revision content that actually works for you. Built for SEN and neurodiverse learners.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} antialiased`}>
        <AccessibilityProvider>{children}</AccessibilityProvider>
      </body>
    </html>
  );
}
