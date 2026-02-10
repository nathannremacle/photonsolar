import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

export type PricingContext = {
  userId?: string;
  companyName?: string | null;
  role?: UserRole | null;
};

/**
 * Get the effective price for a product given base price and optional user/role/company context.
 * Priority: user-specific > company-specific > role-specific > base price.
 */
export async function getEffectivePrice(
  productId: string,
  basePrice: number | null | undefined,
  context: PricingContext
): Promise<number | null> {
  if (basePrice == null || basePrice <= 0) return null;

  const { userId, companyName, role } = context;
  if (!userId && !companyName && !role) return basePrice;

  // Fetch applicable rules (user first, then company, then role)
  const rules = await prisma.pricingRule.findMany({
    where: {
      productId,
      OR: [
        ...(userId ? [{ scope: "USER" as const, userId }] : []),
        ...(companyName ? [{ scope: "COMPANY" as const, companyName }] : []),
        ...(role ? [{ scope: "ROLE" as const, role }] : []),
      ],
    },
    orderBy: [
      // USER first, then COMPANY, then ROLE
      { scope: "asc" },
    ],
  });

  // Prefer USER over COMPANY over ROLE (manual order)
  const userRule = rules.find((r) => r.scope === "USER");
  const companyRule = rules.find((r) => r.scope === "COMPANY");
  const roleRule = rules.find((r) => r.scope === "ROLE");
  const rule = userRule ?? companyRule ?? roleRule ?? null;

  if (!rule) return basePrice;

  if (rule.type === "FIXED_PRICE") {
    return Math.max(0, rule.value);
  }
  // PERCENT_DISCOUNT
  const discount = Math.min(100, Math.max(0, rule.value)) / 100;
  return Math.round((basePrice * (1 - discount)) * 100) / 100;
}

/**
 * Apply effective prices to a list of products (batch, single query).
 */
export async function getEffectivePricesForProducts(
  products: Array<{ id: string; price?: number | null }>,
  context: PricingContext
): Promise<Map<string, number | null>> {
  const result = new Map<string, number | null>();
  if (!context.userId && !context.companyName && !context.role) {
    products.forEach((p) => result.set(p.id, p.price ?? null));
    return result;
  }
  const productIds = products.map((p) => p.id);
  const baseMap = new Map(products.map((p) => [p.id, p.price ?? null]));

  const rules = await prisma.pricingRule.findMany({
    where: {
      productId: { in: productIds },
      OR: [
        ...(context.userId ? [{ scope: "USER" as const, userId: context.userId }] : []),
        ...(context.companyName
          ? [{ scope: "COMPANY" as const, companyName: context.companyName }]
          : []),
        ...(context.role ? [{ scope: "ROLE" as const, role: context.role }] : []),
      ],
    },
  });

  for (const p of products) {
    const base = baseMap.get(p.id) ?? null;
    if (base == null || base <= 0) {
      result.set(p.id, null);
      continue;
    }
    const userRule = rules.find((r) => r.scope === "USER" && r.productId === p.id);
    const companyRule = rules.find((r) => r.scope === "COMPANY" && r.productId === p.id);
    const roleRule = rules.find((r) => r.scope === "ROLE" && r.productId === p.id);
    const rule = userRule ?? companyRule ?? roleRule ?? null;
    if (!rule) {
      result.set(p.id, base);
      continue;
    }
    if (rule.type === "FIXED_PRICE") {
      result.set(p.id, Math.max(0, rule.value));
    } else {
      const discount = Math.min(100, Math.max(0, rule.value)) / 100;
      result.set(p.id, Math.round(base * (1 - discount) * 100) / 100);
    }
  }
  return result;
}
