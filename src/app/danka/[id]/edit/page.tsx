"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DankaForm {
  familyName: string;
  givenName: string;
  familyNameKana: string;
  givenNameKana: string;
  postalCode: string;
  address1: string;
  address2: string;
  address3: string;
  phone: string;
  email: string;
  note: string;
  joinedAt: string;
  leftAt: string;
  isActive: boolean;
}

function toDateInput(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
}

export default function EditDankaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<DankaForm>({
    familyName: "",
    givenName: "",
    familyNameKana: "",
    givenNameKana: "",
    postalCode: "",
    address1: "",
    address2: "",
    address3: "",
    phone: "",
    email: "",
    note: "",
    joinedAt: "",
    leftAt: "",
    isActive: true,
  });

  useEffect(() => {
    fetch(`/api/danka/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          familyName: data.familyName || "",
          givenName: data.givenName || "",
          familyNameKana: data.familyNameKana || "",
          givenNameKana: data.givenNameKana || "",
          postalCode: data.postalCode || "",
          address1: data.address1 || "",
          address2: data.address2 || "",
          address3: data.address3 || "",
          phone: data.phone || "",
          email: data.email || "",
          note: data.note || "",
          joinedAt: toDateInput(data.joinedAt),
          leftAt: toDateInput(data.leftAt),
          isActive: data.isActive,
        });
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    setForm({
      ...form,
      [target.name]: target.type === "checkbox" ? target.checked : target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/danka/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "更新に失敗しました");
        return;
      }

      router.push(`/danka/${id}`);
    } catch (err) {
      console.error(err);
      setError("ネットワークエラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-stone-400">読み込み中...</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/danka/${id}`} className="text-stone-400 hover:text-stone-600 text-sm">
          ← 詳細へ
        </Link>
        <h1 className="text-2xl font-bold text-stone-500">戸主情報編集</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">
                姓 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="familyName"
                value={form.familyName}
                onChange={handleChange}
                required
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">
                名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="givenName"
                value={form.givenName}
                onChange={handleChange}
                required
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">姓（カナ）</label>
              <input
                type="text"
                name="familyNameKana"
                value={form.familyNameKana}
                onChange={handleChange}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">名（カナ）</label>
              <input
                type="text"
                name="givenNameKana"
                value={form.givenNameKana}
                onChange={handleChange}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">郵便番号</label>
              <input
                type="text"
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-stone-600 mb-1">住所1（都道府県・市区町村）</label>
              <input
                type="text"
                name="address1"
                value={form.address1}
                onChange={handleChange}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">住所2（丁目・番地）</label>
              <input
                type="text"
                name="address2"
                value={form.address2}
                onChange={handleChange}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">住所3（建物名・部屋番号）</label>
              <input
                type="text"
                name="address3"
                value={form.address3}
                onChange={handleChange}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">電話番号</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">メールアドレス</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">入檀日</label>
              <input
                type="date"
                name="joinedAt"
                value={form.joinedAt}
                onChange={handleChange}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">離檀日</label>
              <input
                type="date"
                name="leftAt"
                value={form.leftAt}
                onChange={handleChange}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="rounded"
              />
              在籍中
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">備考</label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows={3}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-stone-700 text-white px-6 py-2 rounded-lg hover:bg-stone-800 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {submitting ? "更新中..." : "更新する"}
          </button>
          <Link
            href={`/danka/${id}`}
            className="border border-stone-300 text-stone-600 px-6 py-2 rounded-lg hover:bg-stone-50 transition-colors text-sm font-medium"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}
