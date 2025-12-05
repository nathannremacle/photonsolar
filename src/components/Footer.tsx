import Link from "next/link";
import { Facebook, Instagram, Youtube, Sun } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white pt-20 pb-10 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary-500 p-1.5 rounded-lg">
                <Sun size={20} className="fill-current text-white" />
              </div>
              <span className="text-xl font-bold">Photon<span className="text-primary-500">Solar</span></span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed font-medium">
              Expertise belge en énergie solaire depuis 2008. Nous transformons chaque toiture en source d'énergie durable et rentable.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all duration-300 text-white">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {[
            {
              title: "Solutions",
              links: ["Panneaux Solaires", "Batteries", "Bornes de recharge", "Maintenance"]
            },
            {
              title: "Entreprise",
              links: ["À propos", "Nos réalisations", "Carrières", "Contact"]
            },
            {
              title: "Légal",
              links: ["Mentions légales", "Confidentialité", "Conditions générales", "Cookies"]
            }
          ].map((col, idx) => (
            <div key={idx}>
              <h4 className="font-bold text-lg mb-6 text-white">{col.title}</h4>
              <ul className="space-y-4">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} Photon Solar. Tous droits réservés.
          </p>
          <p className="text-gray-400 text-xs flex items-center gap-2">
            Designed with <span className="text-primary-500">⚡</span> in Belgium
          </p>
        </div>
      </div>
    </footer>
  );
}
