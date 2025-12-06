"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Product } from "@/data/products";

interface FilterState {
  brand?: string[];
  warranty?: string[];
  mpptCount?: number[];
  apparentPower?: string[];
  type?: string[];
  hasEthernet?: boolean | null;
  nominalPower?: string[];
  hasWiFi?: boolean | null;
  networkConnection?: string[];
  // Panneaux solaires
  cellType?: string[];
  efficiency?: string[];
  maxPower?: string[];
  // Batteries
  capacity?: string[];
  batteryType?: string[];
  // Pompes à chaleur
  cop?: string[];
  heatingPower?: string[];
}

interface ProductFiltersProps {
  products: Product[];
  category: string;
  onFilterChange: (filteredProducts: Product[]) => void;
}

export default function ProductFilters({ products, category, onFilterChange }: ProductFiltersProps) {
  const { t, language } = useLanguage();
  const [filters, setFilters] = useState<FilterState>({});

  // Extraire les valeurs uniques pour chaque filtre
  const getUniqueValues = (key: keyof Product, transform?: (val: any) => string) => {
    const values = products
      .map(p => p[key])
      .filter((val): val is NonNullable<typeof val> => val !== undefined && val !== null)
      .map(val => transform ? transform(val) : String(val));
    return [...new Set(values)].sort();
  };

  // Extraire les valeurs numériques pour les plages
  const extractNumericValue = (str: string): number => {
    const match = str.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  };

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...products];

    // Filtre par marque
    if (filters.brand && filters.brand.length > 0) {
      filtered = filtered.filter(p => filters.brand!.includes(p.brand));
    }

    // Filtre par garantie
    if (filters.warranty && filters.warranty.length > 0) {
      filtered = filtered.filter(p => {
        if (!p.warranty) return false;
        const warrantyYears = extractNumericValue(p.warranty);
        return filters.warranty!.some(w => {
          const filterYears = extractNumericValue(w);
          return warrantyYears === filterYears;
        });
      });
    }

    // Filtre par type d'onduleur
    if (filters.type && filters.type.length > 0) {
      filtered = filtered.filter(p => p.type && filters.type!.includes(p.type));
    }

    // Filtre par nombre de MPPT
    if (filters.mpptCount && filters.mpptCount.length > 0) {
      filtered = filtered.filter(p => {
        if (p.mpptCount === undefined) return false;
        return filters.mpptCount!.includes(p.mpptCount);
      });
    }

    // Filtre par puissance apparente
    if (filters.apparentPower && filters.apparentPower.length > 0) {
      filtered = filtered.filter(p => {
        if (!p.apparentPower) return false;
        return filters.apparentPower!.includes(p.apparentPower);
      });
    }

    // Filtre par puissance nominale
    if (filters.nominalPower && filters.nominalPower.length > 0) {
      filtered = filtered.filter(p => {
        if (!p.nominalPower) return false;
        return filters.nominalPower!.includes(p.nominalPower);
      });
    }

    // Filtre Ethernet
    if (filters.hasEthernet !== null && filters.hasEthernet !== undefined) {
      filtered = filtered.filter(p => p.hasEthernet === filters.hasEthernet);
    }

    // Filtre Wi-Fi
    if (filters.hasWiFi !== null && filters.hasWiFi !== undefined) {
      filtered = filtered.filter(p => p.hasWiFi === filters.hasWiFi);
    }

    // Filtre raccordement réseau
    if (filters.networkConnection && filters.networkConnection.length > 0) {
      filtered = filtered.filter(p => {
        if (!p.networkConnection) return false;
        return filters.networkConnection!.includes(p.networkConnection);
      });
    }

    // Filtres panneaux solaires
    if (filters.cellType && filters.cellType.length > 0) {
      filtered = filtered.filter(p => p.cellType && filters.cellType!.includes(p.cellType));
    }

    if (filters.efficiency && filters.efficiency.length > 0) {
      filtered = filtered.filter(p => {
        if (!p.efficiency) return false;
        return filters.efficiency!.includes(p.efficiency);
      });
    }

    if (filters.maxPower && filters.maxPower.length > 0) {
      filtered = filtered.filter(p => {
        if (!p.maxPower) return false;
        return filters.maxPower!.includes(p.maxPower);
      });
    }

    // Filtres batteries
    if (filters.capacity && filters.capacity.length > 0) {
      filtered = filtered.filter(p => {
        if (!p.capacity) return false;
        return filters.capacity!.includes(p.capacity);
      });
    }

    if (filters.batteryType && filters.batteryType.length > 0) {
      filtered = filtered.filter(p => p.batteryType && filters.batteryType!.includes(p.batteryType));
    }

    // Filtres pompes à chaleur
    if (filters.cop && filters.cop.length > 0) {
      filtered = filtered.filter(p => {
        if (!p.cop) return false;
        return filters.cop!.includes(p.cop);
      });
    }

    if (filters.heatingPower && filters.heatingPower.length > 0) {
      filtered = filtered.filter(p => {
        if (!p.heatingPower) return false;
        return filters.heatingPower!.includes(p.heatingPower);
      });
    }

    onFilterChange(filtered);
  }, [filters, products, onFilterChange]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof FilterState];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'boolean') return value !== null && value !== undefined;
    return false;
  });

  // Filtres spécifiques selon la catégorie
  const renderFilters = () => {
    if (category === "onduleurs") {
      return (
        <>
          {/* Marque */}
          <FilterSection
            title={language === "fr" ? "Marque" : "Brand"}
            values={getUniqueValues("brand")}
            selected={filters.brand || []}
            onChange={(values) => handleFilterChange("brand", values)}
          />

          {/* Garantie */}
          <FilterSection
            title={language === "fr" ? "Garantie produit (ans)" : "Product Warranty (years)"}
            values={getUniqueValues("warranty")}
            selected={filters.warranty || []}
            onChange={(values) => handleFilterChange("warranty", values)}
          />

          {/* Nombre de MPPT */}
          <FilterSection
            title={language === "fr" ? "Nombre de MPPT" : "MPPT Count"}
            values={getUniqueValues("mpptCount", (val) => String(val))}
            selected={filters.mpptCount?.map(String) || []}
            onChange={(values) => handleFilterChange("mpptCount", values.map(Number))}
          />

          {/* Puissance apparente */}
          <FilterSection
            title={language === "fr" ? "Puissance apparente (kVA)" : "Apparent Power (kVA)"}
            values={getUniqueValues("apparentPower")}
            selected={filters.apparentPower || []}
            onChange={(values) => handleFilterChange("apparentPower", values)}
          />

          {/* Type d'onduleur */}
          <FilterSection
            title={language === "fr" ? "Type d'onduleur" : "Inverter Type"}
            values={getUniqueValues("type")}
            selected={filters.type || []}
            onChange={(values) => handleFilterChange("type", values)}
          />

          {/* Puissance nominale */}
          <FilterSection
            title={language === "fr" ? "Puissance nominale (kW)" : "Nominal Power (kW)"}
            values={getUniqueValues("nominalPower")}
            selected={filters.nominalPower || []}
            onChange={(values) => handleFilterChange("nominalPower", values)}
          />

          {/* Raccordement réseau */}
          <FilterSection
            title={language === "fr" ? "Raccordement réseau" : "Network Connection"}
            values={getUniqueValues("networkConnection")}
            selected={filters.networkConnection || []}
            onChange={(values) => handleFilterChange("networkConnection", values)}
          />

          {/* Ethernet */}
          <BooleanFilter
            title={language === "fr" ? "Ethernet" : "Ethernet"}
            value={filters.hasEthernet}
            onChange={(value) => handleFilterChange("hasEthernet", value)}
          />

          {/* Wi-Fi */}
          <BooleanFilter
            title={language === "fr" ? "Wi-Fi" : "Wi-Fi"}
            value={filters.hasWiFi}
            onChange={(value) => handleFilterChange("hasWiFi", value)}
          />
        </>
      );
    }

    if (category === "panneaux-solaires") {
      return (
        <>
          <FilterSection
            title={language === "fr" ? "Marque" : "Brand"}
            values={getUniqueValues("brand")}
            selected={filters.brand || []}
            onChange={(values) => handleFilterChange("brand", values)}
          />
          <FilterSection
            title={language === "fr" ? "Type de cellule" : "Cell Type"}
            values={getUniqueValues("cellType")}
            selected={filters.cellType || []}
            onChange={(values) => handleFilterChange("cellType", values)}
          />
          <FilterSection
            title={language === "fr" ? "Rendement" : "Efficiency"}
            values={getUniqueValues("efficiency")}
            selected={filters.efficiency || []}
            onChange={(values) => handleFilterChange("efficiency", values)}
          />
          <FilterSection
            title={language === "fr" ? "Puissance max" : "Max Power"}
            values={getUniqueValues("maxPower")}
            selected={filters.maxPower || []}
            onChange={(values) => handleFilterChange("maxPower", values)}
          />
        </>
      );
    }

    if (category === "batteries-stockage") {
      return (
        <>
          <FilterSection
            title={language === "fr" ? "Marque" : "Brand"}
            values={getUniqueValues("brand")}
            selected={filters.brand || []}
            onChange={(values) => handleFilterChange("brand", values)}
          />
          <FilterSection
            title={language === "fr" ? "Capacité (kWh)" : "Capacity (kWh)"}
            values={getUniqueValues("capacity")}
            selected={filters.capacity || []}
            onChange={(values) => handleFilterChange("capacity", values)}
          />
          <FilterSection
            title={language === "fr" ? "Type de batterie" : "Battery Type"}
            values={getUniqueValues("batteryType")}
            selected={filters.batteryType || []}
            onChange={(values) => handleFilterChange("batteryType", values)}
          />
        </>
      );
    }

    if (category === "pompe-chaleur") {
      return (
        <>
          <FilterSection
            title={language === "fr" ? "Marque" : "Brand"}
            values={getUniqueValues("brand")}
            selected={filters.brand || []}
            onChange={(values) => handleFilterChange("brand", values)}
          />
          <FilterSection
            title={language === "fr" ? "COP" : "COP"}
            values={getUniqueValues("cop")}
            selected={filters.cop || []}
            onChange={(values) => handleFilterChange("cop", values)}
          />
          <FilterSection
            title={language === "fr" ? "Puissance de chauffage" : "Heating Power"}
            values={getUniqueValues("heatingPower")}
            selected={filters.heatingPower || []}
            onChange={(values) => handleFilterChange("heatingPower", values)}
          />
        </>
      );
    }

    // Filtres généraux pour les autres catégories
    return (
      <FilterSection
        title={language === "fr" ? "Marque" : "Brand"}
        values={getUniqueValues("brand")}
        selected={filters.brand || []}
        onChange={(values) => handleFilterChange("brand", values)}
      />
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 lg:sticky lg:top-[200px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">
          {language === "fr" ? "Filtres" : "Filters"}
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 transition-colors"
          >
            <X size={16} />
            <span>{language === "fr" ? "Réinitialiser" : "Reset"}</span>
          </button>
        )}
      </div>

      <div className="space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
        {renderFilters()}
      </div>
    </div>
  );
}

// Composant pour les filtres à choix multiples
function FilterSection({
  title,
  values,
  selected,
  onChange,
}: {
  title: string;
  values: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  if (values.length === 0) return null;

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2">
        {values.map((value) => (
          <label key={value} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(value)}
              onChange={() => handleToggle(value)}
              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700">{value}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// Composant pour les filtres booléens (Oui/Non)
function BooleanFilter({
  title,
  value,
  onChange,
}: {
  title: string;
  value: boolean | null | undefined;
  onChange: (value: boolean | null) => void;
}) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={title}
            checked={value === true}
            onChange={() => onChange(value === true ? null : true)}
            className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
          />
          <span className="text-sm text-gray-700">Oui</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={title}
            checked={value === false}
            onChange={() => onChange(value === false ? null : false)}
            className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
          />
          <span className="text-sm text-gray-700">Non</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={title}
            checked={value === null || value === undefined}
            onChange={() => onChange(null)}
            className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
          />
          <span className="text-sm text-gray-700">Tous</span>
        </label>
      </div>
    </div>
  );
}

