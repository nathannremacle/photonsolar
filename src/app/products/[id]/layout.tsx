import { getProduct } from "@/lib/products-storage";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Produit non trouvé" };
  const description = (product.description || product.name || "").slice(0, 160);
  const image = product.image || product.images?.[0];
  return {
    title: `${product.name} | Photon Solar`,
    description,
    openGraph: {
      title: product.name,
      description,
      images: image ? [{ url: image, alt: product.name }] : [],
    },
  };
}

export default async function ProductLayout({ params, children }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  return <>{children}</>;
}
