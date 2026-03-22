"use client";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  familyName: string;
  givenName: string | null;
  familyNameKana: string | null;
  relation: string | null;
  birthDate: string | null;
  deathDate: string | null;
  dharmaName: string | null;
  phone1: string | null;
  address1: string | null;
  address2: string | null;
  address3: string | null;
  note: string | null;
  householderId: string;
}

interface Householder {
  id: string;
  familyName: string;
  givenName: string;
  familyNameKana: string | null;
  isActive: boolean;
  postalCode: string | null;
  address1: string | null;
  address2: string | null;
  address3: string | null;
  phone1: string | null;
  members: Member[];
}

interface FamilyRegister {
  id: string;
  registerCode: string;
  name: string;
  note: string | null;
  householders: Householder[];
}

function formatDate(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("ja-JP");
}

type TabId = "householders" | "genzaicho" | "kakucho";

export default function FamilyRegisterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<FamilyRegister | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("householders");
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editNote, setEditNote] = useState("");
  const [linkQuery, setLinkQuery] = useState("");
  const [linkResults, setLinkResults] = useState<{ id: string; familyName: string; givenName: string; familyRegisterId: string | null }[]>([]);
  const [linking, setLinking] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`/api/family-register/${id}`);
      const json = await res.json();
      const ok =
        res.ok &&
        json &&
        typeof json === "object" &&
        Array.isArray((json as FamilyRegister).householders);
      if (ok) {
        const row = json as FamilyRegister;
        setData(row);
        setEditName(row.name);
        setEditNote(row.note || "");
      } else {
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    if (!confirm("この台帳を削除しますか？（戸主データは削除されません）")) return;
    setDeleting(true);
    await fetchWithAuth(`/api/family-register/${id}`, { method: "DELETE" });
    router.push("/family-register");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchWithAuth(`/api/family-register/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, note: editNote }),
    });
    setEditing(false);
    fetchData();
  };

  const handleUnlink = async (householderId: string) => {
    if (!confirm("この戸主の紐付けを解除しますか？")) return;
    await fetchWithAuth(`/api/family-register/${id}/householders?householderId=${householderId}`, { method: "DELETE" });
    fetchData();
  };

  const searchHouseholders = async (q: string) => {
    if (!q.trim()) { setLinkResults([]); return; }
    const res = await fetchWithAuth(`/api/householder?q=${encodeURIComponent(q)}`);
    const rows = await res.json();
    setLinkResults(Array.isArray(rows) ? rows : []);
  };

  const handleLink = async (householderId: string) => {
    setLinking(true);
    await fetchWithAuth(`/api/family-register/${id}/householders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ householderId }),
    });
    setLinkQuery("");
    setLinkResults([]);
    setLinking(false);
    fetchData();
  };

  if (loading) return <div className="text-center py-12 text-stone-400">読み込み中...</div>;
  if (!data) return <div className="text-center py-12 text-stone-400">台帳が見つかりません</div>;

  const allMembers = data.householders.flatMap((h) =>
    (h.members ?? []).map((m) => ({ ...m, householderName: `${h.familyName}${h.givenName}`, householderId: h.id }))
  );
  const livingMembers = allMembers.filter((m) => !m.deathDate);
  const deceasedMembers = allMembers.filter((m) => !!m.deathDate);

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "householders", label: "戸主一覧", count: data.householders.length },
    { id: "genzaicho",    label: "現在帳",   count: livingMembers.length },
    { id: "kakucho",      label: "過去帳",   count: deceasedMembers.length },
  ];

  const inputCls = "w-full border border-stone-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-stone-400";

  return (
    <div className="max-w-3xl space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/family-register" className="text-stone-400 hover:text-stone-600 text-sm">← 一覧へ</Link>
        {editing ? (
          <form onSubmit={handleSaveEdit} className="flex items-center gap-2 flex-1">
            <input value={editName} onChange={(e) => setEditName(e.target.value)} required
              className="border border-stone-300 rounded-lg px-3 py-1.5 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-stone-400 flex-1" />
            <button type="submit" className="bg-stone-700 text-white px-3 py-1.5 rounded-lg text-sm">保存</button>
            <button type="button" onClick={() => setEditing(false)} className="text-stone-400 text-sm">キャンセル</button>
          </form>
        ) : (
          <h1 className="text-2xl font-bold text-stone-700">{data.name}</h1>
        )}
      </div>

      <div className="flex gap-2 justify-end flex-wrap">
        <button onClick={() => setEditing(!editing)}
          className="border border-stone-300 text-stone-600 px-4 py-1.5 rounded-lg hover:bg-stone-50 text-sm font-medium">
          {editing ? "キャンセル" : "名称編集"}
        </button>
        <button onClick={handleDelete} disabled={deleting}
          className="border border-red-200 text-red-600 px-4 py-1.5 rounded-lg hover:bg-red-50 text-sm font-medium disabled:opacity-50">
          {deleting ? "削除中..." : "台帳削除"}
        </button>
      </div>

      {editing && (
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <label className="block text-sm text-stone-500 mb-1">備考</label>
          <textarea value={editNote} onChange={(e) => setEditNote(e.target.value)} rows={2} className={inputCls} />
        </div>
      )}

      {data.note && !editing && (
        <p className="text-stone-400 text-sm px-1">{data.note}</p>
      )}

      {/* タブ */}
      <div className="border-b border-stone-200 overflow-x-auto">
        <nav className="flex min-w-max">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === t.id
                  ? "border-amber-600 text-amber-700"
                  : "border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300"
              }`}>
              {t.label}
              {t.count !== undefined && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === t.id ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-500"}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* 戸主タブ（1:1） */}
      {activeTab === "householders" && (
        <div className="space-y-4">

          {/* 戸主カード */}
          {data.householders.length === 0 ? (
            <p className="text-stone-400 text-sm">戸主が登録されていません</p>
          ) : (
            <div className="space-y-2">
              {data.householders.map((h) => (
                <div key={h.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1">
                      <Link href={`/householder/${h.id}`} className="font-medium text-stone-800 hover:text-amber-700">
                        {h.familyName} {h.givenName}
                      </Link>
                      {h.familyNameKana && <div className="text-xs text-stone-400">{h.familyNameKana}</div>}
                      <div className="text-sm text-stone-500">
                        {[h.address1, h.address2, h.address3].filter(Boolean).join(" ") || "-"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${h.isActive ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                        {h.isActive ? "在籍" : "離檀"}
                      </span>
                      <span className="text-xs text-stone-400">{h.members.length}名</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 現在帳タブ */}
      {activeTab === "genzaicho" && (
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          {livingMembers.length === 0 ? (
            <p className="text-stone-400 text-sm">存命の世帯員が登録されていません</p>
          ) : (
            <div className="space-y-2">
              {livingMembers.map((m) => {
                const isExpanded = expandedId === m.id;
                return (
                  <div key={m.id} className="border border-stone-100 rounded-lg overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      <button onClick={() => setExpandedId(isExpanded ? null : m.id)}
                        className="shrink-0 border border-stone-300 rounded px-2 py-1 text-sm text-stone-600 hover:bg-stone-100 font-medium">
                        {isExpanded ? "▲" : "詳細"}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-stone-800">{m.familyName} {m.givenName || ""}</span>
                        {m.relation && <span className="ml-2 text-sm text-stone-400">{m.relation}</span>}
                        <div className="text-xs text-stone-400">戸主: {(m as { householderName?: string }).householderName}</div>
                      </div>
                      <Link href={`/householder/${m.householderId}`}
                        className="shrink-0 text-xs text-stone-400 hover:text-stone-600 border border-stone-200 px-2 py-1 rounded">
                        台帳へ
                      </Link>
                    </div>
                    {isExpanded && (
                      <div className="bg-stone-50 border-t border-stone-200 px-4 py-3">
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                          {m.birthDate && <div><dt className="inline text-stone-400">生年月日: </dt><dd className="inline">{formatDate(m.birthDate)}</dd></div>}
                          {m.dharmaName && <div><dt className="inline text-stone-400">法名: </dt><dd className="inline">{m.dharmaName}</dd></div>}
                          {m.phone1 && <div><dt className="inline text-stone-400">電話: </dt><dd className="inline">{m.phone1}</dd></div>}
                          {(m.address1 || m.address2) && <div className="col-span-2"><dt className="inline text-stone-400">住所: </dt><dd className="inline">{[m.address1, m.address2, m.address3].filter(Boolean).join(" ")}</dd></div>}
                          {m.note && <div className="col-span-2"><dt className="inline text-stone-400">備考: </dt><dd className="inline">{m.note}</dd></div>}
                        </dl>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 過去帳タブ */}
      {activeTab === "kakucho" && (
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          {deceasedMembers.length === 0 ? (
            <p className="text-stone-400 text-sm">故人の世帯員が登録されていません</p>
          ) : (
            <div className="space-y-2">
              {deceasedMembers.map((m) => {
                const isExpanded = expandedId === m.id;
                return (
                  <div key={m.id} className="border border-stone-100 rounded-lg overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      <button onClick={() => setExpandedId(isExpanded ? null : m.id)}
                        className="shrink-0 border border-stone-300 rounded px-2 py-1 text-sm text-stone-600 hover:bg-stone-100 font-medium">
                        {isExpanded ? "▲" : "詳細"}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-stone-800">{m.familyName} {m.givenName || ""}</span>
                        {m.dharmaName && <span className="ml-2 text-sm text-stone-400">{m.dharmaName}</span>}
                        <div className="text-xs text-stone-400">
                          命日: {formatDate(m.deathDate)} ／ 戸主: {(m as { householderName?: string }).householderName}
                        </div>
                      </div>
                      <Link href={`/householder/${m.householderId}`}
                        className="shrink-0 text-xs text-stone-400 hover:text-stone-600 border border-stone-200 px-2 py-1 rounded">
                        台帳へ
                      </Link>
                    </div>
                    {isExpanded && (
                      <div className="bg-stone-50 border-t border-stone-200 px-4 py-3">
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                          {m.birthDate && <div><dt className="inline text-stone-400">生年月日: </dt><dd className="inline">{formatDate(m.birthDate)}</dd></div>}
                          {m.deathDate && <div><dt className="inline text-stone-400">命日: </dt><dd className="inline">{formatDate(m.deathDate)}</dd></div>}
                          {m.dharmaName && <div><dt className="inline text-stone-400">法名: </dt><dd className="inline">{m.dharmaName}</dd></div>}
                          {m.note && <div className="col-span-2"><dt className="inline text-stone-400">備考: </dt><dd className="inline">{m.note}</dd></div>}
                        </dl>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
