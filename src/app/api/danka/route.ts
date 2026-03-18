import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
              { address: { contains: query, mode: "insensitive" } },
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
      address,
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
        address: address || null,
        phone: phone || null,
        email: email || null,
        note: note || null,
        joinedAt: joinedAt ? new Date(joinedAt) : null,
        members: members?.length
          ? {
              create: members.map((m: {
                name: string;
                nameKana?: string;
                relation?: string;
                birthDate?: string;
                dharmaName?: string;
                note?: string;
              }) => ({
                name: m.name,
                nameKana: m.nameKana || null,
                relation: m.relation || null,
                birthDate: m.birthDate ? new Date(m.birthDate) : null,
                dharmaName: m.dharmaName || null,
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
