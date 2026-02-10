import { getNewsArticleBySlug } from "@/lib/news-storage";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }>; children: React.ReactNode };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsArticleBySlug(slug);
  if (!article) return { title: "Article non trouvé" };
  const description = (article.excerpt || "").slice(0, 160);
  return {
    title: `${article.title} | Photon Solar`,
    description,
    openGraph: {
      title: article.title,
      description,
      images: article.image ? [{ url: article.image, alt: article.title }] : [],
    },
  };
}

export default async function NewsSlugLayout({ params, children }: Props) {
  const { slug } = await params;
  const article = await getNewsArticleBySlug(slug);
  if (!article) notFound();
  return <>{children}</>;
}
