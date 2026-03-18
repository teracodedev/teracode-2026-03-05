import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "テラコード - 寺院管理システム",
  description: "檀家・法要を管理するシステム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <nav className="bg-stone-800 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl">⛩</span>
                <span className="font-bold text-xl tracking-wide">テラコード</span>
              </Link>
              <div className="flex gap-6">
                <Link
                  href="/danka"
                  className="hover:text-stone-300 transition-colors text-sm font-medium"
                >
                  檀家管理
                </Link>
                <Link
                  href="/ceremonies"
                  className="hover:text-stone-300 transition-colors text-sm font-medium"
                >
                  法要・行事
                </Link>
                <Link
                  href="/genzaicho"
                  className="hover:text-stone-300 transition-colors text-sm font-medium"
                >
                  現在帳
                </Link>
                <Link
                  href="/kakucho"
                  className="hover:text-stone-300 transition-colors text-sm font-medium"
                >
                  過去帳
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
