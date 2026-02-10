import { NextRequest, NextResponse } from "next/server";
import { getProduct } from "@/lib/products-storage";

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
    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error loading product:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du produit" },
      { status: 500 }
    );
  }
}
