import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// 檀家一覧取得
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";
  const activeOnly = searchParams.get("active") !== "false";

  try {
    const dankaList = await prisma.danka.findMany({
      where: {
        isActive: activeOnly ? true : undefined,
        OR: query
          ? [
              { familyName: { contains: query, mode: "insensitive" } },
              { givenName: { contains: query, mode: "insensitive" } },
              { familyNameKana: { contains: query, mode: "insensitive" } },
              { givenNameKana: { contains: query, mode: "insensitive" } },
              { dankaCode: { contains: query, mode: "insensitive" } },
              { address1: { contains: query, mode: "insensitive" } },
              { address2: { contains: query, mode: "insensitive" } },
              { address3: { contains: query, mode: "insensitive" } },
            ]
          : undefined,
      },
      include: {
        members: true,
      },
      orderBy: [{ familyNameKana: "asc" }, { familyName: "asc" }],
    });

    return NextResponse.json(dankaList);
  } catch (error) {
    console.error("GET /api/danka error:", error);
    return NextResponse.json({ error: (error as Error).message || "エラーが発生しました" }, { status: 500 });
  }
}

// 檀家新規登録
export async function POST(request: NextRequest) {
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
      members,
    } = body;

    if (!familyName || !givenName) {
      return NextResponse.json(
        { error: "姓・名は必須です" },
        { status: 400 }
      );
    }

    const danka = await prisma.danka.create({
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
        members: members?.length
          ? {
              create: members.map((m: {
                familyName: string;
                givenName?: string;
                nameKana?: string;
                relation?: string;
                birthDate?: string;
                dharmaName?: string;
                dharmaNameKana?: string;
                note?: string;
              }) => ({
                familyName: m.familyName,
                givenName: m.givenName || null,
                nameKana: m.nameKana || null,
                relation: m.relation || null,
                birthDate: m.birthDate ? new Date(m.birthDate) : null,
                dharmaName: m.dharmaName || null,
                dharmaNameKana: m.dharmaNameKana || null,
                note: m.note || null,
              })),
            }
          : undefined,
      },
      include: { members: true },
    });

    return NextResponse.json(danka, { status: 201 });
  } catch (error) {
    console.error("POST /api/danka error:", error);
    return NextResponse.json({ error: (error as Error).message || "エラーが発生しました" }, { status: 500 });
  }
}
