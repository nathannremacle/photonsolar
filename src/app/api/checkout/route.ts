import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getProductById } from "@/data/products";

/**
 * POST /api/checkout
 * 
 * Create an order from cart items
 * - Verifies user is authenticated
 * - Creates Order and OrderItem records
 * - Returns order details
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Vous devez être connecté pour passer une commande.",
          requiresAuth: true,
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { items } = body;

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          error: "Le panier est vide.",
        },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          {
            error: "Données de panier invalides.",
          },
          { status: 400 }
        );
      }

      // Verify product exists
      const product = getProductById(item.productId);
      if (!product) {
        return NextResponse.json(
          {
            error: `Le produit ${item.productId} n'existe pas.`,
          },
          { status: 400 }
        );
      }

      // Verify product has a price
      if (!product.price) {
        return NextResponse.json(
          {
            error: `Le produit ${product.name} n'a pas de prix défini.`,
          },
          { status: 400 }
        );
      }
    }

    // Calculate total
    const total = items.reduce((sum: number, item: any) => {
      const product = getProductById(item.productId);
      const price = product?.price || 0;
      return sum + price * item.quantity;
    }, 0);

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        status: "PENDING",
        total: total,
        items: {
          create: items.map((item: any) => {
            const product = getProductById(item.productId);
            const price = product?.price || 0;
            return {
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: price,
            };
          }),
        },
      },
      include: {
        items: true,
      },
    });

    // Return order without sensitive data
    return NextResponse.json(
      {
        success: true,
        order: {
          id: order.id,
          status: order.status,
          total: order.total,
          createdAt: order.createdAt,
          items: order.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Checkout error:", error);

    // Handle Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          {
            error: "Erreur lors de la création de la commande. L'utilisateur n'existe pas.",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Une erreur est survenue lors de la validation de la commande. Veuillez réessayer.",
      },
      { status: 500 }
    );
  }
}

