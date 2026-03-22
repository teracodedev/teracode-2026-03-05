"use client";

import { useState } from "react";
import Link from "next/link";
import { signOutAction } from "@/app/actions";

interface NavMenuProps {
  userName?: string | null;
  isAdmin?: boolean;
}

const navLinks = [
  { href: "/householder", label: "戸主台帳" },
  { href: "/kakucho",     label: "過去帳" },
  { href: "/genzaicho",   label: "現在帳" },
  { href: "/ceremonies",  label: "法要・行事" },
] as const;

export default function NavMenu({ userName, isAdmin }: NavMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ===== PC用ナビ ===== */}
      <div className="hidden md:flex items-center gap-6">
        {navLinks.map((l) => (
          <Link key={l.href} href={l.href}
            className="hover:text-stone-300 transition-colors font-medium whitespace-nowrap">
            {l.label}
          </Link>
        ))}
        {userName && (
          <>
            {isAdmin && (
              <Link href="/admin/accounts"
                className="hover:text-stone-300 transition-colors font-medium whitespace-nowrap">
                アカウント管理
              </Link>
            )}
            <div className="flex items-center gap-3 border-l border-stone-600 pl-6">
              <span className="text-stone-400 text-sm whitespace-nowrap">{userName}</span>
              <form action={signOutAction}>
                <button type="submit"
                  className="text-sm text-stone-300 hover:text-white transition-colors whitespace-nowrap">
                  ログアウト
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* ===== スマホ用ハンバーガーボタン ===== */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="md:hidden p-2 rounded text-stone-200 hover:text-white"
        aria-label="メニューを開く"
      >
        {open ? (
          /* ✕ アイコン */
          <svg width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          /* ≡ アイコン */
          <svg width="24" height="24" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6"  x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        )}
      </button>

      {/* ===== スマホ用ドロップダウンメニュー ===== */}
      {open && (
        <div className="md:hidden fixed top-16 left-0 right-0 z-50 bg-stone-800 border-t border-stone-700 shadow-lg px-4 py-3 space-y-1">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href}
              onClick={() => setOpen(false)}
              className="block py-3 px-3 rounded text-lg font-medium text-stone-100 hover:bg-stone-700 transition-colors">
              {l.label}
            </Link>
          ))}
          {userName && (
            <>
              {isAdmin && (
                <Link href="/admin/accounts"
                  onClick={() => setOpen(false)}
                  className="block py-3 px-3 rounded text-lg font-medium text-stone-100 hover:bg-stone-700 transition-colors">
                  アカウント管理
                </Link>
              )}
              <div className="border-t border-stone-700 pt-3 mt-2 flex items-center justify-between px-3">
                <span className="text-stone-400">{userName}</span>
                <form action={signOutAction}>
                  <button type="submit"
                    className="text-stone-300 hover:text-white transition-colors">
                    ログアウト
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
