import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

/** 墓地一覧取得 */
export async function GET(_req: NextRequest, { params }: Params) {
  const unauth = await requireAuth();
  if (unauth) return unauth;

  const { id } = await params;
  const sites = await prisma.graveSite.findMany({
    where: { familyRegisterId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(sites);
}

/** 墓地追加 */
export async function POST(req: NextRequest, { params }: Params) {
  const unauth = await requireAuth();
  if (unauth) return unauth;

  const { id } = await params;
  const { section, number, graveType, contractedAt, note } = await req.json();

  const site = await prisma.graveSite.create({
    data: {
      familyRegisterId: id,
      section: section || null,
      number: number || null,
      graveType: graveType || null,
      contractedAt: contractedAt ? new Date(contractedAt) : null,
      note: note || null,
    },
  });
  return NextResponse.json(site, { status: 201 });
}

/** 墓地削除 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const unauth = await requireAuth();
  if (unauth) return unauth;

  await params;
  const graveSiteId = req.nextUrl.searchParams.get("graveSiteId");
  if (!graveSiteId) return NextResponse.json({ error: "graveSiteIdが必要です" }, { status: 400 });

  await prisma.graveSite.delete({ where: { id: graveSiteId } });
  return NextResponse.json({ message: "削除しました" });
}
