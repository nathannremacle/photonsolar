import {
  Zap,           // Onduleurs
  Sun,            // Panneaux solaires
  Battery,        // Batteries
  Wrench,         // Structure de montage
  Plug,           // Borne de recharge
  BatteryCharging, // Batterie Plug & Play
  Thermometer,    // Pompe à chaleur
  Flame,          // Poêles & Cheminée
  Wind,           // Climatiseur
  type LucideIcon
} from "lucide-react";
import { ComponentType } from "react";

export type ProductCategory = 
  | "onduleurs"
  | "panneaux-solaires"
  | "batteries-stockage"
  | "structure-montage"
  | "borne-recharge"
  | "batterie-plug-play"
  | "pompe-chaleur"
  | "poeles-cheminee"
  | "climatiseur";

interface CategoryIcon {
  icon: ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
}

export const categoryIcons: Record<ProductCategory, CategoryIcon> = {
  "onduleurs": {
    icon: Zap,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  "panneaux-solaires": {
    icon: Sun,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  "batteries-stockage": {
    icon: Battery,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  "structure-montage": {
    icon: Wrench,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  "borne-recharge": {
    icon: Plug,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  "batterie-plug-play": {
    icon: BatteryCharging,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  "pompe-chaleur": {
    icon: Thermometer,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  "poeles-cheminee": {
    icon: Flame,
    color: "text-orange-700",
    bgColor: "bg-orange-100",
  },
  "climatiseur": {
    icon: Wind,
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
  },
};

export function getCategoryIcon(category: string): CategoryIcon | null {
  return categoryIcons[category as ProductCategory] || null;
}

