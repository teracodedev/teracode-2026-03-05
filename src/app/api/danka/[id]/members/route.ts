import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// 世帯員追加
export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const dankaId = id;

  try {
    const body = await request.json();
    const { name, nameKana, relation, birthDate, deathDate, dharmaName, note } = body;

    if (!name) {
      return NextResponse.json({ error: "氏名は必須です" }, { status: 400 });
    }

    const member = await prisma.dankaMember.create({
      data: {
        dankaId,
        name,
        nameKana: nameKana || null,
        relation: relation || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        deathDate: deathDate ? new Date(deathDate) : null,
        dharmaName: dharmaName || null,
        note: note || null,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error(`POST /api/danka/${id}/members error:`, error);
    return NextResponse.json({ error: (error as Error).message || "登録に失敗しました" }, { status: 500 });
  }
}
