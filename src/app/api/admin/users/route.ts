import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
/**
 * GET /api/admin/users
 * List all registered users (id, name, email, phoneNumber, companyName, role).
 */
export async function GET(request: NextRequest) {
  const authErr = requireAdminSession(request);
  if (authErr) return authErr;
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        companyName: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      users: users.map((u) => ({ ...u, role: null })),
    });
  } catch (error) {
    console.error("Admin users list error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des utilisateurs" },
      { status: 500 }
    );
  }
}
