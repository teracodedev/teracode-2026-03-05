"use client";
import { fetchWithAuth } from "@/lib/fetch-with-auth";

import { Fragment, useState, useEffect, useCallback } from "react";
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
  dharmaName: string | null;
  dharmaNameKana: string | null;
  note: string | null;
  householder: {
    id: string;
    householderCode: string;
    familyName: string;
    givenName: string;
    postalCode: string | null;
    address1: string | null;
    address2: string | null;
    address3: string | null;
    phone1: string | null;
    phone2: string | null;
    fax: string | null;
    note: string | null;
    domicile: string | null;
  };
}

interface DetailForm {
  postalCode: string;
  address1: string;
  address2: string;
  address3: string;
  phone1: string;
  phone2: string;
  fax: string;
  householderNote: string;
  domicile: string;
  dharmaName: string;
  dharmaNameKana: string;
}

function toDetailForm(record: GenzaichoRecord): DetailForm {
  return {
    postalCode: record.householder.postalCode || "",
    address1: record.householder.address1 || "",
    address2: record.householder.address2 || "",
    address3: record.householder.address3 || "",
    phone1: record.householder.phone1 || "",
    phone2: record.householder.phone2 || "",
    fax: record.householder.fax || "",
    householderNote: record.householder.note || "",
    domicile: record.householder.domicile || "",
    dharmaName: record.dharmaName || "",
    dharmaNameKana: record.dharmaNameKana || "",
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

const inputCls = "w-full border border-stone-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-stone-400";
const labelCls = "block text-sm text-stone-500 mb-1";

function DetailPanel({
  record,
  onClose,
  onSaved,
}: {
  record: GenzaichoRecord;
  onClose: () => void;
  onSaved: (updated: { householder: Partial<GenzaichoRecord["householder"]>; member: Partial<GenzaichoRecord> }) => void;
}) {
  const [form, setForm] = useState<DetailForm>(() => toDetailForm(record));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof DetailForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const [hRes, mRes] = await Promise.all([
        fetchWithAuth(`/api/householder/${record.householderId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            familyName: record.householder.familyName,
            givenName: record.householder.givenName,
            postalCode: form.postalCode,
            address1: form.address1,
            address2: form.address2,
            address3: form.address3,
            phone1: form.phone1,
            phone2: form.phone2,
            fax: form.fax,
            note: form.householderNote,
            domicile: form.domicile,
            isActive: true,
          }),
        }),
        fetchWithAuth(`/api/householder/${record.householderId}/members/${record.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            familyName: record.familyName,
            givenName: record.givenName || "",
            familyNameKana: record.familyNameKana || "",
            givenNameKana: record.givenNameKana || "",
            relation: record.relation || "",
            dharmaName: form.dharmaName,
            dharmaNameKana: form.dharmaNameKana,
            note: record.note || "",
          }),
        }),
      ]);

      if (!hRes.ok || !mRes.ok) {
        setError("保存に失敗しました");
        return;
      }

      onSaved({
        householder: {
          postalCode: form.postalCode || null,
          address1: form.address1 || null,
          address2: form.address2 || null,
          address3: form.address3 || null,
          phone1: form.phone1 || null,
          phone2: form.phone2 || null,
          fax: form.fax || null,
          note: form.householderNote || null,
          domicile: form.domicile || null,
        },
        member: {
          dharmaName: form.dharmaName || null,
          dharmaNameKana: form.dharmaNameKana || null,
        },
      });
      onClose();
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-stone-50 border-t border-stone-200 px-4 py-4 space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>郵便番号</label>
          <input type="text" value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} placeholder="123-4567" className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>住所1（都道府県・市区町村）</label>
          <input type="text" value={form.address1} onChange={(e) => set("address1", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>住所2（丁目・番地）</label>
          <input type="text" value={form.address2} onChange={(e) => set("address2", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>住所3（建物名・部屋番号）</label>
          <input type="text" value={form.address3} onChange={(e) => set("address3", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>電話番号1</label>
          <input type="tel" value={form.phone1} onChange={(e) => set("phone1", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>電話番号2</label>
          <input type="tel" value={form.phone2} onChange={(e) => set("phone2", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>FAX</label>
          <input type="tel" value={form.fax} onChange={(e) => set("fax", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>本籍地</label>
          <input type="text" value={form.domicile} onChange={(e) => set("domicile", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>法名</label>
          <input type="text" value={form.dharmaName} onChange={(e) => set("dharmaName", e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>法名（カナ）</label>
          <input type="text" value={form.dharmaNameKana} onChange={(e) => set("dharmaNameKana", e.target.value)} className={inputCls} />
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>備考</label>
          <input type="text" value={form.householderNote} onChange={(e) => set("householderNote", e.target.value)} className={inputCls} />
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-stone-700 text-white px-5 py-2 rounded-lg hover:bg-stone-800 transition-colors text-base font-medium disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>
        <button
          onClick={onClose}
          className="border border-stone-300 text-stone-600 px-5 py-2 rounded-lg hover:bg-stone-100 transition-colors text-base font-medium"
        >
          閉じる
        </button>
        <Link
          href={`/householder/${record.householderId}`}
          className="ml-auto text-stone-400 hover:text-stone-600 text-sm self-center"
        >
          戸主詳細 →
        </Link>
      </div>
    </div>
  );
}

export default function GenzaichoPage() {
  const [records, setRecords] = useState<GenzaichoRecord[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      const res = await fetchWithAuth(`/api/genzaicho?${params}`);
      const data = await res.json();
      const rows = Array.isArray(data) ? data : [];
      setRecords(
        rows.filter(
          (r): r is GenzaichoRecord =>
            !!r &&
            typeof r === "object" &&
            typeof (r as GenzaichoRecord).householder?.id === "string"
        )
      );
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

  const toggleExpanded = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleSaved = (
    recordId: string,
    updated: { householder: Partial<GenzaichoRecord["householder"]>; member: Partial<GenzaichoRecord> }
  ) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              ...updated.member,
              householder: { ...r.householder, ...updated.householder },
            }
          : r
      )
    );
  };

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
          <p className="text-xs mt-2">戸主の世帯員を登録すると現在帳に表示されます</p>
        </div>
      ) : (
        <>
          {/* モバイル: カード表示 */}
          <div className="md:hidden space-y-2">
            {records.map((record) => (
              <div key={record.id} className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-stone-800 text-base">
                        {record.familyName} {record.givenName || ""}
                      </div>
                      {record.familyNameKana && (
                        <div className="text-sm text-stone-400">{record.familyNameKana} {record.givenNameKana || ""}</div>
                      )}
                      <div className="text-sm text-stone-500 mt-1 flex flex-wrap gap-x-2">
                        {record.relation && <span>{record.relation}</span>}
                        {record.birthDate && <span>生: {formatDate(record.birthDate)}（{calcAge(record.birthDate)}）</span>}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <Link href={`/householder/${record.householder.id}`} className="text-sm text-stone-500 hover:underline">
                        {record.householder.familyName} {record.householder.givenName}
                      </Link>
                      <div className="text-sm text-stone-400 mt-0.5">
                        {[record.householder.address1, record.householder.address2].filter(Boolean).join(" ")}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleExpanded(record.id)}
                    className="mt-2 w-full border border-stone-300 rounded-lg py-1.5 text-base text-stone-600 hover:bg-stone-50 transition-colors font-medium"
                  >
                    {expandedId === record.id ? "▲ 閉じる" : "▼ 詳細"}
                  </button>
                </div>
                {expandedId === record.id && (
                  <DetailPanel
                    record={record}
                    onClose={() => setExpandedId(null)}
                    onSaved={(updated) => handleSaved(record.id, updated)}
                  />
                )}
              </div>
            ))}
            <div className="text-sm text-stone-400 px-1 pt-1">{records.length}名</div>
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
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {records.map((record) => (
                  <Fragment key={record.id}>
                    <tr className="hover:bg-stone-50">
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
                      <td className="px-4 py-3 text-stone-600 text-sm">
                        {[record.householder.address1, record.householder.address2, record.householder.address3].filter(Boolean).join(" ") || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleExpanded(record.id)}
                          className="border border-stone-300 rounded-lg px-3 py-1 text-sm text-stone-600 hover:bg-stone-50 transition-colors whitespace-nowrap"
                        >
                          {expandedId === record.id ? "閉じる" : "詳細"}
                        </button>
                      </td>
                    </tr>
                    {expandedId === record.id && (
                      <tr key={`${record.id}-detail`}>
                        <td colSpan={8} className="p-0">
                          <DetailPanel
                            record={record}
                            onClose={() => setExpandedId(null)}
                            onSaved={(updated) => handleSaved(record.id, updated)}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 bg-stone-50 border-t border-stone-200 text-sm text-stone-400">
              {records.length}名
            </div>
          </div>
        </>
      )}
    </div>
  );
}
