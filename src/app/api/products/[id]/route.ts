import { NextRequest, NextResponse } from "next/server";
import { getProduct } from "@/lib/products-storage";
import { auth } from "@/auth";
import { getEffectivePrice } from "@/lib/pricing";
import type { UserRole } from "@prisma/client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }
    const product = await getProduct(id);
    if (!product) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }
    const session = await auth();
    const context =
      session?.user?.id || session?.user?.role || session?.user?.companyName
        ? {
            userId: session.user?.id,
            companyName: session.user?.companyName ?? undefined,
            role: session.user?.role as UserRole | undefined,
          }
        : null;
    if (context) {
      const effectivePrice = await getEffectivePrice(
        product.id,
        product.price ?? null,
        context
      );
      return NextResponse.json({
        product: { ...product, effectivePrice: effectivePrice ?? product.price ?? null },
      });
    }
    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error loading product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du produit" },
      { status: 500 }
    );
  }
}
