"use client";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface GraveSite {
  id: string;
  section: string | null;
  number: string | null;
  graveType: string | null;
  contractedAt: string | null;
  note: string | null;
}

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
  givenNameKana: string | null;
  isActive: boolean;
  postalCode: string | null;
  address1: string | null;
  address2: string | null;
  address3: string | null;
  phone1: string | null;
  phone2: string | null;
  fax: string | null;
  email: string | null;
  domicile: string | null;
  gender: string | null;
  birthDate: string | null;
  deathDate: string | null;
  dharmaName: string | null;
  dharmaNameKana: string | null;
  note: string | null;
  joinedAt: string | null;
  leftAt: string | null;
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

type TabId = "householders" | "genzaicho" | "kakucho" | "bochi";

export default function FamilyRegisterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<FamilyRegister | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("householders");
  const [deleting, setDeleting] = useState(false);
  const [linkQuery, setLinkQuery] = useState("");
  const [linkResults, setLinkResults] = useState<{ id: string; familyName: string; givenName: string; familyRegisterId: string | null }[]>([]);
  const [linking, setLinking] = useState(false);
  const [graveSites, setGraveSites] = useState<GraveSite[]>([]);
  const [graveForm, setGraveForm] = useState({ section: "", number: "", graveType: "", contractedAt: "", note: "" });
  const [addingGrave, setAddingGrave] = useState(false);
  const [showGraveForm, setShowGraveForm] = useState(false);
  const fetchData = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`/api/family-register/${id}`);
      let json: unknown;
      try {
        json = await res.json();
      } catch {
        setData(null);
        return;
      }
      const ok =
        res.ok &&
        json &&
        typeof json === "object" &&
        Array.isArray((json as FamilyRegister).householders);
      if (ok) {
        const row = json as FamilyRegister;
        setData(row);
      } else {
        setData(null);
      }
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchGraveSites = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`/api/family-register/${id}/grave-sites`);
      const json = await res.json();
      if (res.ok && Array.isArray(json)) setGraveSites(json);
    } catch { /* ignore */ }
  }, [id]);

  useEffect(() => { fetchData(); fetchGraveSites(); }, [fetchData, fetchGraveSites]);

  const handleDelete = async () => {
    if (!confirm("この台帳を削除しますか？（戸主データは削除されません）")) return;
    setDeleting(true);
    await fetchWithAuth(`/api/family-register/${id}`, { method: "DELETE" });
    router.push("/family-register");
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

  const handleAddGrave = async () => {
    setAddingGrave(true);
    await fetchWithAuth(`/api/family-register/${id}/grave-sites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(graveForm),
    });
    setGraveForm({ section: "", number: "", graveType: "", contractedAt: "", note: "" });
    setShowGraveForm(false);
    setAddingGrave(false);
    fetchGraveSites();
  };

  const handleDeleteGrave = async (graveSiteId: string) => {
    if (!confirm("この墓地情報を削除しますか？")) return;
    await fetchWithAuth(`/api/family-register/${id}/grave-sites?graveSiteId=${graveSiteId}`, { method: "DELETE" });
    fetchGraveSites();
  };

  if (loading) return <div className="text-center py-12 text-stone-400">読み込み中...</div>;
  if (!data) return <div className="text-center py-12 text-stone-400">台帳が見つかりません</div>;

  const allMembers = data.householders.flatMap((h) =>
    (h.members ?? []).map((m) => ({ ...m, householderName: `${h.familyName}${h.givenName}`, householderId: h.id }))
  );
  const livingMembers = allMembers.filter((m) => !m.deathDate);
  const deceasedMembers = allMembers.filter((m) => !!m.deathDate);

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "householders", label: "戸主" },
    { id: "genzaicho",    label: "現在帳", count: livingMembers.length },
    { id: "kakucho",      label: "過去帳",  count: deceasedMembers.length },
    { id: "bochi",        label: "墓地",    count: graveSites.length },
  ];

  const inputCls = "w-full border border-stone-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-stone-400";

  return (
    <div className="max-w-3xl space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/family-register" className="text-stone-400 hover:text-stone-600 text-sm">← 一覧へ</Link>
        <h1 className="text-2xl font-bold text-stone-700">{data.name}</h1>
      </div>

      <div className="flex gap-2 justify-end flex-wrap">
        <Link href={`/family-register/${id}/edit`}
          className="border border-stone-300 text-stone-600 px-4 py-1.5 rounded-lg hover:bg-stone-50 text-sm font-medium">
          名称編集
        </Link>
        <button onClick={handleDelete} disabled={deleting}
          className="border border-red-200 text-red-600 px-4 py-1.5 rounded-lg hover:bg-red-50 text-sm font-medium disabled:opacity-50">
          {deleting ? "削除中..." : "台帳削除"}
        </button>
      </div>

      {data.note && (
        <p className="text-stone-400 text-sm px-1">{data.note}</p>
      )}

      <div className="px-1">
        <span className="text-xs text-stone-400">UUID: </span>
        <span className="font-mono text-xs text-stone-500 break-all">{data.registerCode}</span>
      </div>

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
          {data.householders.length === 0 ? (
            <div className="space-y-3">
              <p className="text-stone-400 text-sm">戸主が登録されていません</p>
              {/* 戸主検索・登録フォーム */}
              <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
                <p className="text-sm font-medium text-stone-600">戸主を登録する</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={linkQuery}
                    onChange={(e) => { setLinkQuery(e.target.value); searchHouseholders(e.target.value); }}
                    placeholder="檀家名で検索..."
                    className={inputCls}
                  />
                </div>
                {linkResults.length > 0 && (
                  <ul className="border border-stone-200 rounded-lg divide-y divide-stone-100 text-sm">
                    {linkResults.map((r) => (
                      <li key={r.id} className="flex items-center justify-between px-3 py-2.5 hover:bg-stone-50">
                        <span className="text-stone-800">
                          {r.familyName}　{r.givenName}
                          {r.familyRegisterId && r.familyRegisterId !== id && (
                            <span className="ml-2 text-xs text-stone-400">（他の台帳に登録済み）</span>
                          )}
                        </span>
                        <button
                          onClick={() => handleLink(r.id)}
                          disabled={linking || (!!r.familyRegisterId && r.familyRegisterId !== id)}
                          className="ml-3 bg-stone-700 text-white text-xs px-3 py-1 rounded-lg hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          登録
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {linkQuery && linkResults.length === 0 && (
                  <p className="text-stone-400 text-sm">検索結果がありません</p>
                )}
              </div>
            </div>
          ) : (() => {
            const h = data.householders[0];
            const address = [h.address1, h.address2, h.address3].filter(Boolean).join(" ");
            return (
              <div className="space-y-3">
                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                  {/* ヘッダー */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
                    <div>
                      <Link href={`/householder/${h.id}`} className="text-xl font-bold text-stone-800 hover:text-amber-700">
                        {h.familyName}　{h.givenName}
                      </Link>
                      {(h.familyNameKana || h.givenNameKana) && (
                        <div className="text-sm text-stone-400 mt-0.5">
                          {h.familyNameKana}　{h.givenNameKana}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm px-3 py-1 rounded-full font-medium ${h.isActive ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                        {h.isActive ? "在籍" : "離檀"}
                      </span>
                      <button
                        onClick={() => handleUnlink(h.id)}
                        className="text-xs text-red-500 hover:text-red-700 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50"
                      >
                        登録解除
                      </button>
                    </div>
                  </div>

                  {/* 基本情報 */}
                  <dl className="divide-y divide-stone-50">
                    {h.gender && (
                      <div className="flex px-4 py-2.5">
                        <dt className="w-28 shrink-0 text-sm text-stone-400">性別</dt>
                        <dd className="text-sm text-stone-800">{h.gender}</dd>
                      </div>
                    )}
                    {h.birthDate && (
                      <div className="flex px-4 py-2.5">
                        <dt className="w-28 shrink-0 text-sm text-stone-400">生年月日</dt>
                        <dd className="text-sm text-stone-800">{formatDate(h.birthDate)}</dd>
                      </div>
                    )}
                    {h.deathDate && (
                      <div className="flex px-4 py-2.5">
                        <dt className="w-28 shrink-0 text-sm text-stone-400">命日</dt>
                        <dd className="text-sm text-stone-800">{formatDate(h.deathDate)}</dd>
                      </div>
                    )}
                    {h.dharmaName && (
                      <div className="flex px-4 py-2.5">
                        <dt className="w-28 shrink-0 text-sm text-stone-400">法名</dt>
                        <dd className="text-sm text-stone-800">
                          {h.dharmaName}
                          {h.dharmaNameKana && <span className="ml-2 text-stone-400 text-xs">({h.dharmaNameKana})</span>}
                        </dd>
                      </div>
                    )}
                    {h.postalCode && (
                      <div className="flex px-4 py-2.5">
                        <dt className="w-28 shrink-0 text-sm text-stone-400">郵便番号</dt>
                        <dd className="text-sm text-stone-800">〒{h.postalCode}</dd>
                      </div>
                    )}
                    {address && (
                      <div className="flex px-4 py-2.5">
                        <dt className="w-28 shrink-0 text-sm text-stone-400">住所</dt>
                        <dd className="text-sm text-stone-800">{address}</dd>
                      </div>
                    )}
                    {h.phone1 && (
                      <div className="flex px-4 py-2.5">
                        <dt className="w-28 shrink-0 text-sm text-stone-400">電話番号１</dt>
                        <dd className="text-sm text-stone-800">{h.phone1}</dd>
                      </div>
                    )}
                    {h.phone2 && (
                      <div className="flex px-4 py-2.5">
                        <dt className="w-28 shrink-0 text-sm text-stone-400">電話番号２</dt>
                        <dd className="text-sm text-stone-800">{h.phone2}</dd>
                      </div>
                    )}
                    {h.fax && (
                      <div className="flex px-4 py-2.5">
                        <dt className="w-28 shrink-0 text-sm text-stone-400">FAX</dt>
                        <dd className="text-sm text-stone-800">{h.fax}</dd>
                      </div>
                    )}
                    {h.email && (
                      <div className="flex px-4 py-2.5">
                        <dt className="w-28 shrink-0 text-sm text-stone-400">メール</dt>
                        <dd className="text-sm text-stone-800">{h.email}</dd>
                      </div>
                    )}
                    {h.domicile && (
                      <div className="flex px-4 py-2.5">
                        <dt className="w-28 shrink-0 text-sm text-stone-400">本籍</dt>
                        <dd className="text-sm text-stone-800">{h.domicile}</dd>
                      </div>
                    )}
                    {h.joinedAt && (
                      <div className="flex px-4 py-2.5">
                        <dt className="w-28 shrink-0 text-sm text-stone-400">入檀日</dt>
                        <dd className="text-sm text-stone-800">{formatDate(h.joinedAt)}</dd>
                      </div>
                    )}
                    {h.leftAt && (
                      <div className="flex px-4 py-2.5">
                        <dt className="w-28 shrink-0 text-sm text-stone-400">離檀日</dt>
                        <dd className="text-sm text-stone-800">{formatDate(h.leftAt)}</dd>
                      </div>
                    )}
                    {h.note && (
                      <div className="flex px-4 py-2.5">
                        <dt className="w-28 shrink-0 text-sm text-stone-400">備考</dt>
                        <dd className="text-sm text-stone-800 whitespace-pre-wrap">{h.note}</dd>
                      </div>
                    )}
                  </dl>

                  {/* 戸主台帳へのリンク */}
                  <div className="px-4 py-3 border-t border-stone-100 bg-stone-50">
                    <Link href={`/householder/${h.id}`}
                      className="text-sm text-amber-700 hover:text-amber-800 font-medium">
                      → 戸主台帳を開く
                    </Link>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 現在帳タブ */}
      {activeTab === "genzaicho" && (
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          {livingMembers.length === 0 ? (
            <p className="text-stone-400 text-sm">存命の世帯員が登録されていません</p>
          ) : (
            <div className="space-y-2">
              {livingMembers.map((m) => (
                <div key={m.id} className="border border-stone-100 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <Link href={`/members/${m.id}`}
                      className="shrink-0 border border-stone-300 rounded px-2 py-1 text-sm text-stone-600 hover:bg-stone-100 font-medium">
                      詳細
                    </Link>
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
                </div>
              ))}
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
              {deceasedMembers.map((m) => (
                <div key={m.id} className="border border-stone-100 rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <Link href={`/members/${m.id}`}
                      className="shrink-0 border border-stone-300 rounded px-2 py-1 text-sm text-stone-600 hover:bg-stone-100 font-medium">
                      詳細
                    </Link>
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
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 墓地タブ */}
      {activeTab === "bochi" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 p-4">
            {graveSites.length === 0 && !showGraveForm ? (
              <p className="text-stone-400 text-sm">墓地情報が登録されていません</p>
            ) : (
              <div className="space-y-2">
                {graveSites.map((g) => (
                  <div key={g.id} className="border border-stone-100 rounded-lg overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-stone-800">
                          {[g.section && `区画: ${g.section}`, g.number && `番号: ${g.number}`].filter(Boolean).join("　") || "（区画・番号未設定）"}
                        </div>
                        <div className="text-xs text-stone-400 space-x-3">
                          {g.graveType && <span>種類: {g.graveType}</span>}
                          {g.contractedAt && <span>契約日: {formatDate(g.contractedAt)}</span>}
                        </div>
                        {g.note && <div className="text-xs text-stone-400 mt-0.5">{g.note}</div>}
                      </div>
                      <button
                        onClick={() => handleDeleteGrave(g.id)}
                        className="shrink-0 text-xs text-red-500 hover:text-red-700 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showGraveForm ? (
            <div className="bg-white rounded-xl border border-stone-200 p-4 space-y-3">
              <p className="text-sm font-medium text-stone-600">墓地情報を追加</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-500 mb-1">区画</label>
                  <input type="text" value={graveForm.section}
                    onChange={(e) => setGraveForm({ ...graveForm, section: e.target.value })}
                    className={inputCls} placeholder="例: A区" />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">番号</label>
                  <input type="text" value={graveForm.number}
                    onChange={(e) => setGraveForm({ ...graveForm, number: e.target.value })}
                    className={inputCls} placeholder="例: 12" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-500 mb-1">種類</label>
                  <input type="text" value={graveForm.graveType}
                    onChange={(e) => setGraveForm({ ...graveForm, graveType: e.target.value })}
                    className={inputCls} placeholder="例: 一般墓" />
                </div>
                <div>
                  <label className="block text-xs text-stone-500 mb-1">契約日</label>
                  <input type="date" value={graveForm.contractedAt}
                    onChange={(e) => setGraveForm({ ...graveForm, contractedAt: e.target.value })}
                    className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">備考</label>
                <input type="text" value={graveForm.note}
                  onChange={(e) => setGraveForm({ ...graveForm, note: e.target.value })}
                  className={inputCls} />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowGraveForm(false)}
                  className="border border-stone-300 text-stone-600 px-4 py-1.5 rounded-lg hover:bg-stone-50 text-sm font-medium">
                  キャンセル
                </button>
                <button onClick={handleAddGrave} disabled={addingGrave}
                  className="bg-stone-700 text-white px-4 py-1.5 rounded-lg hover:bg-stone-800 text-sm font-medium disabled:opacity-50">
                  {addingGrave ? "追加中..." : "追加"}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowGraveForm(true)}
              className="border border-stone-300 text-stone-600 px-4 py-1.5 rounded-lg hover:bg-stone-50 text-sm font-medium">
              ＋ 墓地を追加
            </button>
          )}
        </div>
      )}
    </div>
  );
}
