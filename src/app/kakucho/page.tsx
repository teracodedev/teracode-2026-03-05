"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface KakuchoRecord {
  id: string;
  dankaId: string;
  familyName: string;
  givenName: string | null;
  familyNameKana: string | null;
  givenNameKana: string | null;
  relation: string | null;
  birthDate: string | null;
  deathDate: string | null;
  dharmaName: string | null;
  dharmaNameKana: string | null;
  note: string | null;
  danka: {
    id: string;
    dankaCode: string;
    familyName: string;
    givenName: string;
  };
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function KakuchoPage() {
  const [records, setRecords] = useState<KakuchoRecord[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      const res = await fetch(`/api/kakucho?${params}`);
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(fetchRecords, 300);
    return () => clearTimeout(timer);
  }, [fetchRecords]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-700">過去帳</h1>
          <p className="text-sm text-stone-500 mt-1">没年月日が登録されている故人の一覧</p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="法名・俗名・戸主名で検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border border-stone-300 rounded-lg px-4 py-2 text-sm text-stone-800 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-stone-400">読み込み中...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <p>過去帳の記録がありません</p>
          <p className="text-xs mt-2">
            戸主の世帯員に没年月日を登録すると過去帳に表示されます
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="text-left px-4 py-3 text-stone-600 font-medium">法名</th>
                <th className="text-left px-4 py-3 text-stone-600 font-medium">俗名（姓）</th>
                <th className="text-left px-4 py-3 text-stone-600 font-medium">俗名（名）</th>
                <th className="text-left px-4 py-3 text-stone-600 font-medium">没年月日</th>
                <th className="text-left px-4 py-3 text-stone-600 font-medium">生年月日</th>
                <th className="text-left px-4 py-3 text-stone-600 font-medium">続柄</th>
                <th className="text-left px-4 py-3 text-stone-600 font-medium">戸主</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium text-stone-700">
                    {record.dharmaName || (
                      <span className="text-stone-300">未登録</span>
                    )}
                    {record.dharmaNameKana && (
                      <div className="text-xs text-stone-400 font-normal">{record.dharmaNameKana}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-700">
                    {record.familyName}
                    {record.familyNameKana && (
                      <div className="text-xs text-stone-400">{record.familyNameKana}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-700">
                    {record.givenName || <span className="text-stone-300">-</span>}
                    {record.givenNameKana && (
                      <div className="text-xs text-stone-400">{record.givenNameKana}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-600">{formatDate(record.deathDate)}</td>
                  <td className="px-4 py-3 text-stone-600">{formatDate(record.birthDate)}</td>
                  <td className="px-4 py-3 text-stone-600">{record.relation || "-"}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/danka/${record.danka.id}`}
                      className="text-stone-500 hover:text-stone-400 hover:underline"
                    >
                      {record.danka.familyName} {record.danka.givenName}
                      <span className="text-xs text-stone-400 ml-1">
                        ({record.danka.dankaCode})
                      </span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-400">
            {records.length}件
          </div>
        </div>
      )}
    </div>
  );
}
