"use client";

import { useState, useRef, useEffect } from 'react';
import { Link as LinkIcon, ExternalLink } from 'lucide-react';

interface LinkSelectorProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

const commonLinks = [
  { label: "Page d'accueil", value: "/" },
  { label: "Catalogue complet", value: "/collections" },
  { label: "Contact", value: "/contact" },
  { label: "Téléchargements", value: "/telechargements" },
  { label: "News", value: "/blogs/news" },
  { label: "À propos", value: "/pages/a-propos" },
  { label: "Promotions", value: "/promo" },
  { label: "Onduleurs", value: "/collections?categories=onduleurs" },
  { label: "Panneaux solaires", value: "/collections?categories=panneaux-solaires" },
  { label: "Batteries", value: "/collections?categories=batteries-stockage" },
];

export default function LinkSelector({
  value,
  onChange,
  label = "Lien",
}: LinkSelectorProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSuggestions]);

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            placeholder="/collections, /contact, etc."
          />
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            title="Liens rapides"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>
        
        {showSuggestions && (
          <>
            {/* Backdrop to close on outside click */}
            <div 
              className="fixed inset-0 z-[9998]" 
              onClick={() => setShowSuggestions(false)}
            />
            {/* Dropdown with very high z-index - using fixed positioning to escape any overflow constraints */}
            <div 
              ref={dropdownRef}
              className="fixed z-[9999] bg-white border-2 border-gray-300 rounded-lg shadow-2xl max-h-60 overflow-y-auto"
              style={{
                top: containerRef.current ? 
                  `${containerRef.current.getBoundingClientRect().bottom + 4}px` : 
                  'auto',
                left: containerRef.current ? 
                  `${containerRef.current.getBoundingClientRect().left}px` : 
                  'auto',
                width: containerRef.current ? 
                  `${containerRef.current.getBoundingClientRect().width}px` : 
                  '100%',
              }}
            >
              <div className="p-2">
                <p className="text-xs font-semibold text-gray-500 px-2 py-1 mb-1">Liens rapides :</p>
                {commonLinks.map((link) => (
                  <button
                    key={link.value}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onChange(link.value);
                      setShowSuggestions(false);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-orange-50 rounded-lg transition-colors flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-700">{link.label}</span>
                    <span className="text-xs text-gray-400 font-mono">{link.value}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      {value && (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1"
        >
          <ExternalLink className="w-3 h-3" />
          Tester le lien
        </a>
      )}
    </div>
  );
}

