import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";

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
