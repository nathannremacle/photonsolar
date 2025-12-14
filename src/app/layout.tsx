import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";
import Cart from "@/components/Cart";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PhotonSolar",
  description: "Photon Solar, expert en énergie solaire en Belgique depuis 2008. Installation photovoltaïque, batteries, bornes de recharge. Expertise locale, matériel de qualité.",
  keywords: "panneaux solaires, photovoltaïque, énergie solaire, Belgique, installation solaire, batteries solaires, bornes de recharge",
  authors: [{ name: "Photon Solar" }],
  openGraph: {
    title: "Photon Solar - L'énergie solaire pour votre avenir",
    description: "Expert en énergie solaire en Belgique depuis 2008",
    type: "website",
    locale: "fr_BE",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${inter.variable} antialiased`}
      >
        <ClientProviders>
          {children}
          <Cart />
        </ClientProviders>
      </body>
    </html>
  );
}
