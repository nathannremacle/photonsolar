"use client";

import { Tag } from 'lucide-react';

interface CategorySelectorProps {
  value: string;
  onChange: (category: string) => void;
  label?: string;
}

const newsCategories = [
  "News",
  "Promotion",
  "Événement",
  "Nouveauté",
  "Formation",
  "Actualité",
];

export default function CategorySelector({
  value,
  onChange,
  label = "Catégorie",
}: CategorySelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {newsCategories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              value === category
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Tag className="w-3 h-3" />
            {category}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
        placeholder="Ou saisir une catégorie personnalisée"
      />
    </div>
  );
}

