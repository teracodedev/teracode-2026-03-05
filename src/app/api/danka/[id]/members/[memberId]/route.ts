import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string; memberId: string }> };

// 世帯員更新
export async function PUT(request: NextRequest, { params }: Params) {
  const { memberId } = await params;
  const id = memberId;

  try {
    const body = await request.json();
    const { name, nameKana, relation, birthDate, deathDate, dharmaName, dharmaNameKana, note } = body;

    if (!name) {
      return NextResponse.json({ error: "氏名は必須です" }, { status: 400 });
    }

    const member = await prisma.dankaMember.update({
      where: { id },
      data: {
        name,
        nameKana: nameKana || null,
        relation: relation || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        deathDate: deathDate ? new Date(deathDate) : null,
        dharmaName: dharmaName || null,
        dharmaNameKana: dharmaNameKana || null,
        note: note || null,
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error(`PUT /api/danka/members/${memberId} error:`, error);
    return NextResponse.json({ error: (error as Error).message || "更新に失敗しました" }, { status: 500 });
  }
}

// 世帯員削除
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { memberId } = await params;
  const id = memberId;

  try {
    await prisma.dankaMember.delete({ where: { id } });
    return NextResponse.json({ message: "削除しました" });
  } catch (error) {
    console.error(`DELETE /api/danka/members/${memberId} error:`, error);
    return NextResponse.json({ error: (error as Error).message || "削除に失敗しました" }, { status: 500 });
  }
}
