'use client';
import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CommandCore',
  description: 'Autonomous AI war room',
}

function AuthButton() {
  const { data: session, status } = useSession();
  if (status === "loading") return null;
  if (session) {
    return (
      <button
        className="px-4 py-2 bg-gray-800 rounded hover:bg-gray-700"
        onClick={() => signOut()}
      >
        Sign Out
      </button>
    );
  }
  return (
    <button
      className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
      onClick={() => signIn()}
    >
      Sign In
    </button>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="min-h-screen bg-black text-white">
        {/* Navbar */}
        <nav className="w-full flex items-center justify-between px-8 py-4 bg-black/80 border-b border-gray-800">
          <a href="/" className="text-2xl font-bold flex items-center gap-2">
            <span>⚡</span> CommandCore
          </a>
          <AuthButton />
        </nav>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
