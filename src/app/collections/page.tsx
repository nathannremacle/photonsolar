"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductGrid from "@/components/ProductGrid";
import { products, type Product } from "@/data/products";
import { useLanguage } from "@/contexts/LanguageContext";
import { Search, Filter, X, ChevronDown, SlidersHorizontal, ChevronUp } from "lucide-react";

// Collapsible Filter Section Component
function FilterSection({
  title,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-600" />
        )}
      </button>
      {isExpanded && (
        <div className="p-4 space-y-4 bg-white border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
}

function CatalogContent() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const [allProducts] = useState<Product[]>(products);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>("name");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    general: true,
    onduleurs: false,
    panneaux: false,
    batteries: false,
    pompes: false,
  });

  // Initialize filters from URL params
  useEffect(() => {
    const brandsParam = searchParams.get("brands");
    const categoriesParam = searchParams.get("categories");
    
    if (brandsParam || categoriesParam) {
      setFilters(prev => ({
        ...prev,
        brands: brandsParam ? [brandsParam] : prev.brands,
        categories: categoriesParam ? categoriesParam.split(",") : prev.categories,
      }));
      // Expand general section if filters are set
      if (brandsParam || categoriesParam) {
        setExpandedSections(prev => ({ ...prev, general: true }));
      }
    }
  }, [searchParams]);

  // Calculate max price from products
  const maxPrice = Math.max(...products.map(p => p.price || 0), 10000);

  // Filters state
  const [filters, setFilters] = useState({
    categories: [] as string[],
    brands: [] as string[],
    priceRange: { min: 0, max: maxPrice },
    warranty: [] as string[],
    hasPrice: null as boolean | null,
    // Onduleurs
    mpptCount: [] as number[],
    type: [] as string[],
    hasEthernet: null as boolean | null,
    hasWiFi: null as boolean | null,
    apparentPower: [] as string[],
    nominalPower: [] as string[],
    networkConnection: [] as string[],
    voltage: [] as string[],
    // Panneaux solaires
    cellType: [] as string[],
    efficiency: [] as string[],
    maxPower: [] as string[],
    // Batteries
    capacity: [] as string[],
    batteryType: [] as string[],
    // Pompes à chaleur
    cop: [] as string[],
    heatingPower: [] as string[],
    // Général
    power: [] as string[],
  });

  // Get unique values for filters
  const categories = [...new Set(products.map(p => p.category))].sort();
  const brands = [...new Set(products.map(p => p.brand).filter((p): p is string => Boolean(p)))].sort();
  const warranties = [...new Set(products.map(p => p.warranty).filter((p): p is string => Boolean(p)))].sort();
  const types = [...new Set(products.map(p => p.type).filter((p): p is string => Boolean(p)))].sort();
  const mpptCounts = [...new Set(products.map(p => p.mpptCount).filter((v): v is number => v !== undefined))].sort((a, b) => a - b);
  const cellTypes = [...new Set(products.map(p => p.cellType).filter((p): p is string => Boolean(p)))].sort();
  const efficiencies = [...new Set(products.map(p => p.efficiency).filter((p): p is string => Boolean(p)))].sort();
  const maxPowers = [...new Set(products.map(p => p.maxPower).filter((p): p is string => Boolean(p)))].sort();
  const capacities = [...new Set(products.map(p => p.capacity).filter((p): p is string => Boolean(p)))].sort();
  const batteryTypes = [...new Set(products.map(p => p.batteryType).filter((p): p is string => Boolean(p)))].sort();
  const cops = [...new Set(products.map(p => p.cop).filter((p): p is string => Boolean(p)))].sort();
  const heatingPowers = [...new Set(products.map(p => p.heatingPower).filter((p): p is string => Boolean(p)))].sort();
  const apparentPowers = [...new Set(products.map(p => p.apparentPower).filter((p): p is string => Boolean(p)))].sort();
  const nominalPowers = [...new Set(products.map(p => p.nominalPower).filter((p): p is string => Boolean(p)))].sort();
  const networkConnections = [...new Set(products.map(p => p.networkConnection).filter((p): p is string => Boolean(p)))].sort();
  const voltages = [...new Set(products.map(p => p.voltage).filter((p): p is string => Boolean(p)))].sort();
  const powers = [...new Set(products.map(p => p.power).filter((p): p is string => Boolean(p)))].sort();

  // Apply filters and search
  useEffect(() => {
    let filtered = [...allProducts];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(term) ||
        p.brand?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.sku?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(p => filters.categories.includes(p.category));
    }

    // Brand filter
    if (filters.brands.length > 0) {
      filtered = filtered.filter(p => p.brand && filters.brands.includes(p.brand));
    }

    // Price filter
    if (filters.priceRange.min > 0 || filters.priceRange.max < maxPrice) {
      filtered = filtered.filter(p => {
        if (!p.price) return filters.hasPrice === false;
        return p.price >= filters.priceRange.min && p.price <= filters.priceRange.max;
      });
    }

    // Warranty filter
    if (filters.warranty.length > 0) {
      filtered = filtered.filter(p => p.warranty && filters.warranty.includes(p.warranty));
    }

    // Has price filter
    if (filters.hasPrice !== null) {
      if (filters.hasPrice) {
        filtered = filtered.filter(p => p.price !== undefined && p.price > 0);
      } else {
        filtered = filtered.filter(p => !p.price || p.price === 0);
      }
    }

    // Onduleurs filters
    if (filters.mpptCount.length > 0) {
      filtered = filtered.filter(p => p.mpptCount !== undefined && filters.mpptCount.includes(p.mpptCount));
    }
    if (filters.type.length > 0) {
      filtered = filtered.filter(p => p.type && filters.type.includes(p.type));
    }
    if (filters.hasEthernet !== null) {
      filtered = filtered.filter(p => p.hasEthernet === filters.hasEthernet);
    }
    if (filters.hasWiFi !== null) {
      filtered = filtered.filter(p => p.hasWiFi === filters.hasWiFi);
    }
    if (filters.apparentPower.length > 0) {
      filtered = filtered.filter(p => p.apparentPower && filters.apparentPower.includes(p.apparentPower));
    }
    if (filters.nominalPower.length > 0) {
      filtered = filtered.filter(p => p.nominalPower && filters.nominalPower.includes(p.nominalPower));
    }
    if (filters.networkConnection.length > 0) {
      filtered = filtered.filter(p => p.networkConnection && filters.networkConnection.includes(p.networkConnection));
    }
    if (filters.voltage.length > 0) {
      filtered = filtered.filter(p => p.voltage && filters.voltage.includes(p.voltage));
    }
    if (filters.power.length > 0) {
      filtered = filtered.filter(p => p.power && filters.power.includes(p.power));
    }

    // Panneaux solaires filters
    if (filters.cellType.length > 0) {
      filtered = filtered.filter(p => p.cellType && filters.cellType.includes(p.cellType));
    }
    if (filters.efficiency.length > 0) {
      filtered = filtered.filter(p => p.efficiency && filters.efficiency.includes(p.efficiency));
    }
    if (filters.maxPower.length > 0) {
      filtered = filtered.filter(p => p.maxPower && filters.maxPower.includes(p.maxPower));
    }

    // Batteries filters
    if (filters.capacity.length > 0) {
      filtered = filtered.filter(p => p.capacity && filters.capacity.includes(p.capacity));
    }
    if (filters.batteryType.length > 0) {
      filtered = filtered.filter(p => p.batteryType && filters.batteryType.includes(p.batteryType));
    }

    // Pompes à chaleur filters
    if (filters.cop.length > 0) {
      filtered = filtered.filter(p => p.cop && filters.cop.includes(p.cop));
    }
    if (filters.heatingPower.length > 0) {
      filtered = filtered.filter(p => p.heatingPower && filters.heatingPower.includes(p.heatingPower));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "price-asc":
          return (a.price || 0) - (b.price || 0);
        case "price-desc":
          return (b.price || 0) - (a.price || 0);
        case "brand":
          return (a.brand || "").localeCompare(b.brand || "");
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [searchTerm, filters, sortBy, allProducts, maxPrice]);

  const toggleCategory = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  };

  const toggleBrand = (brand: string) => {
    setFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand],
    }));
  };

  const toggleWarranty = (warranty: string) => {
    setFilters(prev => ({
      ...prev,
      warranty: prev.warranty.includes(warranty)
        ? prev.warranty.filter(w => w !== warranty)
        : [...prev.warranty, warranty],
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      brands: [],
      priceRange: { min: 0, max: maxPrice },
      warranty: [],
      hasPrice: null,
      mpptCount: [],
      type: [],
      hasEthernet: null,
      hasWiFi: null,
      apparentPower: [],
      nominalPower: [],
      networkConnection: [],
      voltage: [],
      cellType: [],
      efficiency: [],
      maxPower: [],
      capacity: [],
      batteryType: [],
      cop: [],
      heatingPower: [],
      power: [],
    });
    setSearchTerm("");
  };

  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.brands.length > 0 ||
    filters.priceRange.min > 0 ||
    filters.priceRange.max < maxPrice ||
    filters.warranty.length > 0 ||
    filters.hasPrice !== null ||
    filters.mpptCount.length > 0 ||
    filters.type.length > 0 ||
    filters.hasEthernet !== null ||
    filters.hasWiFi !== null ||
    filters.cellType.length > 0 ||
    filters.efficiency.length > 0 ||
    filters.maxPower.length > 0 ||
    filters.capacity.length > 0 ||
    filters.batteryType.length > 0 ||
    filters.cop.length > 0 ||
    filters.heatingPower.length > 0 ||
    filters.apparentPower.length > 0 ||
    filters.nominalPower.length > 0 ||
    filters.networkConnection.length > 0 ||
    filters.voltage.length > 0 ||
    filters.power.length > 0 ||
    searchTerm.trim().length > 0;

  const categoryNames: Record<string, { fr: string; en: string }> = {
    "onduleurs": { fr: "Onduleurs", en: "Inverters" },
    "panneaux-solaires": { fr: "Panneaux Solaires", en: "Solar Panels" },
    "batteries-stockage": { fr: "Batteries & Stockage", en: "Batteries & Storage" },
    "structure-montage": { fr: "Structure de Montage", en: "Mounting Structure" },
    "borne-recharge": { fr: "Borne de Recharge", en: "Charging Station" },
    "pompe-chaleur": { fr: "Pompe à Chaleur", en: "Heat Pump" },
    "batterie-plug-play": { fr: "Batterie Plug & Play", en: "Plug & Play Battery" },
    "poeles-cheminee": { fr: "Poêles & Cheminée", en: "Stoves & Fireplace" },
    "climatiseur": { fr: "Climatiseur", en: "Air Conditioner" },
  };

  // Helper function to render checkbox filter
  const renderCheckboxFilter = (
    title: string,
    values: string[],
    selected: string[],
    onChange: (value: string) => void
  ) => {
    if (values.length === 0) return null;
    return (
      <div>
        <h4 className="font-medium text-gray-800 mb-2 text-sm">{title}</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {values.map((value) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors">
              <input
                type="checkbox"
                checked={selected.includes(value)}
                onChange={() => onChange(value)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">{value}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  // Helper function to render radio filter (Yes/No/All)
  const renderRadioFilter = (
    title: string,
    value: boolean | null,
    onChange: (value: boolean | null) => void
  ) => {
    return (
      <div>
        <h4 className="font-medium text-gray-800 mb-2 text-sm">{title}</h4>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={title}
              checked={value === true}
              onChange={() => onChange(value === true ? null : true)}
              className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">{language === "fr" ? "Oui" : "Yes"}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={title}
              checked={value === false}
              onChange={() => onChange(value === false ? null : false)}
              className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">{language === "fr" ? "Non" : "No"}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name={title}
              checked={value === null}
              onChange={() => onChange(null)}
              className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">{language === "fr" ? "Tous" : "All"}</span>
          </label>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {language === "fr" ? "Catalogue Complet" : "Complete Catalog"}
            </h1>
            <p className="text-gray-600">
              {filteredProducts.length} {language === "fr" ? "produit(s) trouvé(s)" : "product(s) found"}
            </p>
          </div>

          {/* Search and Sort Bar */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={language === "fr" ? "Rechercher un produit..." : "Search for a product..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 whitespace-nowrap">
                {language === "fr" ? "Trier par:" : "Sort by:"}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="name">{language === "fr" ? "Nom (A-Z)" : "Name (A-Z)"}</option>
                <option value="price-asc">{language === "fr" ? "Prix (Croissant)" : "Price (Low to High)"}</option>
                <option value="price-desc">{language === "fr" ? "Prix (Décroissant)" : "Price (High to Low)"}</option>
                <option value="brand">{language === "fr" ? "Marque" : "Brand"}</option>
              </select>
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <SlidersHorizontal size={20} />
              {language === "fr" ? "Filtres" : "Filters"}
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className={`w-full lg:w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white border border-gray-200 rounded-lg lg:sticky lg:top-[100px] flex flex-col max-h-[calc(100vh-120px)]">
                {/* Header - Fixed */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0 bg-white">
                  <h2 className="text-lg font-bold text-gray-900">
                    {language === "fr" ? "Filtres" : "Filters"}
                  </h2>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      <X size={16} />
                      <span className="hidden sm:inline">{language === "fr" ? "Réinitialiser" : "Reset"}</span>
                    </button>
                  )}
                </div>

                {/* Filters Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-3">
                    {/* General Filters */}
                    <FilterSection
                      title={language === "fr" ? "Filtres généraux" : "General Filters"}
                      isExpanded={expandedSections.general}
                      onToggle={() => setExpandedSections(prev => ({ ...prev, general: !prev.general }))}
                    >
                      {renderCheckboxFilter(
                        language === "fr" ? "Catégories" : "Categories",
                        categories,
                        filters.categories,
                        toggleCategory
                      )}
                      {renderCheckboxFilter(
                        language === "fr" ? "Marques" : "Brands",
                        brands,
                        filters.brands,
                        toggleBrand
                      )}
                      {renderCheckboxFilter(
                        language === "fr" ? "Puissance" : "Power",
                        powers,
                        filters.power,
                        (value) => {
                          setFilters(prev => ({
                            ...prev,
                            power: prev.power.includes(value)
                              ? prev.power.filter(p => p !== value)
                              : [...prev.power, value],
                          }));
                        }
                      )}
                      {renderCheckboxFilter(
                        language === "fr" ? "Garantie" : "Warranty",
                        warranties,
                        filters.warranty,
                        toggleWarranty
                      )}
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2 text-sm">
                          {language === "fr" ? "Prix (€)" : "Price (€)"}
                        </h4>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder={language === "fr" ? "Min" : "Min"}
                              value={filters.priceRange.min || ""}
                              onChange={(e) =>
                                setFilters(prev => ({
                                  ...prev,
                                  priceRange: { ...prev.priceRange, min: parseFloat(e.target.value) || 0 },
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                            />
                            <input
                              type="number"
                              placeholder={language === "fr" ? "Max" : "Max"}
                              value={filters.priceRange.max === maxPrice ? "" : filters.priceRange.max || ""}
                              onChange={(e) =>
                                setFilters(prev => ({
                                  ...prev,
                                  priceRange: { ...prev.priceRange, max: parseFloat(e.target.value) || maxPrice },
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                            />
                          </div>
                          {renderRadioFilter(
                            language === "fr" ? "Afficher les prix" : "Show prices",
                            filters.hasPrice,
                            (value) => setFilters(prev => ({ ...prev, hasPrice: value }))
                          )}
                        </div>
                      </div>
                    </FilterSection>

                    {/* Onduleurs Filters */}
                    <FilterSection
                      title={language === "fr" ? "Onduleurs" : "Inverters"}
                      isExpanded={expandedSections.onduleurs}
                      onToggle={() => setExpandedSections(prev => ({ ...prev, onduleurs: !prev.onduleurs }))}
                    >
                      {renderCheckboxFilter(
                        language === "fr" ? "Type d'onduleur" : "Inverter Type",
                        types,
                        filters.type,
                        (value) => {
                          setFilters(prev => ({
                            ...prev,
                            type: prev.type.includes(value)
                              ? prev.type.filter(t => t !== value)
                              : [...prev.type, value],
                          }));
                        }
                      )}
                      {mpptCounts.length > 0 && renderCheckboxFilter(
                        language === "fr" ? "Nombre de MPPT" : "MPPT Count",
                        mpptCounts.map(String),
                        filters.mpptCount.map(String),
                        (value) => {
                          setFilters(prev => ({
                            ...prev,
                            mpptCount: prev.mpptCount.includes(Number(value))
                              ? prev.mpptCount.filter(m => m !== Number(value))
                              : [...prev.mpptCount, Number(value)],
                          }));
                        }
                      )}
                      {renderCheckboxFilter(
                        language === "fr" ? "Puissance apparente (kVA)" : "Apparent Power (kVA)",
                        apparentPowers,
                        filters.apparentPower,
                        (value) => {
                          setFilters(prev => ({
                            ...prev,
                            apparentPower: prev.apparentPower.includes(value)
                              ? prev.apparentPower.filter(a => a !== value)
                              : [...prev.apparentPower, value],
                          }));
                        }
                      )}
                      {renderCheckboxFilter(
                        language === "fr" ? "Puissance nominale (kW)" : "Nominal Power (kW)",
                        nominalPowers,
                        filters.nominalPower,
                        (value) => {
                          setFilters(prev => ({
                            ...prev,
                            nominalPower: prev.nominalPower.includes(value)
                              ? prev.nominalPower.filter(n => n !== value)
                              : [...prev.nominalPower, value],
                          }));
                        }
                      )}
                      {renderCheckboxFilter(
                        language === "fr" ? "Voltage" : "Voltage",
                        voltages,
                        filters.voltage,
                        (value) => {
                          setFilters(prev => ({
                            ...prev,
                            voltage: prev.voltage.includes(value)
                              ? prev.voltage.filter(v => v !== value)
                              : [...prev.voltage, value],
                          }));
                        }
                      )}
                      {renderCheckboxFilter(
                        language === "fr" ? "Raccordement réseau" : "Network Connection",
                        networkConnections,
                        filters.networkConnection,
                        (value) => {
                          setFilters(prev => ({
                            ...prev,
                            networkConnection: prev.networkConnection.includes(value)
                              ? prev.networkConnection.filter(n => n !== value)
                              : [...prev.networkConnection, value],
                          }));
                        }
                      )}
                      {renderRadioFilter(
                        language === "fr" ? "Ethernet" : "Ethernet",
                        filters.hasEthernet,
                        (value) => setFilters(prev => ({ ...prev, hasEthernet: value }))
                      )}
                      {renderRadioFilter(
                        language === "fr" ? "Wi-Fi" : "Wi-Fi",
                        filters.hasWiFi,
                        (value) => setFilters(prev => ({ ...prev, hasWiFi: value }))
                      )}
                    </FilterSection>

                    {/* Panneaux Solaires Filters */}
                    <FilterSection
                      title={language === "fr" ? "Panneaux Solaires" : "Solar Panels"}
                      isExpanded={expandedSections.panneaux}
                      onToggle={() => setExpandedSections(prev => ({ ...prev, panneaux: !prev.panneaux }))}
                    >
                      {renderCheckboxFilter(
                        language === "fr" ? "Type de cellule" : "Cell Type",
                        cellTypes,
                        filters.cellType,
                        (value) => {
                          setFilters(prev => ({
                            ...prev,
                            cellType: prev.cellType.includes(value)
                              ? prev.cellType.filter(c => c !== value)
                              : [...prev.cellType, value],
                          }));
                        }
                      )}
                      {renderCheckboxFilter(
                        language === "fr" ? "Rendement" : "Efficiency",
                        efficiencies,
                        filters.efficiency,
                        (value) => {
                          setFilters(prev => ({
                            ...prev,
                            efficiency: prev.efficiency.includes(value)
                              ? prev.efficiency.filter(e => e !== value)
                              : [...prev.efficiency, value],
                          }));
                        }
                      )}
                      {renderCheckboxFilter(
                        language === "fr" ? "Puissance max" : "Max Power",
                        maxPowers,
                        filters.maxPower,
                        (value) => {
                          setFilters(prev => ({
                            ...prev,
                            maxPower: prev.maxPower.includes(value)
                              ? prev.maxPower.filter(m => m !== value)
                              : [...prev.maxPower, value],
                          }));
                        }
                      )}
                    </FilterSection>

                    {/* Batteries Filters */}
                    <FilterSection
                      title={language === "fr" ? "Batteries & Stockage" : "Batteries & Storage"}
                      isExpanded={expandedSections.batteries}
                      onToggle={() => setExpandedSections(prev => ({ ...prev, batteries: !prev.batteries }))}
                    >
                      {renderCheckboxFilter(
                        language === "fr" ? "Capacité (kWh)" : "Capacity (kWh)",
                        capacities,
                        filters.capacity,
                        (value) => {
                          setFilters(prev => ({
                            ...prev,
                            capacity: prev.capacity.includes(value)
                              ? prev.capacity.filter(c => c !== value)
                              : [...prev.capacity, value],
                          }));
                        }
                      )}
                      {renderCheckboxFilter(
                        language === "fr" ? "Type de batterie" : "Battery Type",
                        batteryTypes,
                        filters.batteryType,
                        (value) => {
                          setFilters(prev => ({
                            ...prev,
                            batteryType: prev.batteryType.includes(value)
                              ? prev.batteryType.filter(b => b !== value)
                              : [...prev.batteryType, value],
                          }));
                        }
                      )}
                    </FilterSection>

                    {/* Pompes à Chaleur Filters */}
                    <FilterSection
                      title={language === "fr" ? "Pompes à Chaleur" : "Heat Pumps"}
                      isExpanded={expandedSections.pompes}
                      onToggle={() => setExpandedSections(prev => ({ ...prev, pompes: !prev.pompes }))}
                    >
                      {renderCheckboxFilter(
                        "COP",
                        cops,
                        filters.cop,
                        (value) => {
                          setFilters(prev => ({
                            ...prev,
                            cop: prev.cop.includes(value)
                              ? prev.cop.filter(c => c !== value)
                              : [...prev.cop, value],
                          }));
                        }
                      )}
                      {renderCheckboxFilter(
                        language === "fr" ? "Puissance de chauffage" : "Heating Power",
                        heatingPowers,
                        filters.heatingPower,
                        (value) => {
                          setFilters(prev => ({
                            ...prev,
                            heatingPower: prev.heatingPower.includes(value)
                              ? prev.heatingPower.filter(h => h !== value)
                              : [...prev.heatingPower, value],
                          }));
                        }
                      )}
                    </FilterSection>
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <p className="text-gray-600 text-lg mb-4">
                    {language === "fr" ? "Aucun produit trouvé" : "No products found"}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {language === "fr" ? "Réinitialiser les filtres" : "Reset filters"}
                    </button>
                  )}
                </div>
              ) : (
                <ProductGrid products={filteredProducts} />
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <p className="mt-4 text-gray-600">Chargement...</p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    }>
      <CatalogContent />
    </Suspense>
  );
}
