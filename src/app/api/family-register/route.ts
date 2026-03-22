import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/require-auth";

export const runtime = "nodejs";

export async function GET() {
  const unauth = await requireAuth();
  if (unauth) return unauth;

  const registers = await prisma.familyRegister.findMany({
    include: {
      householders: {
        select: { id: true, familyName: true, givenName: true, isActive: true, _count: { select: { members: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(registers);
}

export async function POST(req: NextRequest) {
  const unauth = await requireAuth();
  if (unauth) return unauth;

  const { name, note } = await req.json();
  if (!name) return NextResponse.json({ error: "台帳名は必須です" }, { status: 400 });

  const register = await prisma.familyRegister.create({ data: { name, note: note || null } });
  return NextResponse.json(register, { status: 201 });
}
