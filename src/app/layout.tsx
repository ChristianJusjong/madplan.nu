import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import Link from 'next/link';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Madplan.nu",
  description: "AI Powered Meal Planner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <header className="flex justify-between items-center p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
            <Link href="/" className="text-xl font-bold">Madplan.nu</Link>
            <div className="flex gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-sm font-medium hover:underline">Sign In</button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="text-sm font-medium hover:underline flex items-center">Dashboard</Link>
                <UserButton />
              </SignedIn>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
