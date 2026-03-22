"use client";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface FamilyRegister {
  id: string;
  registerCode: string;
  name: string;
  note: string | null;
  householders: { id: string; familyName: string; givenName: string; isActive: boolean; _count: { members: number } }[];
}

export default function FamilyRegisterPage() {
  const [list, setList] = useState<FamilyRegister[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth("/api/family-register");
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-700">家族・親族台帳</h1>
        <Link href="/family-register/new"
          className="bg-stone-700 text-white px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors text-sm font-medium">
          + 新規登録
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-stone-400">読み込み中...</div>
      ) : list.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <p>家族・親族台帳が登録されていません</p>
          <Link href="/family-register/new" className="text-stone-600 underline mt-2 inline-block">最初の台帳を登録する</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((r) => {
            const hh = r.householders ?? [];
            const memberCount = hh.reduce((sum, h) => sum + (h._count?.members ?? 0), 0);
            return (
              <Link key={r.id} href={`/family-register/${r.id}`}
                className="block bg-white rounded-xl border border-stone-200 px-5 py-4 shadow-sm hover:shadow-md hover:border-stone-300 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-lg font-bold text-stone-800">{r.name}</div>
                    {r.note && <div className="text-sm text-stone-400 mt-0.5">{r.note}</div>}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {hh.map((h) => (
                        <span key={h.id} className={`text-xs px-2 py-0.5 rounded-full ${h.isActive ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-400"}`}>
                          {h.familyName}{h.givenName}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm text-stone-500">{hh.length}戸主</div>
                    <div className="text-sm text-stone-500">{memberCount}世帯員</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
