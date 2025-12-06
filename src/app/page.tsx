import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Promotions from "@/components/Promotions";
import BestSellers from "@/components/BestSellers";
import Clearance from "@/components/Clearance";
import SpecialOffers from "@/components/SpecialOffers";
import News from "@/components/News";
import BrandLogos from "@/components/BrandLogos";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Promotions />
      <BestSellers />
      <Clearance />
      <SpecialOffers />
      <News />
      <BrandLogos />
      <Footer />
    </main>
  );
}
