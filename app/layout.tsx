import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ResponsiveToaster } from "@/components/ResponsiveToaster";
import Navbar from "@/components/Navbar";
import CurrentMap from "@/components/CurrentMap";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AirSense",
  description: "AirSense by GreLock",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div vaul-drawer-wrapper="" className="bg-background">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div>
              <Navbar />
              {children}
            </div>
            <ResponsiveToaster />
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
