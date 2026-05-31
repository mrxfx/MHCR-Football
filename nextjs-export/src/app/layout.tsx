import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MHCR Football™ — Everything Football, One Place.",
  description: "Your all-in-one football platform. Teams, players, match scores, standings, and news.",
  keywords: ["football", "soccer", "MHCR", "scores", "standings", "live"],
  openGraph: {
    title: "MHCR Football™",
    description: "Everything Football, One Place.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
