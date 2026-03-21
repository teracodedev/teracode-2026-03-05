"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("メールアドレスまたはパスワードが正しくありません");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">⛩</div>
          <h1 className="text-2xl font-bold text-stone-800">テラコード</h1>
          <p className="text-stone-500 text-sm mt-1">寺院管理システム</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8">
          <h2 className="text-lg font-semibold text-stone-700 mb-6">ログイン</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-stone-300 rounded-lg px-4 py-2 text-base text-stone-800 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
                placeholder="example@temple.or.jp"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">
                パスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-stone-300 rounded-lg px-4 py-2 text-base text-stone-800 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stone-800 text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-stone-700 disabled:opacity-50 transition-colors mt-2"
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
