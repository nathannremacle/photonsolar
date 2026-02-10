import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";
import type { PricingScope, PricingType } from "@prisma/client";
import type { UserRole } from "@prisma/client";

/**
 * GET /api/admin/pricing
 * List all pricing rules with product names and target labels.
 */
export async function GET(request: NextRequest) {
  const authErr = requireAdminSession(request);
  if (authErr) return authErr;
  try {
    const rules = await prisma.pricingRule.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: [{ scope: "asc" }, { productId: "asc" }],
    });
    const productIds = [...new Set(rules.map((r) => r.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true },
    });
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
    const list = rules.map((r) => ({
      id: r.id,
      scope: r.scope,
      role: r.role,
      userId: r.userId,
      companyName: r.companyName,
      productId: r.productId,
      productName: productMap[r.productId]?.name ?? r.productId,
      productPrice: productMap[r.productId]?.price ?? null,
      type: r.type,
      value: r.value,
      createdAt: r.createdAt,
      user: r.user
        ? { id: r.user.id, name: r.user.name, email: r.user.email }
        : null,
    }));
    return NextResponse.json({ rules: list });
  } catch (error) {
    console.error("Admin pricing list error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des règles de tarification" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/pricing
 * Create a pricing rule. Body: { scope, role?, userId?, companyName?, productId, type, value }
 */
export async function POST(request: NextRequest) {
  const authErr = requireAdminSession(request);
  if (authErr) return authErr;
  try {
    const body = await request.json();
    const scope = body.scope as PricingScope | undefined;
    const role = body.role || null;
    const userId = body.userId || null;
    const companyName = body.companyName?.trim() || null;
    const productId = body.productId as string | undefined;
    const type = body.type as PricingType | undefined;
    const value = typeof body.value === "number" ? body.value : parseFloat(body.value);

    if (!scope || !["ROLE", "USER", "COMPANY"].includes(scope)) {
      return NextResponse.json(
        { error: "Scope invalide. Valeurs: ROLE, USER, COMPANY" },
        { status: 400 }
      );
    }
    if (!productId || typeof productId !== "string") {
      return NextResponse.json({ error: "productId requis" }, { status: 400 });
    }
    if (!type || !["PERCENT_DISCOUNT", "FIXED_PRICE"].includes(type)) {
      return NextResponse.json(
        { error: "Type invalide. Valeurs: PERCENT_DISCOUNT, FIXED_PRICE" },
        { status: 400 }
      );
    }
    if (typeof value !== "number" || isNaN(value) || value < 0) {
      return NextResponse.json({ error: "value doit être un nombre >= 0" }, { status: 400 });
    }
    if (type === "PERCENT_DISCOUNT" && value > 100) {
      return NextResponse.json(
        { error: "Pour une réduction en %, la valeur doit être entre 0 et 100" },
        { status: 400 }
      );
    }

    if (scope === "ROLE") {
      const roles: UserRole[] = ["PARTICULIER", "INSTALLATEUR", "REVENDEUR", "AUTRE"];
      if (!role || !roles.includes(role as UserRole)) {
        return NextResponse.json(
          { error: "Pour scope ROLE, role requis: PARTICULIER, INSTALLATEUR, REVENDEUR, AUTRE" },
          { status: 400 }
        );
      }
    }
    if (scope === "USER" && !userId) {
      return NextResponse.json({ error: "Pour scope USER, userId requis" }, { status: 400 });
    }
    if (scope === "COMPANY" && !companyName) {
      return NextResponse.json(
        { error: "Pour scope COMPANY, companyName requis" },
        { status: 400 }
      );
    }

    const rule = await prisma.pricingRule.create({
      data: {
        scope,
        role: scope === "ROLE" ? (role as UserRole) : null,
        userId: scope === "USER" ? userId : null,
        companyName: scope === "COMPANY" ? companyName : null,
        productId,
        type,
        value,
      },
    });
    return NextResponse.json({ rule }, { status: 201 });
  } catch (error: unknown) {
    const e = error as { code?: string };
    if (e?.code === "P2002") {
      return NextResponse.json(
        {
          error:
            "Une règle existe déjà pour ce produit et cette cible (rôle/utilisateur/entreprise). Modifiez ou supprimez la règle existante.",
        },
        { status: 409 }
      );
    }
    console.error("Admin pricing create error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la règle" },
      { status: 500 }
    );
  }
}
