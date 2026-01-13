import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import Link from 'next/link';

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // Keep Geist, it's premium enough
import { ChefHat } from "lucide-react";
import StreakWrapper from "@/components/StreakWrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Madplan.nu | Din AI Kok",
  description: "Skræddersyede madplaner, smarte indkøbslister og mindre madspild. Drevet af AI.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Madplan.nu",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="da" className="scroll-smooth">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
        >
          {/* Decorative background blobs */}
          <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400/10 blur-[120px]" />
            <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-violet-400/10 blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-[120px]" />
          </div>

          <header className="fixed top-0 w-full z-50 glass border-b-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="bg-emerald-500/10 p-2 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                  <ChefHat className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                  Madplan.nu
                </span>
              </Link>

              <nav className="flex items-center gap-6">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      Log ind
                    </button>
                  </SignInButton>
                  <SignInButton mode="modal">
                    <button className="bg-gray-900 dark:bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 dark:hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5">
                      Prøv Gratis
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link
                    href="/dashboard"
                    className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                  >
                    <span>Min Madplan</span>
                  </Link>
                  <StreakWrapper />
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-9 h-9 border-2 border-emerald-100 dark:border-emerald-900"
                      }
                    }}
                  />
                </SignedIn>
              </nav>
            </div>
          </header>

          <main className="flex-grow pt-16">
            {children}
          </main>

        </body>
      </html>
    </ClerkProvider>
  );
}
