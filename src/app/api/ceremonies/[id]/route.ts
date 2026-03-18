import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// 法要詳細取得
export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const ceremonyId = id;

  try {
    const ceremony = await prisma.ceremony.findUnique({
      where: { id: ceremonyId },
      include: {
        participants: {
          include: { danka: true },
        },
      },
    });

    if (!ceremony) {
      return NextResponse.json({ error: "法要が見つかりません" }, { status: 404 });
    }

    return NextResponse.json(ceremony);
  } catch (error) {
    console.error(`GET /api/ceremonies/${id} error:`, error);
    return NextResponse.json({ error: (error as Error).message || "エラーが発生しました" }, { status: 500 });
  }
}

// 法要情報更新
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const ceremonyId = id;

  try {
    const body = await request.json();
    const {
      title,
      ceremonyType,
      scheduledAt,
      endAt,
      location,
      description,
      maxAttendees,
      fee,
      status,
      note,
    } = body;

    const ceremony = await prisma.ceremony.update({
      where: { id: ceremonyId },
      data: {
        title,
        ceremonyType,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        endAt: endAt ? new Date(endAt) : null,
        location: location || null,
        description: description || null,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
        fee: fee ? parseInt(fee) : null,
        status,
        note: note || null,
      },
      include: {
        participants: { include: { danka: true } },
      },
    });

    return NextResponse.json(ceremony);
  } catch (error) {
    console.error(`PUT /api/ceremonies/${id} error:`, error);
    return NextResponse.json({ error: (error as Error).message || "エラーが発生しました" }, { status: 500 });
  }
}

// 法要削除
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const ceremonyId = id;

  try {
    await prisma.ceremony.delete({ where: { id: ceremonyId } });
    return NextResponse.json({ message: "削除しました" });
  } catch (error) {
    console.error(`DELETE /api/ceremonies/${id} error:`, error);
    return NextResponse.json({ error: (error as Error).message || "エラーが発生しました" }, { status: 500 });
  }
}
