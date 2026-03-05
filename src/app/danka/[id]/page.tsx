"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Member {
  id: number;
  name: string;
  nameKana: string | null;
  relation: string | null;
  birthDate: string | null;
  deathDate: string | null;
  dharmaName: string | null;
  note: string | null;
}

interface Ceremony {
  id: number;
  title: string;
  scheduledAt: string;
  ceremonyType: string;
}

interface DankaDetail {
  id: number;
  dankaCode: string;
  familyName: string;
  givenName: string;
  familyNameKana: string | null;
  givenNameKana: string | null;
  postalCode: string | null;
  address: string | null;
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

export default function DankaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [danka, setDanka] = useState<DankaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/danka/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setDanka(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("この檀家を削除してもよろしいですか？")) return;
    setDeleting(true);
    try {
      await fetch(`/api/danka/${id}`, { method: "DELETE" });
      router.push("/danka");
    } catch {
      setDeleting(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-stone-400">読み込み中...</div>;
  if (!danka) return <div className="text-center py-12 text-stone-400">檀家が見つかりません</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/danka" className="text-stone-400 hover:text-stone-600 text-sm">
          ← 一覧へ
        </Link>
        <h1 className="text-2xl font-bold text-stone-800">
          {danka.familyName} {danka.givenName}
        </h1>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            danka.isActive ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"
          }`}
        >
          {danka.isActive ? "在籍" : "離檀"}
        </span>
      </div>

      <div className="flex gap-3 justify-end">
        <Link
          href={`/danka/${id}/edit`}
          className="border border-stone-300 text-stone-600 px-4 py-1.5 rounded-lg hover:bg-stone-50 transition-colors text-sm font-medium"
        >
          編集
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="border border-red-200 text-red-600 px-4 py-1.5 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium disabled:opacity-50"
        >
          {deleting ? "削除中..." : "削除"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <h2 className="font-semibold text-stone-700 mb-4">基本情報</h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div>
            <dt className="text-stone-400">檀家番号</dt>
            <dd className="font-mono text-stone-700">{danka.dankaCode}</dd>
          </div>
          <div>
            <dt className="text-stone-400">氏名（カナ）</dt>
            <dd className="text-stone-700">
              {danka.familyNameKana && danka.givenNameKana
                ? `${danka.familyNameKana} ${danka.givenNameKana}`
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-stone-400">郵便番号</dt>
            <dd className="text-stone-700">{danka.postalCode || "-"}</dd>
          </div>
          <div>
            <dt className="text-stone-400">住所</dt>
            <dd className="text-stone-700">{danka.address || "-"}</dd>
          </div>
          <div>
            <dt className="text-stone-400">電話番号</dt>
            <dd className="text-stone-700">{danka.phone || "-"}</dd>
          </div>
          <div>
            <dt className="text-stone-400">メールアドレス</dt>
            <dd className="text-stone-700">{danka.email || "-"}</dd>
          </div>
          <div>
            <dt className="text-stone-400">入檀日</dt>
            <dd className="text-stone-700">{formatDate(danka.joinedAt)}</dd>
          </div>
          {danka.leftAt && (
            <div>
              <dt className="text-stone-400">離檀日</dt>
              <dd className="text-stone-700">{formatDate(danka.leftAt)}</dd>
            </div>
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
        <h2 className="font-semibold text-stone-700 mb-4">世帯員 ({danka.members.length}名)</h2>
        {danka.members.length === 0 ? (
          <p className="text-stone-400 text-sm">世帯員が登録されていません</p>
        ) : (
          <div className="space-y-3">
            {danka.members.map((member) => (
              <div key={member.id} className="border border-stone-100 rounded-lg p-4 text-sm">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-medium text-stone-800">{member.name}</span>
                  {member.relation && (
                    <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                      {member.relation}
                    </span>
                  )}
                </div>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-stone-500">
                  {member.nameKana && (
                    <div><dt className="inline">カナ: </dt><dd className="inline">{member.nameKana}</dd></div>
                  )}
                  {member.birthDate && (
                    <div><dt className="inline">生年月日: </dt><dd className="inline">{formatDate(member.birthDate)}</dd></div>
                  )}
                  {member.deathDate && (
                    <div><dt className="inline">没年月日: </dt><dd className="inline">{formatDate(member.deathDate)}</dd></div>
                  )}
                  {member.dharmaName && (
                    <div><dt className="inline">戒名: </dt><dd className="inline">{member.dharmaName}</dd></div>
                  )}
                </dl>
              </div>
            ))}
          </div>
        )}
      </div>

      {danka.ceremonies.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <h2 className="font-semibold text-stone-700 mb-4">参加法要履歴</h2>
          <div className="space-y-2">
            {danka.ceremonies.map(({ ceremony }) => (
              <Link
                key={ceremony.id}
                href={`/ceremonies/${ceremony.id}`}
                className="flex items-center justify-between border border-stone-100 rounded-lg p-3 hover:bg-stone-50"
              >
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
