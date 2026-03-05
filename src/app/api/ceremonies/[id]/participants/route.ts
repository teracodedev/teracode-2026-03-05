import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// 参加者追加
export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const ceremonyId = parseInt(id);
  if (isNaN(ceremonyId)) {
    return NextResponse.json({ error: "不正なID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { dankaId, attendees, offering, note } = body;

    if (!dankaId) {
      return NextResponse.json({ error: "檀家IDは必須です" }, { status: 400 });
    }

    const participant = await prisma.ceremonyParticipant.upsert({
      where: {
        ceremonyId_dankaId: { ceremonyId, dankaId: parseInt(dankaId) },
      },
      update: {
        attendees: attendees ? parseInt(attendees) : 1,
        offering: offering ? parseInt(offering) : null,
        note: note || null,
      },
      create: {
        ceremonyId,
        dankaId: parseInt(dankaId),
        attendees: attendees ? parseInt(attendees) : 1,
        offering: offering ? parseInt(offering) : null,
        note: note || null,
      },
      include: { danka: true },
    });

    return NextResponse.json(participant, { status: 201 });
  } catch (error) {
    console.error(`POST /api/ceremonies/${id}/participants error:`, error);
    return NextResponse.json({ error: "参加者の追加に失敗しました" }, { status: 500 });
  }
}

// 参加者削除
export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const ceremonyId = parseInt(id);
  const searchParams = request.nextUrl.searchParams;
  const dankaId = searchParams.get("dankaId");

  if (isNaN(ceremonyId) || !dankaId) {
    return NextResponse.json({ error: "不正なパラメータ" }, { status: 400 });
  }

  try {
    await prisma.ceremonyParticipant.delete({
      where: {
        ceremonyId_dankaId: { ceremonyId, dankaId: parseInt(dankaId) },
      },
    });

    return NextResponse.json({ message: "参加者を削除しました" });
  } catch (error) {
    console.error(`DELETE /api/ceremonies/${id}/participants error:`, error);
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}
