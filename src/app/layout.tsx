import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { auth, signOut } from "@/auth";

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
  description: "戸主・法要を管理するシステム",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

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
              <div className="flex items-center gap-6">
                <Link
                  href="/householder"
                  className="hover:text-stone-300 transition-colors text-sm font-medium"
                >
                  戸主台帳
                </Link>
                <Link
                  href="/kakucho"
                  className="hover:text-stone-300 transition-colors text-sm font-medium"
                >
                  過去帳
                </Link>
                <Link
                  href="/genzaicho"
                  className="hover:text-stone-300 transition-colors text-sm font-medium"
                >
                  現在帳
                </Link>
                <Link
                  href="/ceremonies"
                  className="hover:text-stone-300 transition-colors text-sm font-medium"
                >
                  法要・行事
                </Link>
                {session?.user && (
                  <>
                    {session.user.isAdmin && (
                      <Link
                        href="/admin/accounts"
                        className="hover:text-stone-300 transition-colors text-sm font-medium"
                      >
                        アカウント管理
                      </Link>
                    )}
                    <div className="flex items-center gap-3 border-l border-stone-600 pl-6">
                      <span className="text-stone-400 text-sm">{session.user.name}</span>
                      <form
                        action={async () => {
                          "use server";
                          await signOut({ redirectTo: "/login" });
                        }}
                      >
                        <button
                          type="submit"
                          className="text-sm text-stone-300 hover:text-white transition-colors"
                        >
                          ログアウト
                        </button>
                      </form>
                    </div>
                  </>
                )}
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
