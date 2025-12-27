import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/providers/theme-provider";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";

import { ModalProvider } from "@/components/providers/ModalContext";
import ModalHost from "@/components/providers/ModalHost";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://college-connect.local"),
  title: {
    default: "College Connect",
    template: "%s | College Connect",
  },
  description:
    "A unified, gamified platform connecting students, alumni, and administrators.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased min-h-screen`}>
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
          {/* Wrap EVERYTHING with the ModalProvider */}
          <ModalProvider>
            <div className="flex min-h-screen bg-bg text-fg">
              <Sidebar />
              <div className="flex-1 flex min-h-screen flex-col">
                <TopNav />
                <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
              </div>
            </div>

            {/* Render modals globally ABOVE entire UI */}
            <ModalHost />
          </ModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
