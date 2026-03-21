"use client";
import { fetchWithAuth } from "@/lib/fetch-with-auth";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Householder {
  id: number;
  householderCode: string;
  familyName: string;
  givenName: string;
  familyNameKana: string | null;
  givenNameKana: string | null;
  address1: string | null;
  address2: string | null;
  address3: string | null;
  phone1: string | null;
  phone2: string | null;
  isActive: boolean;
  members: { id: string; familyName: string; givenName: string | null; relation: string | null }[];
}

export default function HouseholderPage() {
  const [householderList, setHouseholderList] = useState<Householder[]>([]);
  const [query, setQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHouseholders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (showInactive) params.set("active", "false");
      const res = await fetchWithAuth(`/api/householder?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setHouseholderList([]);
        setError(data?.error || "データの取得に失敗しました");
        return;
      }

      setHouseholderList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setHouseholderList([]);
      setError("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [query, showInactive]);

  useEffect(() => {
    const timer = setTimeout(fetchHouseholders, 300);
    return () => clearTimeout(timer);
  }, [fetchHouseholders]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-700">戸主台帳</h1>
        <Link
          href="/householder/new"
          className="bg-stone-700 text-white px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors text-base font-medium"
        >
          + 新規登録
        </Link>
      </div>

      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="氏名・住所で検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border border-stone-300 rounded-lg px-4 py-2 text-base text-stone-800 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
        <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded"
          />
          離檀者も表示
        </label>
      </div>

      {loading ? (
        <div className="text-center py-12 text-stone-400">読み込み中...</div>
      ) : error ? (
        <div className="text-center py-12 text-stone-400">{error}</div>
      ) : householderList.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <p>戸主が登録されていません</p>
          <Link href="/householder/new" className="text-stone-600 underline mt-2 inline-block">
            最初の戸主を登録する
          </Link>
        </div>
      ) : (
        <>
          {/* モバイル: カード表示 */}
          <div className="md:hidden space-y-2">
            {householderList.map((householder) => (
              <Link
                key={householder.id}
                href={`/householder/${householder.id}`}
                className="block bg-white rounded-xl border border-stone-200 px-4 py-3 shadow-sm active:bg-stone-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-stone-800 text-base">
                      {householder.familyName} {householder.givenName}
                    </div>
                    {householder.familyNameKana && (
                      <div className="text-xs text-stone-400">
                        {householder.familyNameKana} {householder.givenNameKana}
                      </div>
                    )}
                    <div className="text-xs text-stone-500 mt-1">
                      {[householder.address1, householder.address2, householder.address3].filter(Boolean).join(" ") || "-"}
                    </div>
                    {householder.phone1 && (
                      <div className="text-xs text-stone-500">{householder.phone1}</div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      householder.isActive ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"
                    }`}>
                      {householder.isActive ? "在籍" : "離檀"}
                    </span>
                    <span className="text-xs text-stone-400">{householder.members.length}名</span>
                  </div>
                </div>
              </Link>
            ))}
            <div className="text-xs text-stone-400 px-1 pt-1">{householderList.length}件</div>
          </div>

          {/* デスクトップ: テーブル表示 */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <table className="w-full text-base">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">UUID</th>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">氏名</th>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">住所</th>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">電話番号</th>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">世帯員数</th>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">状態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {householderList.map((householder) => (
                  <tr key={householder.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3 font-mono text-stone-500">{householder.householderCode.slice(0, 8)}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/householder/${householder.id}`}
                        className="font-medium text-stone-500 hover:text-stone-400 hover:underline"
                      >
                        {householder.familyName} {householder.givenName}
                      </Link>
                      {householder.familyNameKana && (
                        <div className="text-xs text-stone-400">
                          {householder.familyNameKana} {householder.givenNameKana}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {[householder.address1, householder.address2, householder.address3].filter(Boolean).join(" ") || "-"}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {householder.phone1 || "-"}
                      {householder.phone2 && <div className="text-xs text-stone-400">{householder.phone2}</div>}
                    </td>
                    <td className="px-4 py-3 text-stone-600">{householder.members.length}名</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        householder.isActive ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"
                      }`}>
                        {householder.isActive ? "在籍" : "離檀"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-400">
              {householderList.length}件
            </div>
          </div>
        </>
      )}
    </div>
  );
}
