"use client";
import { fetchWithAuth } from "@/lib/fetch-with-auth";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface GenzaichoRecord {
  id: string;
  householderId: string;
  familyName: string;
  givenName: string | null;
  familyNameKana: string | null;
  givenNameKana: string | null;
  relation: string | null;
  birthDate: string | null;
  note: string | null;
  householder: {
    id: string;
    householderCode: string;
    familyName: string;
    givenName: string;
    address1: string | null;
    address2: string | null;
    address3: string | null;
  };
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function calcAge(birthDateStr: string | null): string {
  if (!birthDateStr) return "-";
  const birth = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return `${age}歳`;
}

export default function GenzaichoPage() {
  const [records, setRecords] = useState<GenzaichoRecord[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      const res = await fetchWithAuth(`/api/genzaicho?${params}`);
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
          <h1 className="text-2xl font-bold text-amber-700">現在帳</h1>
          <p className="text-sm text-stone-500 mt-1">在籍中の世帯員一覧</p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="氏名・戸主名・住所で検索..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border border-stone-300 rounded-lg px-4 py-2 text-base text-stone-800 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-stone-400">読み込み中...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <p>現在帳の記録がありません</p>
          <p className="text-xs mt-2">
            戸主の世帯員を登録すると現在帳に表示されます
          </p>
        </div>
      ) : (
        <>
          {/* モバイル: カード表示 */}
          <div className="md:hidden space-y-2">
            {records.map((record) => (
              <div key={record.id} className="bg-white rounded-xl border border-stone-200 px-4 py-3 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-stone-800 text-base">
                      {record.familyName} {record.givenName || ""}
                    </div>
                    {record.familyNameKana && (
                      <div className="text-xs text-stone-400">{record.familyNameKana} {record.givenNameKana || ""}</div>
                    )}
                    <div className="text-xs text-stone-500 mt-1 flex flex-wrap gap-x-2">
                      {record.relation && <span>{record.relation}</span>}
                      {record.birthDate && <span>生: {formatDate(record.birthDate)}（{calcAge(record.birthDate)}）</span>}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <Link href={`/householder/${record.householder.id}`} className="text-xs text-stone-500 hover:underline">
                      {record.householder.familyName} {record.householder.givenName}
                    </Link>
                    <div className="text-xs text-stone-400 mt-0.5">
                      {[record.householder.address1, record.householder.address2].filter(Boolean).join(" ")}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="text-xs text-stone-400 px-1 pt-1">{records.length}名</div>
          </div>

          {/* デスクトップ: テーブル表示 */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <table className="w-full text-base">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">姓</th>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">名</th>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">続柄</th>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">生年月日</th>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">年齢</th>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">戸主</th>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">住所</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3 font-medium text-stone-700">
                      {record.familyName}
                      {record.familyNameKana && (
                        <div className="text-xs text-stone-400 font-normal">{record.familyNameKana}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-700">
                      {record.givenName || <span className="text-stone-300">-</span>}
                      {record.givenNameKana && (
                        <div className="text-xs text-stone-400">{record.givenNameKana}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-600">{record.relation || "-"}</td>
                    <td className="px-4 py-3 text-stone-600">{formatDate(record.birthDate)}</td>
                    <td className="px-4 py-3 text-stone-600">{calcAge(record.birthDate)}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/householder/${record.householder.id}`}
                        className="text-stone-500 hover:text-stone-400 hover:underline"
                      >
                        {record.householder.familyName} {record.householder.givenName}
                        <span className="text-xs text-stone-400 ml-1">
                          ({record.householder.householderCode})
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-stone-600 text-xs">
                      {[record.householder.address1, record.householder.address2, record.householder.address3].filter(Boolean).join(" ") || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-400">
              {records.length}名
            </div>
          </div>
        </>
      )}
    </div>
  );
}
