import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import QueryProvider from "@/providers/query-provider";
import { cn } from "@/lib/utils";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

// Bold, rounded heading font for titles, XP counters, and quest buttons
const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  weight: ["400", "500", "600", "700"],
});

// Friendly, readable sans-serif font for dialogue text and general UI
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "LinguisQuest - Gamified Language Learning",
  description: "Embark on an interactive quest to master new languages!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={cn(
          "h-full",
          "antialiased",
          "select-none", // Prevents accidental text selection while clicking buttons rapidly
          fredoka.variable,
          nunito.variable,
          "font-sans"
        )}
      >
        <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans tracking-wide">
          <QueryProvider>{children}</QueryProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}