"use client";
import { useState } from "react";
import Link from "next/link";
import { signOutAction } from "@/app/actions";

interface NavMenuProps {
  userName?: string | null;
  isAdmin?: boolean;
}

export default function NavMenu({ userName, isAdmin }: NavMenuProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const navLinks = [
    { href: "/householder", label: "戸主台帳" },
    { href: "/kakucho", label: "過去帳" },
    { href: "/genzaicho", label: "現在帳" },
    { href: "/ceremonies", label: "法要・行事" },
  ];

  return (
    <>
      {/* デスクトップ用ナビ */}
      <div className="hidden md:flex items-center gap-6">
        {navLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="hover:text-stone-300 transition-colors text-sm font-medium"
          >
            {l.label}
          </Link>
        ))}
        {userName && (
          <>
            {isAdmin && (
              <Link
                href="/admin/accounts"
                className="hover:text-stone-300 transition-colors text-sm font-medium"
              >
                アカウント管理
              </Link>
            )}
            <div className="flex items-center gap-3 border-l border-stone-600 pl-6">
              <span className="text-stone-400 text-sm">{userName}</span>
              <form action={signOutAction}>
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

      {/* モバイル用ハンバーガーボタン */}
      <button
        className="md:hidden p-2 rounded text-stone-200 hover:text-white focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-label="メニュー"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* モバイル用ドロップダウン */}
      {open && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-stone-800 border-t border-stone-700 shadow-lg z-50 px-4 py-3 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={close}
              className="block py-2.5 px-3 rounded text-sm font-medium text-stone-100 hover:bg-stone-700 transition-colors"
            >
              {l.label}
            </Link>
          ))}
          {userName && (
            <>
              {isAdmin && (
                <Link
                  href="/admin/accounts"
                  onClick={close}
                  className="block py-2.5 px-3 rounded text-sm font-medium text-stone-100 hover:bg-stone-700 transition-colors"
                >
                  アカウント管理
                </Link>
              )}
              <div className="border-t border-stone-700 pt-3 mt-2 flex items-center justify-between px-3">
                <span className="text-stone-400 text-sm">{userName}</span>
                <form action={signOutAction}>
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
      )}
    </>
  );
}
