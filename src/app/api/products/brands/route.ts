import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/products/brands
 * Returns distinct product brand names (for admin: associate logo with a product brand).
 */
export async function GET() {
  try {
    const rows = await prisma.product.groupBy({
      by: ["brand"],
      orderBy: { brand: "asc" },
    });
    const brands = rows.map((r) => r.brand).filter(Boolean);
    return NextResponse.json({ brands });
  } catch (error) {
    console.error("Products brands error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des marques" },
      { status: 500 }
    );
  }
}
