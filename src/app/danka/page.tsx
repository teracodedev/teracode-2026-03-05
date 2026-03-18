"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Danka {
  id: number;
  dankaCode: string;
  familyName: string;
  givenName: string;
  familyNameKana: string | null;
  givenNameKana: string | null;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  members: { id: number; name: string; relation: string | null }[];
}

export default function DankaPage() {
  const [dankaList, setDankaList] = useState<Danka[]>([]);
  const [query, setQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDanka = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (showInactive) params.set("active", "false");
      const res = await fetch(`/api/danka?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setDankaList([]);
        setError(data?.error || "データの取得に失敗しました");
        return;
      }

      setDankaList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setDankaList([]);
      setError("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [query, showInactive]);

  useEffect(() => {
    const timer = setTimeout(fetchDanka, 300);
    return () => clearTimeout(timer);
  }, [fetchDanka]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-600">戸主台帳</h1>
        <Link
          href="/danka/new"
          className="bg-stone-700 text-white px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors text-sm font-medium"
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
          className="flex-1 border border-stone-300 rounded-lg px-4 py-2 text-sm text-stone-800 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
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
      ) : dankaList.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <p>檀家が登録されていません</p>
          <Link href="/danka/new" className="text-stone-600 underline mt-2 inline-block">
            最初の檀家を登録する
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="text-left px-4 py-3 text-stone-600 font-medium">檀家番号</th>
                <th className="text-left px-4 py-3 text-stone-600 font-medium">氏名</th>
                <th className="text-left px-4 py-3 text-stone-600 font-medium">住所</th>
                <th className="text-left px-4 py-3 text-stone-600 font-medium">電話番号</th>
                <th className="text-left px-4 py-3 text-stone-600 font-medium">世帯員数</th>
                <th className="text-left px-4 py-3 text-stone-600 font-medium">状態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {dankaList.map((danka) => (
                <tr key={danka.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-mono text-stone-500">{danka.dankaCode.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/danka/${danka.id}`}
                      className="font-medium text-stone-500 hover:text-stone-400 hover:underline"
                    >
                      {danka.familyName} {danka.givenName}
                    </Link>
                    {danka.familyNameKana && (
                      <div className="text-xs text-stone-400">
                        {danka.familyNameKana} {danka.givenNameKana}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-600">{danka.address || "-"}</td>
                  <td className="px-4 py-3 text-stone-600">{danka.phone || "-"}</td>
                  <td className="px-4 py-3 text-stone-600">{danka.members.length}名</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        danka.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {danka.isActive ? "在籍" : "離檀"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-400">
            {dankaList.length}件
          </div>
        </div>
      )}
    </div>
  );
}
