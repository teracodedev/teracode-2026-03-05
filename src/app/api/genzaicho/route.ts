import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// 現在帳一覧取得（命日が未設定の在籍世帯員）
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";

  try {
    const records = await prisma.householderMember.findMany({
      where: {
        deathDate: null,
        householder: { isActive: true },
        OR: query
          ? [
              { familyName: { contains: query, mode: "insensitive" } },
              { givenName: { contains: query, mode: "insensitive" } },
              { familyNameKana: { contains: query, mode: "insensitive" } },
              { givenNameKana: { contains: query, mode: "insensitive" } },
              { relation: { contains: query, mode: "insensitive" } },
              { householder: { familyName: { contains: query, mode: "insensitive" } } },
              { householder: { givenName: { contains: query, mode: "insensitive" } } },
              { householder: { householderCode: { contains: query, mode: "insensitive" } } },
              { householder: { address1: { contains: query, mode: "insensitive" } } },
              { householder: { address2: { contains: query, mode: "insensitive" } } },
              { householder: { address3: { contains: query, mode: "insensitive" } } },
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
            address1: true,
            address2: true,
            address3: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("GET /api/genzaicho error:", error);
    return NextResponse.json({ error: (error as Error).message || "エラーが発生しました" }, { status: 500 });
  }
}
