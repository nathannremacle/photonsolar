import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth-server";

/**
 * DELETE /api/admin/orders/[id]
 * Delete an order and its items (cascade).
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
      return NextResponse.json({ error: "ID de commande requis" }, { status: 400 });
    }

    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json(
        { error: "Commande introuvable" },
        { status: 404 }
      );
    }
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la commande" },
      { status: 500 }
    );
  }
}
