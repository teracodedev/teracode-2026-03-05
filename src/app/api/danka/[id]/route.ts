import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// 檀家詳細取得
export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const dankaId = parseInt(id);
  if (isNaN(dankaId)) {
    return NextResponse.json({ error: "不正なID" }, { status: 400 });
  }

  try {
    const danka = await prisma.danka.findUnique({
      where: { id: dankaId },
      include: {
        members: true,
        ceremonies: {
          include: { ceremony: true },
          orderBy: { ceremony: { scheduledAt: "desc" } },
        },
      },
    });

    if (!danka) {
      return NextResponse.json({ error: "檀家が見つかりません" }, { status: 404 });
    }

    return NextResponse.json(danka);
  } catch (error) {
    console.error(`GET /api/danka/${id} error:`, error);
    return NextResponse.json({ error: (error as Error).message || "エラーが発生しました" }, { status: 500 });
  }
}

// 檀家情報更新
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const dankaId = parseInt(id);
  if (isNaN(dankaId)) {
    return NextResponse.json({ error: "不正なID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const {
      familyName,
      givenName,
      familyNameKana,
      givenNameKana,
      postalCode,
      address,
      phone,
      email,
      note,
      joinedAt,
      leftAt,
      isActive,
    } = body;

    const danka = await prisma.danka.update({
      where: { id: dankaId },
      data: {
        familyName,
        givenName,
        familyNameKana: familyNameKana || null,
        givenNameKana: givenNameKana || null,
        postalCode: postalCode || null,
        address: address || null,
        phone: phone || null,
        email: email || null,
        note: note || null,
        joinedAt: joinedAt ? new Date(joinedAt) : null,
        leftAt: leftAt ? new Date(leftAt) : null,
        isActive: isActive ?? true,
      },
      include: { members: true },
    });

    return NextResponse.json(danka);
  } catch (error) {
    console.error(`PUT /api/danka/${id} error:`, error);
    return NextResponse.json({ error: (error as Error).message || "エラーが発生しました" }, { status: 500 });
  }
}

// 檀家削除
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const dankaId = parseInt(id);
  if (isNaN(dankaId)) {
    return NextResponse.json({ error: "不正なID" }, { status: 400 });
  }

  try {
    await prisma.danka.delete({ where: { id: dankaId } });
    return NextResponse.json({ message: "削除しました" });
  } catch (error) {
    console.error(`DELETE /api/danka/${id} error:`, error);
    return NextResponse.json({ error: (error as Error).message || "エラーが発生しました" }, { status: 500 });
  }
}
