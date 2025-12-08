"use client";

import { Palette } from 'lucide-react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

const presetColors = [
  { name: "Orange", value: "bg-gradient-to-br from-orange-500 to-orange-600" },
  { name: "Bleu", value: "bg-gradient-to-br from-blue-600 to-blue-700" },
  { name: "Rouge", value: "bg-gradient-to-br from-red-600 to-red-700" },
  { name: "Vert", value: "bg-gradient-to-br from-green-600 to-green-700" },
  { name: "Gris", value: "bg-gradient-to-br from-gray-700 to-gray-800" },
  { name: "Violet", value: "bg-gradient-to-br from-purple-600 to-purple-700" },
  { name: "Rose", value: "bg-gradient-to-br from-pink-600 to-pink-700" },
  { name: "Indigo", value: "bg-gradient-to-br from-indigo-600 to-indigo-700" },
];

export default function ColorPicker({
  value,
  onChange,
  label = "Couleur de fond",
}: ColorPickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {/* Preset Colors */}
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-2">Couleurs prédéfinies :</p>
        <div className="grid grid-cols-4 gap-2">
          {presetColors.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChange(preset.value)}
              className={`h-12 rounded-lg ${preset.value} border-2 transition-all ${
                value === preset.value
                  ? 'border-orange-600 ring-2 ring-orange-200 scale-105'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              title={preset.name}
            />
          ))}
        </div>
      </div>

      {/* Custom Color Input */}
      <div className="relative">
        <Palette className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          placeholder="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Utilisez les classes Tailwind CSS (ex: bg-gradient-to-br from-orange-500 to-orange-600)
      </p>
    </div>
  );
}

