import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// 過去帳一覧取得（命日が設定されている世帯員）
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";

  try {
    const records = await prisma.householderMember.findMany({
      where: {
        deathDate: { not: null },
        OR: query
          ? [
              { familyName: { contains: query, mode: "insensitive" } },
              { givenName: { contains: query, mode: "insensitive" } },
              { familyNameKana: { contains: query, mode: "insensitive" } },
              { givenNameKana: { contains: query, mode: "insensitive" } },
              { dharmaName: { contains: query, mode: "insensitive" } },
              { dharmaNameKana: { contains: query, mode: "insensitive" } },
              { householder: { familyName: { contains: query, mode: "insensitive" } } },
              { householder: { householderCode: { contains: query, mode: "insensitive" } } },
            ]
          : undefined,
      },
      include: {
        householder: {
          select: {
            id: true,
            householderCode: true,
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
    return NextResponse.json({ error: (error as Error).message || "エラーが発生しました" }, { status: 500 });
  }
}
