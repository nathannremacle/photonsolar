import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import type { UserRole } from "@prisma/client";

const ROLES: UserRole[] = ["PARTICULIER", "INSTALLATEUR", "REVENDEUR", "AUTRE"];

function isValidRole(v: unknown): v is UserRole | null {
  if (v === null || v === undefined || v === "") return true;
  return typeof v === "string" && ROLES.includes(v as UserRole);
}

/**
 * PATCH /api/admin/users/[id]
 * Update user role. Body: { role: "PARTICULIER" | "INSTALLATEUR" | "REVENDEUR" | "AUTRE" | null }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = requireAdminSession(request);
  if (authErr) return authErr;
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID utilisateur requis" }, { status: 400 });
    }
    const body = await request.json();
    const role = body.role === "" ? null : body.role;
    if (!isValidRole(role)) {
      return NextResponse.json(
        { error: "Rôle invalide. Valeurs acceptées: PARTICULIER, INSTALLATEUR, REVENDEUR, AUTRE" },
        { status: 400 }
      );
    }
    const user = await prisma.user.update({
      where: { id },
      data: { role: role as UserRole | null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    return NextResponse.json({ user });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Admin user update error:", error);
    if (
      /role|column|Unknown column|does not exist|n'existe pas/i.test(errMsg)
    ) {
      return NextResponse.json(
        {
          error:
            "La colonne « role » est absente de la base. Exécutez à la racine du projet : npx prisma db push",
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du rôle", details: errMsg },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete a user (and related accounts, sessions, orders, pricing rules via cascade).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = requireAdminSession(request);
  if (authErr) return authErr;
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID utilisateur requis" }, { status: 400 });
    }
    await prisma.user.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "P2025") {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }
    console.error("Admin user delete error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'utilisateur" },
      { status: 500 }
    );
  }
}
