import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getProductById } from "@/data/products";

/**
 * GET /api/user/profile
 * 
 * Get complete user profile including orders
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Get user with orders
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        companyName: true,
        createdAt: true,
        emailVerified: true,
        image: true,
        orders: {
          orderBy: { createdAt: "desc" },
          include: {
            items: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Enrich order items with product data
    const ordersWithProducts = user.orders.map((order) => ({
      ...order,
      items: order.items.map((item) => {
        const product = getProductById(item.productId);
        return {
          ...item,
          product: product
            ? {
                id: product.id,
                name: product.name,
                brand: product.brand,
                image: product.images?.[0] || product.image,
              }
            : null,
        };
      }),
    }));

    // Calculate stats
    const stats = {
      totalOrders: user.orders.length,
      pendingOrders: user.orders.filter((o) => o.status === "PENDING").length,
      completedOrders: user.orders.filter((o) => o.status === "COMPLETED").length,
      cancelledOrders: user.orders.filter((o) => o.status === "CANCELLED").length,
      totalSpent: user.orders
        .filter((o) => o.status === "COMPLETED")
        .reduce((sum, o) => sum + o.total, 0),
    };

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        companyName: user.companyName,
        createdAt: user.createdAt,
        emailVerified: user.emailVerified,
        image: user.image,
      },
      orders: ordersWithProducts,
      stats,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du profil" },
      { status: 500 }
    );
  }
}

