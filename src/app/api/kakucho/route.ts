import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 過去帳一覧取得（没年月日が設定されている世帯員）
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";

  try {
    const records = await prisma.dankaMember.findMany({
      where: {
        deathDate: { not: null },
        OR: query
          ? [
              { name: { contains: query, mode: "insensitive" } },
              { nameKana: { contains: query, mode: "insensitive" } },
              { dharmaName: { contains: query, mode: "insensitive" } },
              { danka: { familyName: { contains: query, mode: "insensitive" } } },
              { danka: { dankaCode: { contains: query, mode: "insensitive" } } },
            ]
          : undefined,
      },
      include: {
        danka: {
          select: {
            id: true,
            dankaCode: true,
            familyName: true,
            givenName: true,
          },
        },
      },
      orderBy: { deathDate: "desc" },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("GET /api/kakucho error:", error);
    return NextResponse.json({ error: "データの取得に失敗しました" }, { status: 500 });
  }
}
