import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

// 世帯員追加
export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const dankaId = id;

  try {
    const body = await request.json();
    const { familyName, givenName, familyNameKana, givenNameKana, relation, birthDate, deathDate, dharmaName, dharmaNameKana, note } = body;

    if (!familyName) {
      return NextResponse.json({ error: "姓は必須です" }, { status: 400 });
    }

    const member = await prisma.dankaMember.create({
      data: {
        dankaId,
        familyName,
        givenName: givenName || null,
        familyNameKana: familyNameKana || null,
        givenNameKana: givenNameKana || null,
        relation: relation || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        deathDate: deathDate ? new Date(deathDate) : null,
        dharmaName: dharmaName || null,
        dharmaNameKana: dharmaNameKana || null,
        note: note || null,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error(`POST /api/danka/${id}/members error:`, error);
    return NextResponse.json({ error: (error as Error).message || "登録に失敗しました" }, { status: 500 });
  }
}
