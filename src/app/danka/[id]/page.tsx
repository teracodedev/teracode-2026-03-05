"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  familyName: string;
  givenName: string | null;
  nameKana: string | null;
  relation: string | null;
  birthDate: string | null;
  deathDate: string | null;
  dharmaName: string | null;
  dharmaNameKana: string | null;
  note: string | null;
}

interface Ceremony {
  id: string;
  title: string;
  scheduledAt: string;
  ceremonyType: string;
}

interface DankaDetail {
  id: string;
  dankaCode: string;
  familyName: string;
  givenName: string;
  familyNameKana: string | null;
  givenNameKana: string | null;
  postalCode: string | null;
  address1: string | null;
  address2: string | null;
  address3: string | null;
  phone: string | null;
  email: string | null;
  note: string | null;
  joinedAt: string | null;
  leftAt: string | null;
  isActive: boolean;
  members: Member[];
  ceremonies: { ceremony: Ceremony }[];
}

const CEREMONY_TYPE_LABELS: Record<string, string> = {
  MEMORIAL: "法要",
  REGULAR: "定例行事",
  FUNERAL: "葬儀・告別式",
  SPECIAL: "特別行事",
  OTHER: "その他",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("ja-JP");
}

function toInputDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
}

const emptyMemberForm = {
  familyName: "", givenName: "", nameKana: "", relation: "", birthDate: "", deathDate: "", dharmaName: "", dharmaNameKana: "", note: "",
};

type MemberForm = typeof emptyMemberForm;

function MemberFormFields({ form, onChange }: { form: MemberForm; onChange: (f: MemberForm) => void }) {
  const set = (k: keyof MemberForm, v: string) => onChange({ ...form, [k]: v });
  const cls = "w-full border border-stone-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400";
  return (
    <div className="grid grid-cols-2 gap-3 mt-3">
      <div>
        <label className="block text-xs text-stone-500 mb-1">姓 <span className="text-red-500">*</span></label>
        <input type="text" value={form.familyName} onChange={(e) => set("familyName", e.target.value)} placeholder="山田" className={cls} />
      </div>
      <div>
        <label className="block text-xs text-stone-500 mb-1">名</label>
        <input type="text" value={form.givenName} onChange={(e) => set("givenName", e.target.value)} placeholder="花子" className={cls} />
      </div>
      <div className="col-span-2">
        <label className="block text-xs text-stone-500 mb-1">氏名（カナ）</label>
        <input type="text" value={form.nameKana} onChange={(e) => set("nameKana", e.target.value)} placeholder="ヤマダ ハナコ" className={cls} />
      </div>
      <div>
        <label className="block text-xs text-stone-500 mb-1">続柄</label>
        <input type="text" value={form.relation} onChange={(e) => set("relation", e.target.value)} placeholder="妻・子など" className={cls} />
      </div>
      <div>
        <label className="block text-xs text-stone-500 mb-1">法名</label>
        <input type="text" value={form.dharmaName} onChange={(e) => set("dharmaName", e.target.value)} className={cls} />
      </div>
      <div>
        <label className="block text-xs text-stone-500 mb-1">法名（カナ）</label>
        <input type="text" value={form.dharmaNameKana} onChange={(e) => set("dharmaNameKana", e.target.value)} className={cls} />
      </div>
      <div>
        <label className="block text-xs text-stone-500 mb-1">生年月日</label>
        <input type="date" value={form.birthDate} onChange={(e) => set("birthDate", e.target.value)} className={cls} />
      </div>
      <div>
        <label className="block text-xs text-stone-500 mb-1">没年月日</label>
        <input type="date" value={form.deathDate} onChange={(e) => set("deathDate", e.target.value)} className={cls} />
      </div>
      <div className="col-span-2">
        <label className="block text-xs text-stone-500 mb-1">備考</label>
        <input type="text" value={form.note} onChange={(e) => set("note", e.target.value)} className={cls} />
      </div>
    </div>
  );
}

export default function DankaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [danka, setDanka] = useState<DankaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<MemberForm>(emptyMemberForm);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState("");
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<MemberForm>(emptyMemberForm);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  const fetchDanka = () => {
    fetch(`/api/danka/${id}`)
      .then((res) => res.json())
      .then((data) => { setDanka(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchDanka(); }, [id]);

  const handleDelete = async () => {
    if (!confirm("この戸主を削除してもよろしいですか？")) return;
    setDeleting(true);
    try {
      await fetch(`/api/danka/${id}`, { method: "DELETE" });
      router.push("/danka");
    } catch { setDeleting(false); }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddSubmitting(true);
    setAddError("");
    try {
      const res = await fetch(`/api/danka/${id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(data.error || "登録に失敗しました"); return; }
      setAddForm(emptyMemberForm);
      setShowAddForm(false);
      fetchDanka();
    } catch { setAddError("ネットワークエラーが発生しました"); }
    finally { setAddSubmitting(false); }
  };

  const startEdit = (member: Member) => {
    setEditingMemberId(member.id);
    setEditForm({
      familyName: member.familyName,
      givenName: member.givenName || "",
      nameKana: member.nameKana || "",
      relation: member.relation || "",
      birthDate: toInputDate(member.birthDate),
      deathDate: toInputDate(member.deathDate),
      dharmaName: member.dharmaName || "",
      dharmaNameKana: member.dharmaNameKana || "",
      note: member.note || "",
    });
    setEditError("");
  };

  const handleEditMember = async (e: React.FormEvent, memberId: string) => {
    e.preventDefault();
    setEditSubmitting(true);
    setEditError("");
    try {
      const res = await fetch(`/api/danka/${id}/members/${memberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) { setEditError(data.error || "更新に失敗しました"); return; }
      setEditingMemberId(null);
      fetchDanka();
    } catch { setEditError("ネットワークエラーが発生しました"); }
    finally { setEditSubmitting(false); }
  };

  const handleDeleteMember = async (memberId: string, memberName: string) => {
    if (!confirm(`「${memberName}」を削除してもよろしいですか？`)) return;
    try {
      await fetch(`/api/danka/${id}/members/${memberId}`, { method: "DELETE" });
      fetchDanka();
    } catch { alert("削除に失敗しました"); }
  };

  if (loading) return <div className="text-center py-12 text-stone-400">読み込み中...</div>;
  if (!danka) return <div className="text-center py-12 text-stone-400">戸主が見つかりません</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/danka" className="text-stone-400 hover:text-stone-600 text-sm">← 一覧へ</Link>
        <h1 className="text-2xl font-bold text-stone-500">{danka.familyName} {danka.givenName}</h1>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${danka.isActive ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
          {danka.isActive ? "在籍" : "離檀"}
        </span>
      </div>

      <div className="flex gap-3 justify-end">
        <Link href={`/danka/${id}/edit`}
          className="border border-stone-300 text-stone-600 px-4 py-1.5 rounded-lg hover:bg-stone-50 transition-colors text-sm font-medium">
          編集
        </Link>
        <button onClick={handleDelete} disabled={deleting}
          className="border border-red-200 text-red-600 px-4 py-1.5 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-50">
          {deleting ? "削除中..." : "削除"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <h2 className="font-semibold text-stone-700 mb-4">基本情報</h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div><dt className="text-stone-400">UUID</dt><dd className="font-mono text-stone-700 text-xs break-all">{danka.dankaCode}</dd></div>
          <div>
            <dt className="text-stone-400">氏名（カナ）</dt>
            <dd className="text-stone-700">
              {danka.familyNameKana && danka.givenNameKana
                ? `${danka.familyNameKana} ${danka.givenNameKana}` : "-"}
            </dd>
          </div>
          <div><dt className="text-stone-400">郵便番号</dt><dd className="text-stone-700">{danka.postalCode || "-"}</dd></div>
          <div className="col-span-2">
            <dt className="text-stone-400">住所</dt>
            <dd className="text-stone-700">
              {[danka.address1, danka.address2, danka.address3].filter(Boolean).join(" ") || "-"}
            </dd>
          </div>
          <div><dt className="text-stone-400">電話番号</dt><dd className="text-stone-700">{danka.phone || "-"}</dd></div>
          <div><dt className="text-stone-400">メールアドレス</dt><dd className="text-stone-700">{danka.email || "-"}</dd></div>
          <div><dt className="text-stone-400">入檀日</dt><dd className="text-stone-700">{formatDate(danka.joinedAt)}</dd></div>
          {danka.leftAt && (
            <div><dt className="text-stone-400">離檀日</dt><dd className="text-stone-700">{formatDate(danka.leftAt)}</dd></div>
          )}
          {danka.note && (
            <div className="col-span-2">
              <dt className="text-stone-400">備考</dt>
              <dd className="text-stone-700 whitespace-pre-wrap">{danka.note}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-stone-700">世帯員 ({danka.members.length}名)</h2>
          <button
            onClick={() => { setShowAddForm(!showAddForm); setAddError(""); setAddForm(emptyMemberForm); }}
            className="text-sm text-stone-600 hover:text-stone-800 border border-stone-300 px-3 py-1 rounded-lg"
          >
            {showAddForm ? "キャンセル" : "+ 追加"}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddMember} className="border border-stone-200 rounded-lg p-4 mb-4 bg-stone-50">
            <p className="text-sm font-medium text-stone-700">新規世帯員</p>
            {addError && <p className="text-red-600 text-xs mt-1">{addError}</p>}
            <MemberFormFields form={addForm} onChange={setAddForm} />
            <div className="flex gap-2 mt-3">
              <button type="submit" disabled={addSubmitting}
                className="bg-stone-700 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-stone-800 disabled:opacity-50">
                {addSubmitting ? "登録中..." : "登録する"}
              </button>
            </div>
          </form>
        )}

        {danka.members.length === 0 && !showAddForm ? (
          <p className="text-stone-400 text-sm">世帯員が登録されていません</p>
        ) : (
          <div className="space-y-3">
            {danka.members.map((member) => {
              const displayName = [member.familyName, member.givenName].filter(Boolean).join(" ");
              return (
                <div key={member.id} className="border border-stone-100 rounded-lg p-4 text-sm">
                  {editingMemberId === member.id ? (
                    <form onSubmit={(e) => handleEditMember(e, member.id)}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-stone-700">編集中</p>
                        <button type="button" onClick={() => setEditingMemberId(null)}
                          className="text-xs text-stone-400 hover:text-stone-600">キャンセル</button>
                      </div>
                      {editError && <p className="text-red-600 text-xs mt-1">{editError}</p>}
                      <MemberFormFields form={editForm} onChange={setEditForm} />
                      <div className="flex gap-2 mt-3">
                        <button type="submit" disabled={editSubmitting}
                          className="bg-stone-700 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-stone-800 disabled:opacity-50">
                          {editSubmitting ? "保存中..." : "保存する"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-stone-800">{displayName}</span>
                          {member.relation && (
                            <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">{member.relation}</span>
                          )}
                          {member.deathDate && (
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">故人</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => startEdit(member)}
                            className="text-xs text-stone-500 hover:text-stone-700 border border-stone-200 px-2 py-0.5 rounded">
                            編集
                          </button>
                          <button onClick={() => handleDeleteMember(member.id, displayName)}
                            className="text-xs text-red-400 hover:text-red-600 border border-red-100 px-2 py-0.5 rounded">
                            削除
                          </button>
                        </div>
                      </div>
                      <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-stone-500">
                        <div className="col-span-2"><dt className="inline">UUID: </dt><dd className="inline font-mono break-all">{member.id}</dd></div>
                        {member.nameKana && <div><dt className="inline">カナ: </dt><dd className="inline">{member.nameKana}</dd></div>}
                        {member.birthDate && <div><dt className="inline">生年月日: </dt><dd className="inline">{formatDate(member.birthDate)}</dd></div>}
                        {member.deathDate && <div><dt className="inline">没年月日: </dt><dd className="inline">{formatDate(member.deathDate)}</dd></div>}
                        {member.dharmaName && <div><dt className="inline">法名: </dt><dd className="inline">{member.dharmaName}</dd></div>}
                        {member.dharmaNameKana && <div><dt className="inline">法名（カナ）: </dt><dd className="inline">{member.dharmaNameKana}</dd></div>}
                      </dl>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {danka.ceremonies.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <h2 className="font-semibold text-stone-700 mb-4">参加法要履歴</h2>
          <div className="space-y-2">
            {danka.ceremonies.map(({ ceremony }) => (
              <Link key={ceremony.id} href={`/ceremonies/${ceremony.id}`}
                className="flex items-center justify-between border border-stone-100 rounded-lg p-3 hover:bg-stone-50">
                <div>
                  <span className="text-sm font-medium text-stone-800">{ceremony.title}</span>
                  <span className="ml-2 text-xs text-stone-400">
                    {CEREMONY_TYPE_LABELS[ceremony.ceremonyType] || ceremony.ceremonyType}
                  </span>
                </div>
                <span className="text-xs text-stone-400">{formatDate(ceremony.scheduledAt)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
