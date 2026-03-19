import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

// 檀家詳細取得
export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const dankaId = id;

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
      return NextResponse.json({ error: "戸主が見つかりません" }, { status: 404 });
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
  const dankaId = id;

  try {
    const body = await request.json();
    const {
      familyName,
      givenName,
      familyNameKana,
      givenNameKana,
      postalCode,
      address1,
      address2,
      address3,
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
        address1: address1 || null,
        address2: address2 || null,
        address3: address3 || null,
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
  const dankaId = id;

  try {
    await prisma.danka.delete({ where: { id: dankaId } });
    return NextResponse.json({ message: "削除しました" });
  } catch (error) {
    console.error(`DELETE /api/danka/${id} error:`, error);
    return NextResponse.json({ error: (error as Error).message || "エラーが発生しました" }, { status: 500 });
  }
}
