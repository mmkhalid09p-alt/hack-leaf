import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AccessibilityProvider } from "@/context/AccessibilityContext";
import { StudentDataProvider } from "@/context/StudentDataContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NeuroLearn",
  description: "NeuroLearn is a sensory-load-adaptive learning platform for neurodiverse learners — with adjustable sensory load, deaf mode, colour-blind palettes, sand mode, and AI-driven, personalised content.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AccessibilityProvider>
          <StudentDataProvider>
            {children}
          </StudentDataProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
