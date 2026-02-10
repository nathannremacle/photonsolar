import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
      <h1 className="text-6xl font-bold text-gray-300 mb-2">404</h1>
      <p className="text-xl text-gray-600 mb-8 text-center">
        La page que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          <Home className="w-5 h-5" />
          Accueil
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          <Search className="w-5 h-5" />
          Recherche
        </Link>
      </div>
    </main>
  );
}
