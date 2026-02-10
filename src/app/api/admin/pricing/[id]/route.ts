import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import type { PricingScope, PricingType, UserRole } from "@prisma/client";

/**
 * PATCH /api/admin/pricing/[id]
 * Update a pricing rule. Body: { scope?, role?, userId?, companyName?, productId?, type?, value? }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authErr = requireAdminSession(request);
  if (authErr) return authErr;
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "ID requis" }, { status: 400 });
    const body = await request.json();
    const scope = body.scope as PricingScope | undefined;
    const role = body.role !== undefined ? (body.role || null) : undefined;
    const userId = body.userId !== undefined ? (body.userId || null) : undefined;
    const companyName = body.companyName !== undefined ? (body.companyName?.trim() || null) : undefined;
    const productId = body.productId as string | undefined;
    const type = body.type as PricingType | undefined;
    const value = body.value !== undefined ? (typeof body.value === "number" ? body.value : parseFloat(body.value)) : undefined;

    if (scope && !["ROLE", "USER", "COMPANY"].includes(scope)) {
      return NextResponse.json({ error: "Scope invalide" }, { status: 400 });
    }
    if (type && !["PERCENT_DISCOUNT", "FIXED_PRICE"].includes(type)) {
      return NextResponse.json({ error: "Type invalide" }, { status: 400 });
    }
    if (value !== undefined && (typeof value !== "number" || isNaN(value) || value < 0)) {
      return NextResponse.json({ error: "value invalide" }, { status: 400 });
    }
    if (type === "PERCENT_DISCOUNT" && value !== undefined && value > 100) {
      return NextResponse.json({ error: "Réduction % entre 0 et 100" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (scope !== undefined) {
      data.scope = scope;
      data.role = scope === "ROLE" ? (role ?? null) : null;
      data.userId = scope === "USER" ? (userId ?? null) : null;
      data.companyName = scope === "COMPANY" ? (companyName ?? null) : null;
    } else {
      if (role !== undefined) data.role = role as UserRole | null;
      if (userId !== undefined) data.userId = userId;
      if (companyName !== undefined) data.companyName = companyName;
    }
    if (productId !== undefined) data.productId = productId;
    if (type !== undefined) data.type = type;
    if (value !== undefined) data.value = value;

    const rule = await prisma.pricingRule.update({
      where: { id },
      data: data as Parameters<typeof prisma.pricingRule.update>[0]["data"],
    });
    return NextResponse.json({ rule });
  } catch (error: unknown) {
    const e = error as { code?: string };
    if (e?.code === "P2025") return NextResponse.json({ error: "Règle non trouvée" }, { status: 404 });
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Une règle existe déjà pour ce produit et cette cible." }, { status: 409 });
    }
    console.error("Admin pricing update error:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/pricing/[id]
 * Delete a pricing rule.
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
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }
    await prisma.pricingRule.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const e = error as { code?: string };
    if (e?.code === "P2025") {
      return NextResponse.json({ error: "Règle non trouvée" }, { status: 404 });
    }
    console.error("Admin pricing delete error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
