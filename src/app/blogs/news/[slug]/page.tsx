"use client";

import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { ArrowLeft, Calendar } from "lucide-react";

const articles: Record<string, { title: string; date: string; content: string }> = {
  "wallonia-energy-turning-point": {
    title: "Wallonie : un tournant énergétique décisif – Le rôle d'Ecostal dans cette transformation",
    date: "3 December 2025",
    content: `
      La Wallonie connaît actuellement un tournant énergétique majeur. Face aux défis climatiques et aux objectifs de transition énergétique, la région met en place de nouvelles politiques et technologies pour accélérer le déploiement des énergies renouvelables.

      Dans ce contexte, Ecostal joue un rôle clé en tant que distributeur de solutions solaires de qualité. Notre engagement en faveur de l'énergie solaire contribue directement à cette transformation énergétique.

      Les installations photovoltaïques se multiplient en Wallonie, portées par des incitations gouvernementales et une prise de conscience croissante de l'importance des énergies renouvelables. Ecostal accompagne les installateurs et les particuliers dans cette transition en leur fournissant des équipements performants et fiables.

      L'avenir énergétique de la Wallonie passe par le solaire, et nous sommes fiers d'être un acteur de cette transformation.
    `,
  },
  "vincent-maurice-joins-ecostal": {
    title: "Vincent Maurice rejoint Ecostal pour piloter les activités de Distribution",
    date: "11 September 2025",
    content: `
      Ecostal annonce avec plaisir l'arrivée de Vincent Maurice à la tête de ses activités de distribution. Cette nomination stratégique renforce la position d'Ecostal sur le marché belge de l'énergie solaire.

      Vincent Maurice apporte avec lui une expertise solide dans le domaine de la distribution et une vision claire pour développer les activités d'Ecostal. Son expérience sera un atout majeur pour accompagner la croissance de l'entreprise.

      Cette nomination s'inscrit dans la stratégie d'Ecostal de renforcer sa présence sur le marché belge et d'offrir un service encore plus performant à ses clients et partenaires.

      Nous sommes convaincus que l'arrivée de Vincent Maurice contribuera significativement au développement d'Ecostal et à la promotion de l'énergie solaire en Belgique.
    `,
  },
};

export default function NewsArticlePage() {
  const params = useParams();
  const { language } = useLanguage();
  const slug = params?.slug as string;
  const article = articles[slug];

  if (!article) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {language === "fr" ? "Article non trouvé" : "Article not found"}
            </h1>
            <Link
              href="/blogs/news"
              className="text-primary-600 hover:text-primary-700"
            >
              {language === "fr" ? "← Retour aux actualités" : "← Back to news"}
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blogs/news"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === "fr" ? "Retour aux actualités" : "Back to news"}
          </Link>

          <article className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
              <Calendar className="w-4 h-4" />
              <span>{article.date}</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">{article.title}</h1>
            <div className="prose prose-lg max-w-none">
              {article.content.split("\n").map((paragraph, index) => {
                const trimmed = paragraph.trim();
                if (!trimmed) return null;
                return (
                  <p key={index} className="text-gray-700 mb-4">
                    {trimmed}
                  </p>
                );
              })}
            </div>
          </article>
        </div>
      </div>
      <Footer />
    </main>
  );
}

