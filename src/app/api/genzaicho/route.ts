import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 現在帳一覧取得（没年月日が未設定の在籍世帯員）
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";

  try {
    const records = await prisma.dankaMember.findMany({
      where: {
        deathDate: null,
        danka: { isActive: true },
        OR: query
          ? [
              { name: { contains: query, mode: "insensitive" } },
              { nameKana: { contains: query, mode: "insensitive" } },
              { relation: { contains: query, mode: "insensitive" } },
              { danka: { familyName: { contains: query, mode: "insensitive" } } },
              { danka: { dankaCode: { contains: query, mode: "insensitive" } } },
              { danka: { address: { contains: query, mode: "insensitive" } } },
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
            address: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("GET /api/genzaicho error:", error);
    return NextResponse.json({ error: "データの取得に失敗しました" }, { status: 500 });
  }
}
