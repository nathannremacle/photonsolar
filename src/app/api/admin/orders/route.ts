import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProductById } from "@/data/products";

/**
 * GET /api/admin/orders
 * 
 * Get all orders with user information
 */
export async function GET(request: NextRequest) {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            companyName: true,
          },
        },
        items: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Enrich items with product information
    const enrichedOrders = orders.map((order) => ({
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
                image: product.image || product.images?.[0],
              }
            : null,
        };
      }),
    }));

    return NextResponse.json({ orders: enrichedOrders });
  } catch (error) {
    console.error("Error loading orders:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des commandes",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/orders
 * 
 * Update order status
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        {
          error: "orderId et status sont requis",
        },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["PENDING", "COMPLETED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: `Le statut doit être l'un des suivants: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            companyName: true,
          },
        },
        items: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    // Enrich items with product information
    const enrichedOrder = {
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
                image: product.image || product.images?.[0],
              }
            : null,
        };
      }),
    };

    return NextResponse.json({ order: enrichedOrder });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la mise à jour de la commande",
      },
      { status: 500 }
    );
  }
}

