export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  price?: number;
  originalPrice?: number;
  power?: string;
  type?: string;
  voltage?: string;
  warranty?: string;
  weight?: string;
  image?: string; // Image principale (pour compatibilité)
  images?: string[]; // Tableau d'images multiples pour la galerie
  link: string;
  sku?: string;
  description?: string;
  technicalDescription?: string;
  dimensions?: string;
  features?: string[];
  specifications?: Record<string, string>;
  documentation?: {
    installationManual?: string;
    technicalSheet?: string;
    userGuide?: string;
  };
  // Filtres pour onduleurs
  mpptCount?: number; // Nombre de MPPT
  apparentPower?: string; // Puissance apparente (kVA)
  nominalPower?: string; // Puissance nominale (kW)
  hasEthernet?: boolean; // Ethernet
  hasWiFi?: boolean; // Wi-Fi
  networkConnection?: string; // Raccordement réseau
  // Filtres pour panneaux solaires
  cellType?: string; // Type de cellule (monocristallin, polycristallin)
  efficiency?: string; // Rendement
  maxPower?: string; // Puissance max
  // Filtres pour batteries
  capacity?: string; // Capacité (kWh)
  batteryType?: string; // Type de batterie
  // Filtres pour pompes à chaleur
  cop?: string; // Coefficient de performance
  heatingPower?: string; // Puissance de chauffage
  // Filtres généraux
  color?: string; // Couleur
  material?: string; // Matériau
}

export const products: Product[] = [
  // Onduleurs - Hybride
  {
    id: "deye-sun-3-6kw",
    image: "/images/products/onduleurs/deye-sun-3-6kw.png", // Image principale (pour compatibilité)
    images: [
      "/images/products/onduleurs/deye-sun-3-6kw.png",
      "/images/products/onduleurs/deye-sun-3-6kw-2.png",
    ], // Galerie d'images multiples
    name: "Deye SUN-3-6KW SG04LP1-BE Monophasé",
    brand: "DEYE",
    category: "onduleurs",
    subcategory: "hybride",
    power: "3,6kW / 3 kW / 5 kW / 6 kW",
    type: "Monophasé",
    voltage: "Bas voltage",
    warranty: "10 ans",
    mpptCount: 2,
    apparentPower: "3.6 kVA",
    nominalPower: "3.6 kW",
    hasEthernet: true,
    hasWiFi: true,
    networkConnection: "Ethernet, Wi-Fi",
    price: 850.0,
    sku: "INVDE0001",
    weight: "45±0.5kg",
    dimensions: "450 × 380 × 180 mm",
    description: "L'onduleur hybride Deye SUN-3-6KW est une solution complète pour votre installation solaire. Compatible avec batteries bas voltage, cet onduleur monophasé offre une puissance variable de 3kW à 6kW selon le modèle. Idéal pour les installations résidentielles, il permet une autoconsommation optimale avec gestion intelligente de l'énergie.",
    technicalDescription: "L'onduleur Deye SUN-3-6KW SG04LP1-BE est équipé de la technologie hybride la plus avancée. Il supporte les batteries bas voltage et offre une efficacité maximale de 98,4%. Compatible avec la plupart des panneaux solaires du marché, il dispose de 2 MPPT pour une optimisation indépendante de chaque chaîne.",
    features: [
      "Technologie hybride avec gestion intelligente",
      "Compatibilité batteries bas voltage",
      "2 MPPT indépendants",
      "Monitoring via application mobile",
      "Protection IP65",
      "Garantie 10 ans"
    ],
    specifications: {
      "Puissance max": "3,6kW / 3kW / 5kW / 6kW",
      "Type": "Monophasé",
      "Voltage batterie": "Bas voltage",
      "MPPT": "2",
      "Efficacité max": "98,4%",
      "Poids": "45±0.5kg",
      "Dimensions": "450 × 380 × 180 mm",
      "Garantie": "10 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-3-6kw-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-3-6kw-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-3-6kw-guide.pdf"
    },
    link: "/products/deye-sun-3-6kw",
  },
  {
    id: "deye-sun-3kw",
    name: "Deye SUN-3KW SG04LP1-BE Monophasé",
    brand: "DEYE",
    category: "onduleurs",
    subcategory: "hybride",
    power: "3 kW",
    type: "Monophasé",
    voltage: "Bas voltage",
    warranty: "10 ans",
    mpptCount: 2,
    apparentPower: "3 kVA",
    nominalPower: "3 kW",
    hasEthernet: true,
    hasWiFi: true,
    networkConnection: "Ethernet, Wi-Fi",
    price: 750.0,
    sku: "INVDE0002",
    weight: "45±0.5kg",
    dimensions: "450 × 380 × 180 mm",
    description: "L'onduleur hybride Deye SUN-3KW est une solution complète pour votre installation solaire. Compatible avec batteries bas voltage, cet onduleur monophasé de 3kW est idéal pour les petites installations résidentielles.",
    technicalDescription: "L'onduleur Deye SUN-3KW SG04LP1-BE est équipé de la technologie hybride. Il supporte les batteries bas voltage et offre une efficacité maximale de 98,4%. Compatible avec la plupart des panneaux solaires du marché, il dispose de 2 MPPT.",
    features: [
      "Technologie hybride avec gestion intelligente",
      "Compatibilité batteries bas voltage",
      "2 MPPT indépendants",
      "Monitoring via application mobile",
      "Protection IP65",
      "Garantie 10 ans"
    ],
    specifications: {
      "Puissance": "3 kW",
      "Type": "Monophasé",
      "Voltage batterie": "Bas voltage",
      "MPPT": "2",
      "Efficacité max": "98,4%",
      "Poids": "45±0.5kg",
      "Dimensions": "450 × 380 × 180 mm",
      "Garantie": "10 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-3kw-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-3kw-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-3kw-guide.pdf"
    },
    link: "/products/deye-sun-3kw",
  },
  {
    id: "deye-sun-5kw",
    name: "Deye SUN-5KW SG05LP1-EU-AM2-P",
    brand: "DEYE",
    category: "onduleurs",
    subcategory: "hybride",
    power: "5 kW",
    type: "Monophasé",
    voltage: "Bas voltage",
    warranty: "10 ans",
    price: 950.0,
    sku: "INVDE0003",
    weight: "45±0.5kg",
    dimensions: "450 × 380 × 180 mm",
    description: "L'onduleur hybride Deye SUN-5KW est une solution complète pour votre installation solaire. Compatible avec batteries bas voltage, cet onduleur monophasé de 5kW offre un excellent rapport qualité-prix.",
    technicalDescription: "L'onduleur Deye SUN-5KW SG05LP1-EU-AM2-P est équipé de la technologie hybride. Il supporte les batteries bas voltage et offre une efficacité maximale de 98,4%. Compatible avec la plupart des panneaux solaires du marché, il dispose de 2 MPPT.",
    features: [
      "Technologie hybride avec gestion intelligente",
      "Compatibilité batteries bas voltage",
      "2 MPPT indépendants",
      "Monitoring via application mobile",
      "Protection IP65",
      "Garantie 10 ans"
    ],
    specifications: {
      "Puissance": "5 kW",
      "Type": "Monophasé",
      "Voltage batterie": "Bas voltage",
      "MPPT": "2",
      "Efficacité max": "98,4%",
      "Poids": "45±0.5kg",
      "Dimensions": "450 × 380 × 180 mm",
      "Garantie": "10 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-5kw-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-5kw-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-5kw-guide.pdf"
    },
    link: "/products/deye-sun-5kw",
  },
  {
    id: "deye-sun-6kw",
    name: "Deye SUN-6KW SG05LP1-EU-AM2-P",
    brand: "DEYE",
    category: "onduleurs",
    subcategory: "hybride",
    power: "6 kW",
    type: "Monophasé",
    voltage: "Bas voltage",
    warranty: "10 ans",
    price: 1050.0,
    sku: "INVDE0004",
    weight: "45±0.5kg",
    dimensions: "450 × 380 × 180 mm",
    description: "L'onduleur hybride Deye SUN-6KW est une solution complète pour votre installation solaire. Compatible avec batteries bas voltage, cet onduleur monophasé de 6kW est idéal pour les installations résidentielles moyennes.",
    technicalDescription: "L'onduleur Deye SUN-6KW SG05LP1-EU-AM2-P est équipé de la technologie hybride. Il supporte les batteries bas voltage et offre une efficacité maximale de 98,4%. Compatible avec la plupart des panneaux solaires du marché, il dispose de 2 MPPT.",
    features: [
      "Technologie hybride avec gestion intelligente",
      "Compatibilité batteries bas voltage",
      "2 MPPT indépendants",
      "Monitoring via application mobile",
      "Protection IP65",
      "Garantie 10 ans"
    ],
    specifications: {
      "Puissance": "6 kW",
      "Type": "Monophasé",
      "Voltage batterie": "Bas voltage",
      "MPPT": "2",
      "Efficacité max": "98,4%",
      "Poids": "45±0.5kg",
      "Dimensions": "450 × 380 × 180 mm",
      "Garantie": "10 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-6kw-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-6kw-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-6kw-guide.pdf"
    },
    link: "/products/deye-sun-6kw",
  },
  {
    id: "deye-sun-8kw",
    name: "Deye SUN-8KW SG05LP1-EU-AM2-P",
    brand: "DEYE",
    category: "onduleurs",
    subcategory: "hybride",
    power: "8 kW",
    type: "Monophasé",
    voltage: "Bas voltage",
    warranty: "10 ans",
    price: 1150.0,
    sku: "INVDE0005",
    weight: "45±0.5kg",
    dimensions: "450 × 380 × 180 mm",
    description: "L'onduleur hybride Deye SUN-8KW est une solution complète pour votre installation solaire. Compatible avec batteries bas voltage, cet onduleur monophasé de 8kW est idéal pour les grandes installations résidentielles.",
    technicalDescription: "L'onduleur Deye SUN-8KW SG05LP1-EU-AM2-P est équipé de la technologie hybride. Il supporte les batteries bas voltage et offre une efficacité maximale de 98,4%. Compatible avec la plupart des panneaux solaires du marché, il dispose de 2 MPPT.",
    features: [
      "Technologie hybride avec gestion intelligente",
      "Compatibilité batteries bas voltage",
      "2 MPPT indépendants",
      "Monitoring via application mobile",
      "Protection IP65",
      "Garantie 10 ans"
    ],
    specifications: {
      "Puissance": "8 kW",
      "Type": "Monophasé",
      "Voltage batterie": "Bas voltage",
      "MPPT": "2",
      "Efficacité max": "98,4%",
      "Poids": "45±0.5kg",
      "Dimensions": "450 × 380 × 180 mm",
      "Garantie": "10 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-8kw-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-8kw-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-8kw-guide.pdf"
    },
    link: "/products/deye-sun-8kw",
  },
  {
    id: "deye-sun-10kw-tri",
    name: "Deye SUN-10KW SG04LP3-BE Triphasé",
    brand: "DEYE",
    category: "onduleurs",
    subcategory: "hybride",
    power: "10 kW",
    type: "Triphasé",
    voltage: "Bas voltage",
    warranty: "10 ans",
    price: 1500.0,
    sku: "INVDE0010",
    weight: "60±0.5kg",
    dimensions: "540 × 445 × 200 mm",
    description: "L'onduleur hybride Deye SUN-10KW triphasé est une solution complète pour votre installation solaire. Compatible avec batteries bas voltage, cet onduleur triphasé de 10kW est idéal pour les installations commerciales et résidentielles importantes.",
    technicalDescription: "L'onduleur Deye SUN-10KW SG04LP3-BE triphasé est équipé de la technologie hybride. Il supporte les batteries bas voltage et offre une efficacité maximale de 98,4%. Compatible avec la plupart des panneaux solaires du marché, il dispose de 2 MPPT.",
    features: [
      "Technologie hybride avec gestion intelligente",
      "Compatibilité batteries bas voltage",
      "2 MPPT indépendants",
      "Monitoring via application mobile",
      "Protection IP65",
      "Garantie 10 ans"
    ],
    specifications: {
      "Puissance": "10 kW",
      "Type": "Triphasé",
      "Voltage batterie": "Bas voltage",
      "MPPT": "2",
      "Efficacité max": "98,4%",
      "Poids": "60±0.5kg",
      "Dimensions": "540 × 445 × 200 mm",
      "Garantie": "10 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-10kw-tri-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-10kw-tri-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-10kw-tri-guide.pdf"
    },
    link: "/products/deye-sun-10kw-tri",
  },
  {
    id: "deye-sun-12kw-tri",
    name: "Deye SUN-12KW SG04LP3-BE Triphasé",
    brand: "DEYE",
    category: "onduleurs",
    subcategory: "hybride",
    power: "12 kW",
    type: "Triphasé",
    voltage: "Bas voltage",
    warranty: "10 ans",
    price: 1600.0,
    sku: "INVDE0011",
    weight: "60±0.5kg",
    dimensions: "540 × 445 × 200 mm",
    description: "L'onduleur hybride Deye SUN-12KW triphasé est une solution complète pour votre installation solaire. Compatible avec batteries bas voltage, cet onduleur triphasé de 12kW est idéal pour les installations commerciales.",
    technicalDescription: "L'onduleur Deye SUN-12KW SG04LP3-BE triphasé est équipé de la technologie hybride. Il supporte les batteries bas voltage et offre une efficacité maximale de 98,4%. Compatible avec la plupart des panneaux solaires du marché, il dispose de 2 MPPT.",
    features: [
      "Technologie hybride avec gestion intelligente",
      "Compatibilité batteries bas voltage",
      "2 MPPT indépendants",
      "Monitoring via application mobile",
      "Protection IP65",
      "Garantie 10 ans"
    ],
    specifications: {
      "Puissance": "12 kW",
      "Type": "Triphasé",
      "Voltage batterie": "Bas voltage",
      "MPPT": "2",
      "Efficacité max": "98,4%",
      "Poids": "60±0.5kg",
      "Dimensions": "540 × 445 × 200 mm",
      "Garantie": "10 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-12kw-tri-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-12kw-tri-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-12kw-tri-guide.pdf"
    },
    link: "/products/deye-sun-12kw-tri",
  },
  {
    id: "deye-sun-5kw-tri",
    name: "Deye SUN-5KW SG04LP3-BE Triphasé",
    brand: "DEYE",
    category: "onduleurs",
    subcategory: "hybride",
    power: "5 kW",
    type: "Triphasé",
    voltage: "Bas voltage",
    warranty: "10 ans",
    price: 1200.0,
    sku: "INVDE0006",
    weight: "60±0.5kg",
    dimensions: "540 × 445 × 200 mm",
    description: "L'onduleur hybride Deye SUN-5KW triphasé est une solution complète pour votre installation solaire. Compatible avec batteries bas voltage, cet onduleur triphasé de 5kW est idéal pour les installations résidentielles triphasées.",
    technicalDescription: "L'onduleur Deye SUN-5KW SG04LP3-BE triphasé est équipé de la technologie hybride. Il supporte les batteries bas voltage et offre une efficacité maximale de 98,4%. Compatible avec la plupart des panneaux solaires du marché, il dispose de 2 MPPT.",
    features: [
      "Technologie hybride avec gestion intelligente",
      "Compatibilité batteries bas voltage",
      "2 MPPT indépendants",
      "Monitoring via application mobile",
      "Protection IP65",
      "Garantie 10 ans"
    ],
    specifications: {
      "Puissance": "5 kW",
      "Type": "Triphasé",
      "Voltage batterie": "Bas voltage",
      "MPPT": "2",
      "Efficacité max": "98,4%",
      "Poids": "60±0.5kg",
      "Dimensions": "540 × 445 × 200 mm",
      "Garantie": "10 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-5kw-tri-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-5kw-tri-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-5kw-tri-guide.pdf"
    },
    link: "/products/deye-sun-5kw-tri",
  },
  {
    id: "deye-sun-6kw-tri",
    name: "Deye SUN-6KW SG04LP3-BE Triphasé",
    brand: "DEYE",
    category: "onduleurs",
    subcategory: "hybride",
    power: "6 kW",
    type: "Triphasé",
    voltage: "Bas voltage",
    warranty: "10 ans",
    price: 1300.0,
    sku: "INVDE0007",
    weight: "60±0.5kg",
    dimensions: "540 × 445 × 200 mm",
    description: "L'onduleur hybride Deye SUN-6KW triphasé est une solution complète pour votre installation solaire. Compatible avec batteries bas voltage, cet onduleur triphasé de 6kW est idéal pour les installations résidentielles triphasées.",
    technicalDescription: "L'onduleur Deye SUN-6KW SG04LP3-BE triphasé est équipé de la technologie hybride. Il supporte les batteries bas voltage et offre une efficacité maximale de 98,4%. Compatible avec la plupart des panneaux solaires du marché, il dispose de 2 MPPT.",
    features: [
      "Technologie hybride avec gestion intelligente",
      "Compatibilité batteries bas voltage",
      "2 MPPT indépendants",
      "Monitoring via application mobile",
      "Protection IP65",
      "Garantie 10 ans"
    ],
    specifications: {
      "Puissance": "6 kW",
      "Type": "Triphasé",
      "Voltage batterie": "Bas voltage",
      "MPPT": "2",
      "Efficacité max": "98,4%",
      "Poids": "60±0.5kg",
      "Dimensions": "540 × 445 × 200 mm",
      "Garantie": "10 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-6kw-tri-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-6kw-tri-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-6kw-tri-guide.pdf"
    },
    link: "/products/deye-sun-6kw-tri",
  },
  {
    id: "deye-sun-8kw-tri",
    name: "Deye SUN-8KW SG04LP3-BE Triphasé",
    brand: "DEYE",
    category: "onduleurs",
    subcategory: "hybride",
    power: "8 kW",
    type: "Triphasé",
    voltage: "Bas voltage",
    warranty: "10 ans",
    price: 1400.0,
    sku: "INVDE0008",
    weight: "60±0.5kg",
    dimensions: "540 × 445 × 200 mm",
    description: "L'onduleur hybride Deye SUN-8KW triphasé est une solution complète pour votre installation solaire. Compatible avec batteries bas voltage, cet onduleur triphasé de 8kW est idéal pour les installations résidentielles et commerciales.",
    technicalDescription: "L'onduleur Deye SUN-8KW SG04LP3-BE triphasé est équipé de la technologie hybride. Il supporte les batteries bas voltage et offre une efficacité maximale de 98,4%. Compatible avec la plupart des panneaux solaires du marché, il dispose de 2 MPPT.",
    features: [
      "Technologie hybride avec gestion intelligente",
      "Compatibilité batteries bas voltage",
      "2 MPPT indépendants",
      "Monitoring via application mobile",
      "Protection IP65",
      "Garantie 10 ans"
    ],
    specifications: {
      "Puissance": "8 kW",
      "Type": "Triphasé",
      "Voltage batterie": "Bas voltage",
      "MPPT": "2",
      "Efficacité max": "98,4%",
      "Poids": "60±0.5kg",
      "Dimensions": "540 × 445 × 200 mm",
      "Garantie": "10 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-8kw-tri-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-8kw-tri-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-8kw-tri-guide.pdf"
    },
    link: "/products/deye-sun-8kw-tri",
  },
  {
    id: "deye-sun-10k-hp3",
    name: "Deye SUN-10K-SG01HP3 Triphasé",
    brand: "DEYE",
    category: "onduleurs",
    subcategory: "hybride",
    power: "10 kW",
    type: "Triphasé",
    voltage: "Haut voltage",
    warranty: "10 ans",
    price: 1650.0,
    sku: "INVDE0012",
    weight: "65±0.5kg",
    dimensions: "560 × 460 × 220 mm",
    description: "L'onduleur hybride Deye SUN-10K triphasé haut voltage est une solution complète pour votre installation solaire. Compatible avec batteries haut voltage, cet onduleur triphasé de 10kW est idéal pour les installations commerciales importantes.",
    technicalDescription: "L'onduleur Deye SUN-10K-SG01HP3 triphasé haut voltage est équipé de la technologie hybride. Il supporte les batteries haut voltage et offre une efficacité maximale de 98,4%. Compatible avec la plupart des panneaux solaires du marché, il dispose de 2 MPPT.",
    features: [
      "Technologie hybride avec gestion intelligente",
      "Compatibilité batteries haut voltage",
      "2 MPPT indépendants",
      "Monitoring via application mobile",
      "Protection IP65",
      "Garantie 10 ans"
    ],
    specifications: {
      "Puissance": "10 kW",
      "Type": "Triphasé",
      "Voltage batterie": "Haut voltage",
      "MPPT": "2",
      "Efficacité max": "98,4%",
      "Poids": "65±0.5kg",
      "Dimensions": "560 × 460 × 220 mm",
      "Garantie": "10 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-10k-hp3-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-10k-hp3-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-10k-hp3-guide.pdf"
    },
    link: "/products/deye-sun-10k-hp3",
  },
  {
    id: "deye-sun-14k",
    name: "Deye SUN-14K-SG05LP3-EU-SM2",
    brand: "DEYE",
    category: "onduleurs",
    subcategory: "hybride",
    power: "14 kW",
    type: "Triphasé",
    voltage: "Bas voltage",
    warranty: "10 ans",
    price: 1700.0,
    sku: "INVDE0013",
    weight: "60±0.5kg",
    dimensions: "540 × 445 × 200 mm",
    description: "L'onduleur hybride Deye SUN-14K triphasé est une solution complète pour votre installation solaire. Compatible avec batteries bas voltage, cet onduleur triphasé de 14kW est idéal pour les installations commerciales.",
    technicalDescription: "L'onduleur Deye SUN-14K-SG05LP3-EU-SM2 triphasé est équipé de la technologie hybride. Il supporte les batteries bas voltage et offre une efficacité maximale de 98,4%. Compatible avec la plupart des panneaux solaires du marché, il dispose de 2 MPPT.",
    features: [
      "Technologie hybride avec gestion intelligente",
      "Compatibilité batteries bas voltage",
      "2 MPPT indépendants",
      "Monitoring via application mobile",
      "Protection IP65",
      "Garantie 10 ans"
    ],
    specifications: {
      "Puissance": "14 kW",
      "Type": "Triphasé",
      "Voltage batterie": "Bas voltage",
      "MPPT": "2",
      "Efficacité max": "98,4%",
      "Poids": "60±0.5kg",
      "Dimensions": "540 × 445 × 200 mm",
      "Garantie": "10 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-14k-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-14k-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-14k-guide.pdf"
    },
    link: "/products/deye-sun-14k",
  },
  {
    id: "deye-sun-15k-hp3",
    name: "Deye SUN-15K-SG01HP3 Triphasé",
    brand: "DEYE",
    category: "onduleurs",
    subcategory: "hybride",
    power: "15 kW",
    type: "Triphasé",
    voltage: "Haut voltage",
    warranty: "10 ans",
    price: 1800.0,
    sku: "INVDE0014",
    weight: "65±0.5kg",
    dimensions: "560 × 460 × 220 mm",
    description: "L'onduleur hybride Deye SUN-15K triphasé haut voltage est une solution complète pour votre installation solaire. Compatible avec batteries haut voltage, cet onduleur triphasé de 15kW est idéal pour les installations commerciales importantes.",
    technicalDescription: "L'onduleur Deye SUN-15K-SG01HP3 triphasé haut voltage est équipé de la technologie hybride. Il supporte les batteries haut voltage et offre une efficacité maximale de 98,4%. Compatible avec la plupart des panneaux solaires du marché, il dispose de 2 MPPT.",
    features: [
      "Technologie hybride avec gestion intelligente",
      "Compatibilité batteries haut voltage",
      "2 MPPT indépendants",
      "Monitoring via application mobile",
      "Protection IP65",
      "Garantie 10 ans"
    ],
    specifications: {
      "Puissance": "15 kW",
      "Type": "Triphasé",
      "Voltage batterie": "Haut voltage",
      "MPPT": "2",
      "Efficacité max": "98,4%",
      "Poids": "65±0.5kg",
      "Dimensions": "560 × 460 × 220 mm",
      "Garantie": "10 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-15k-hp3-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-15k-hp3-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-15k-hp3-guide.pdf"
    },
    link: "/products/deye-sun-15k-hp3",
  },
  {
    id: "deye-sun-16k",
    name: "Deye SUN-16K-SG05LP3-EU-SM2",
    brand: "DEYE",
    category: "onduleurs",
    subcategory: "hybride",
    power: "16 kW",
    type: "Triphasé",
    voltage: "Bas voltage",
    warranty: "10 ans",
    price: 1900.0,
    sku: "INVDE0015",
    weight: "60±0.5kg",
    dimensions: "540 × 445 × 200 mm",
    description: "L'onduleur hybride Deye SUN-16K triphasé est une solution complète pour votre installation solaire. Compatible avec batteries bas voltage, cet onduleur triphasé de 16kW est idéal pour les installations commerciales importantes.",
    technicalDescription: "L'onduleur Deye SUN-16K-SG05LP3-EU-SM2 triphasé est équipé de la technologie hybride. Il supporte les batteries bas voltage et offre une efficacité maximale de 98,4%. Compatible avec la plupart des panneaux solaires du marché, il dispose de 2 MPPT.",
    features: [
      "Technologie hybride avec gestion intelligente",
      "Compatibilité batteries bas voltage",
      "2 MPPT indépendants",
      "Monitoring via application mobile",
      "Protection IP65",
      "Garantie 10 ans"
    ],
    specifications: {
      "Puissance": "16 kW",
      "Type": "Triphasé",
      "Voltage batterie": "Bas voltage",
      "MPPT": "2",
      "Efficacité max": "98,4%",
      "Poids": "60±0.5kg",
      "Dimensions": "540 × 445 × 200 mm",
      "Garantie": "10 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-16k-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-16k-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-16k-guide.pdf"
    },
    link: "/products/deye-sun-16k",
  },
  {
    id: "deye-sun-18k",
    name: "Deye SUN-18K-SG05LP3-EU-SM2",
    brand: "DEYE",
    category: "onduleurs",
    subcategory: "hybride",
    power: "18 KW",
    type: "Triphasé",
    voltage: "Bas voltage",
    warranty: "10 ans",
    price: 2000.0,
    sku: "INVDE0016",
    weight: "60±0.5kg",
    dimensions: "540 × 445 × 200 mm",
    description: "L'onduleur hybride Deye SUN-18K triphasé est une solution complète pour votre installation solaire. Compatible avec batteries bas voltage, cet onduleur triphasé de 18kW est idéal pour les installations commerciales importantes.",
    technicalDescription: "L'onduleur Deye SUN-18K-SG05LP3-EU-SM2 triphasé est équipé de la technologie hybride. Il supporte les batteries bas voltage et offre une efficacité maximale de 98,4%. Compatible avec la plupart des panneaux solaires du marché, il dispose de 2 MPPT.",
    features: [
      "Technologie hybride avec gestion intelligente",
      "Compatibilité batteries bas voltage",
      "2 MPPT indépendants",
      "Monitoring via application mobile",
      "Protection IP65",
      "Garantie 10 ans"
    ],
    specifications: {
      "Puissance": "18 kW",
      "Type": "Triphasé",
      "Voltage batterie": "Bas voltage",
      "MPPT": "2",
      "Efficacité max": "98,4%",
      "Poids": "60±0.5kg",
      "Dimensions": "540 × 445 × 200 mm",
      "Garantie": "10 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-18k-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-18k-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-18k-guide.pdf"
    },
    link: "/products/deye-sun-18k",
  },
  {
    id: "deye-sun-20k-hp3",
    name: "Deye SUN-20K-SG01HP3 Triphasé",
    brand: "DEYE",
    category: "onduleurs",
    subcategory: "hybride",
    power: "20 kW",
    type: "Triphasé",
    voltage: "Haut voltage",
    warranty: "10 ans",
    price: 2100.0,
    sku: "INVDE0017",
    weight: "65±0.5kg",
    dimensions: "560 × 460 × 220 mm",
    description: "L'onduleur hybride Deye SUN-20K triphasé haut voltage est une solution complète pour votre installation solaire. Compatible avec batteries haut voltage, cet onduleur triphasé de 20kW est idéal pour les grandes installations commerciales.",
    technicalDescription: "L'onduleur Deye SUN-20K-SG01HP3 triphasé haut voltage est équipé de la technologie hybride. Il supporte les batteries haut voltage et offre une efficacité maximale de 98,4%. Compatible avec la plupart des panneaux solaires du marché, il dispose de 2 MPPT.",
    features: [
      "Technologie hybride avec gestion intelligente",
      "Compatibilité batteries haut voltage",
      "2 MPPT indépendants",
      "Monitoring via application mobile",
      "Protection IP65",
      "Garantie 10 ans"
    ],
    specifications: {
      "Puissance": "20 kW",
      "Type": "Triphasé",
      "Voltage batterie": "Haut voltage",
      "MPPT": "2",
      "Efficacité max": "98,4%",
      "Poids": "65±0.5kg",
      "Dimensions": "560 × 460 × 220 mm",
      "Garantie": "10 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-20k-hp3-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-20k-hp3-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/deye-sun-20k-hp3-guide.pdf"
    },
    link: "/products/deye-sun-20k-hp3",
  },
  // Onduleurs - ON GRID
  {
    id: "huawei-sun2000-4-6ktl",
    name: "Huawei Smart Energy Controller SUN2000-4.6KTL-L1",
    brand: "Huawei",
    category: "onduleurs",
    subcategory: "on-grid",
    power: "4.6kW / 5.0kVA",
    type: "Monophasé",
    warranty: "10 ans",
    price: 1100.0,
    sku: "INVHW0029",
    weight: "18kg",
    dimensions: "540 × 445 × 200 mm",
    description: "L'onduleur Huawei SUN2000-4.6KTL-L1 est un onduleur on-grid monophasé de 4.6kW. Conçu pour les installations résidentielles, il offre une efficacité maximale et une intégration parfaite avec les systèmes Huawei Smart PV.",
    technicalDescription: "L'onduleur Huawei SUN2000-4.6KTL-L1 dispose de 2 MPPT avec une plage de tension MPPT étendue. Il offre une efficacité maximale de 98,6% et est équipé de la technologie Smart I-V Curve Diagnosis pour un monitoring avancé.",
    features: [
      "2 MPPT indépendants",
      "Efficacité max 98,6%",
      "Smart I-V Curve Diagnosis",
      "Monitoring via FusionSolar App",
      "Protection IP65",
      "Garantie 10 ans"
    ],
    specifications: {
      "Puissance": "4.6kW / 5.0kVA",
      "Type": "Monophasé",
      "MPPT": "2",
      "Efficacité max": "98,6%",
      "Plage tension MPPT": "80-550V",
      "Poids": "18kg",
      "Dimensions": "540 × 445 × 200 mm",
      "Garantie": "10 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/huawei-sun2000-4-6ktl-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/huawei-sun2000-4-6ktl-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/huawei-sun2000-4-6ktl-guide.pdf"
    },
    link: "/products/huawei-sun2000-4-6ktl",
  },
  {
    id: "growatt-min-3000tl",
    name: "Growatt MIN 3000TL-XH",
    brand: "Growatt",
    category: "onduleurs",
    subcategory: "on-grid",
    power: "3.0kW / 3.0kVA",
    type: "Monophasé",
    warranty: "10 ans",
    price: 650.0,
    sku: "INVGW0005",
    weight: "12kg",
    dimensions: "430 × 360 × 180 mm",
    description: "L'onduleur Growatt MIN 3000TL-XH est un onduleur on-grid compact et performant de 3kW. Idéal pour les petites installations résidentielles, il combine performance et compacité.",
    technicalDescription: "L'onduleur Growatt MIN 3000TL-XH dispose de 2 MPPT avec une efficacité maximale de 98,1%. Design compact et léger, il est facile à installer et offre un monitoring via l'application Growatt.",
    features: [
      "Design compact et léger",
      "2 MPPT indépendants",
      "Efficacité max 98,1%",
      "Monitoring via application",
      "Protection IP65",
      "Garantie 10 ans"
    ],
    specifications: {
      "Puissance": "3.0kW / 3.0kVA",
      "Type": "Monophasé",
      "MPPT": "2",
      "Efficacité max": "98,1%",
      "Poids": "12kg",
      "Dimensions": "430 × 360 × 180 mm",
      "Garantie": "10 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/growatt-min-3000tl-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/growatt-min-3000tl-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/growatt-min-3000tl-guide.pdf"
    },
    link: "/products/growatt-min-3000tl",
  },
  // Panneaux Solaires
  {
    id: "elitec-xmax-560-bifacial",
    name: "ELITEC SOLAR Xmax bifacial 560Wc",
    brand: "ELITEC SOLAR",
    category: "panneaux-solaires",
    power: "560 Wp",
    type: "Monocristallin",
    warranty: "30 ans",
    price: 180.0,
    sku: "PANEL001",
    weight: "28.6kg",
    dimensions: "2279 × 1134 × 30 mm",
    description: "Le panneau ELITEC SOLAR Xmax bifacial 560Wc est un panneau solaire haute performance avec technologie bifaciale. Il capture la lumière des deux côtés pour maximiser la production d'énergie, même par faible luminosité.",
    technicalDescription: "Le panneau ELITEC SOLAR Xmax bifacial utilise des cellules monocristallines de dernière génération avec technologie bifaciale. Rendement jusqu'à 23,02% avec une garantie de performance linéaire de 30 ans. Idéal pour les installations où la réflexion au sol peut augmenter la production.",
    features: [
      "Technologie bifaciale",
      "Rendement jusqu'à 23,02%",
      "Garantie produit 30 ans",
      "Garantie performance linéaire 30 ans",
      "Résistance aux conditions extrêmes",
      "Certifié IEC 61215 et IEC 61730"
    ],
    specifications: {
      "Puissance": "560 Wp",
      "Type cellule": "Monocristallin",
      "Rendement": "23,02%",
      "Poids": "28.6kg",
      "Dimensions": "2279 × 1134 × 30 mm",
      "Garantie produit": "30 ans",
      "Garantie performance": "30 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/elitec-xmax-560-bifacial-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/elitec-xmax-560-bifacial-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/elitec-xmax-560-bifacial-guide.pdf"
    },
    link: "/products/elitec-xmax-560-bifacial",
  },
  {
    id: "elitec-xmax-470-bifacial",
    name: "ELITEC SOLAR Xmax bifacial 470Wc",
    brand: "ELITEC SOLAR",
    category: "panneaux-solaires",
    power: "470 W",
    type: "Monocristallin",
    warranty: "30 ans",
    price: 150.0,
    sku: "PANEL002",
    weight: "26.5kg",
    dimensions: "2108 × 1048 × 30 mm",
    description: "Le panneau ELITEC SOLAR Xmax bifacial 470Wc est un panneau solaire haute performance avec technologie bifaciale. Il capture la lumière des deux côtés pour maximiser la production d'énergie.",
    technicalDescription: "Le panneau ELITEC SOLAR Xmax bifacial 470Wc utilise des cellules monocristallines avec technologie bifaciale. Rendement élevé avec une garantie de performance linéaire de 30 ans.",
    features: [
      "Technologie bifaciale",
      "Rendement élevé",
      "Garantie produit 30 ans",
      "Garantie performance linéaire 30 ans",
      "Résistance aux conditions extrêmes",
      "Certifié IEC 61215 et IEC 61730"
    ],
    specifications: {
      "Puissance": "470 W",
      "Type cellule": "Monocristallin",
      "Poids": "26.5kg",
      "Dimensions": "2108 × 1048 × 30 mm",
      "Garantie": "30 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/elitec-xmax-470-bifacial-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/elitec-xmax-470-bifacial-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/elitec-xmax-470-bifacial-guide.pdf"
    },
    link: "/products/elitec-xmax-470-bifacial",
  },
  {
    id: "elitec-xmax-600",
    name: "ELITEC SOLAR Xmax 600Wc",
    brand: "ELITEC SOLAR",
    category: "panneaux-solaires",
    power: "600Wc",
    type: "Mono Topcon",
    warranty: "30 ans",
    price: 200.0,
    sku: "PANEL003",
    weight: "28,6 kg",
    dimensions: "2279 × 1134 × 30 cm",
    description: "Le panneau ELITEC SOLAR Xmax 600Wc est un panneau solaire haute performance avec technologie Mono Topcon. Idéal pour les installations résidentielles et commerciales, il offre un excellent rendement.",
    technicalDescription: "Le panneau ELITEC SOLAR Xmax 600Wc utilise la technologie Mono Topcon pour un rendement optimal. Garantie produit de 30 ans avec performance linéaire garantie.",
    features: [
      "Technologie Mono Topcon",
      "Rendement élevé",
      "Garantie produit 30 ans",
      "Garantie performance 30 ans",
      "Résistance aux conditions extrêmes"
    ],
    specifications: {
      "Puissance": "600Wc",
      "Type cellule": "Mono Topcon",
      "Poids": "28,6 kg",
      "Dimensions": "2279 × 1134 × 30 cm",
      "Garantie": "30 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/elitec-xmax-600-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/elitec-xmax-600-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/elitec-xmax-600-guide.pdf"
    },
    link: "/products/elitec-xmax-600",
  },
  {
    id: "elitec-hc7-540",
    name: "ELITEC SOLAR HC7 – 540Wc",
    brand: "ELITEC SOLAR",
    category: "panneaux-solaires",
    power: "540 Wp",
    type: "Mono Topcon",
    warranty: "30 ans",
    price: 170.0,
    sku: "PANEL004",
    weight: "27.5kg",
    dimensions: "2279 × 1134 × 30 mm",
    description: "Le panneau ELITEC SOLAR HC7 540Wc est un panneau solaire haute performance avec technologie Mono Topcon. Idéal pour les installations résidentielles et commerciales.",
    technicalDescription: "Le panneau ELITEC SOLAR HC7 540Wc utilise la technologie Mono Topcon pour un rendement optimal. Garantie produit de 30 ans avec performance linéaire garantie.",
    features: [
      "Technologie Mono Topcon",
      "Rendement élevé",
      "Garantie produit 30 ans",
      "Garantie performance 30 ans",
      "Résistance aux conditions extrêmes"
    ],
    specifications: {
      "Puissance": "540 Wp",
      "Type cellule": "Mono Topcon",
      "Poids": "27.5kg",
      "Dimensions": "2279 × 1134 × 30 mm",
      "Garantie": "30 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/elitec-hc7-540-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/elitec-hc7-540-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/elitec-hc7-540-guide.pdf"
    },
    link: "/products/elitec-hc7-540",
  },
  {
    id: "elitec-xmax-560",
    name: "ELITEC SOLAR Xmax 560Wc",
    brand: "ELITEC SOLAR",
    category: "panneaux-solaires",
    power: "560 Wp",
    type: "Mono",
    warranty: "30 ans",
    price: 175.0,
    sku: "PANEL005",
    weight: "28.6kg",
    dimensions: "2279 × 1134 × 30 mm",
    description: "Le panneau ELITEC SOLAR Xmax 560Wc est un panneau solaire haute performance avec technologie monocristalline. Idéal pour les installations résidentielles et commerciales.",
    technicalDescription: "Le panneau ELITEC SOLAR Xmax 560Wc utilise des cellules monocristallines pour un rendement optimal. Garantie produit de 30 ans avec performance linéaire garantie.",
    features: [
      "Technologie monocristalline",
      "Rendement élevé",
      "Garantie produit 30 ans",
      "Garantie performance 30 ans",
      "Résistance aux conditions extrêmes"
    ],
    specifications: {
      "Puissance": "560 Wp",
      "Type cellule": "Mono",
      "Poids": "28.6kg",
      "Dimensions": "2279 × 1134 × 30 mm",
      "Garantie": "30 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/elitec-xmax-560-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/elitec-xmax-560-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/elitec-xmax-560-guide.pdf"
    },
    link: "/products/elitec-xmax-560",
  },
  {
    id: "elitec-xmax-460",
    name: "ELITEC SOLAR Xmax 460Wc",
    brand: "ELITEC SOLAR",
    category: "panneaux-solaires",
    power: "460Wc",
    type: "Mono Topcon",
    warranty: "30 ans",
    price: 100.0,
    originalPrice: 150.0,
    sku: "PANEL006",
    weight: "21 kg",
    dimensions: "1762 × 1134 × 30 cm",
    description: "Le panneau ELITEC SOLAR Xmax 460Wc est un panneau solaire haute performance avec technologie Mono Topcon. Idéal pour les installations résidentielles et commerciales, il offre un excellent rapport qualité-prix.",
    technicalDescription: "Le panneau ELITEC SOLAR Xmax 460Wc utilise la technologie Mono Topcon pour un rendement optimal. Garantie produit de 30 ans avec performance linéaire garantie.",
    features: [
      "Technologie Mono Topcon",
      "Rendement élevé",
      "Garantie produit 30 ans",
      "Garantie performance 30 ans",
      "Résistance aux conditions extrêmes"
    ],
    specifications: {
      "Puissance": "460Wc",
      "Type cellule": "Mono Topcon",
      "Poids": "21 kg",
      "Dimensions": "1762 × 1134 × 30 cm",
      "Garantie": "30 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/elitec-xmax-460-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/elitec-xmax-460-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/elitec-xmax-460-guide.pdf"
    },
    link: "/products/elitec-xmax-460",
  },
  // Onduleurs - Micro Onduleur
  {
    id: "micro-inverter-800w",
    name: "Micro Onduleur 800W",
    brand: "Solplanet",
    category: "onduleurs",
    subcategory: "micro-onduleur",
    power: "800W",
    warranty: "10 ans",
    price: 180.0,
    sku: "INVMI0001",
    weight: "1.2kg",
    dimensions: "200 × 150 × 50 mm",
    description: "Le micro onduleur Solplanet 800W est une solution innovante pour optimiser la production de chaque panneau solaire individuellement. Idéal pour les installations avec ombrage partiel.",
    technicalDescription: "Le micro onduleur Solplanet 800W convertit le courant continu de chaque panneau en courant alternatif. Optimisation individuelle de chaque panneau pour maximiser la production globale.",
    features: [
      "Optimisation individuelle par panneau",
      "Idéal pour installations avec ombrage",
      "Monitoring panneau par panneau",
      "Installation simple",
      "Protection IP67",
      "Garantie 10 ans"
    ],
    specifications: {
      "Puissance": "800W",
      "Type": "Micro onduleur",
      "Poids": "1.2kg",
      "Dimensions": "200 × 150 × 50 mm",
      "Garantie": "10 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/micro-inverter-800w-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/micro-inverter-800w-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/micro-inverter-800w-guide.pdf"
    },
    link: "/products/micro-inverter-800w",
  },
  {
    id: "micro-inverter-1500w",
    name: "Micro Onduleur 1500W",
    brand: "Solplanet",
    category: "onduleurs",
    subcategory: "micro-onduleur",
    power: "1500W",
    warranty: "10 ans",
    price: 250.0,
    sku: "INVMI0002",
    weight: "1.5kg",
    dimensions: "200 × 150 × 50 mm",
    description: "Le micro onduleur Solplanet 1500W est une solution innovante pour optimiser la production de chaque panneau solaire individuellement. Idéal pour les installations avec ombrage partiel.",
    technicalDescription: "Le micro onduleur Solplanet 1500W convertit le courant continu de chaque panneau en courant alternatif. Optimisation individuelle de chaque panneau pour maximiser la production globale.",
    features: [
      "Optimisation individuelle par panneau",
      "Idéal pour installations avec ombrage",
      "Monitoring panneau par panneau",
      "Installation simple",
      "Protection IP67",
      "Garantie 10 ans"
    ],
    specifications: {
      "Puissance": "1500W",
      "Type": "Micro onduleur",
      "Poids": "1.5kg",
      "Dimensions": "200 × 150 × 50 mm",
      "Garantie": "10 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/micro-inverter-1500w-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/micro-inverter-1500w-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/micro-inverter-1500w-guide.pdf"
    },
    link: "/products/micro-inverter-1500w",
  },
  {
    id: "micro-inverter-2000w",
    name: "Micro Onduleur 2000W",
    brand: "Solplanet",
    category: "onduleurs",
    subcategory: "micro-onduleur",
    power: "2000W",
    warranty: "10 ans",
    price: 320.0,
    sku: "INVMI0003",
    weight: "1.8kg",
    dimensions: "200 × 150 × 50 mm",
    description: "Le micro onduleur Solplanet 2000W est une solution innovante pour optimiser la production de chaque panneau solaire individuellement. Idéal pour les installations avec ombrage partiel.",
    technicalDescription: "Le micro onduleur Solplanet 2000W convertit le courant continu de chaque panneau en courant alternatif. Optimisation individuelle de chaque panneau pour maximiser la production globale.",
    features: [
      "Optimisation individuelle par panneau",
      "Idéal pour installations avec ombrage",
      "Monitoring panneau par panneau",
      "Installation simple",
      "Protection IP67",
      "Garantie 10 ans"
    ],
    specifications: {
      "Puissance": "2000W",
      "Type": "Micro onduleur",
      "Poids": "1.8kg",
      "Dimensions": "200 × 150 × 50 mm",
      "Garantie": "10 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/micro-inverter-2000w-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/micro-inverter-2000w-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/micro-inverter-2000w-guide.pdf"
    },
    link: "/products/micro-inverter-2000w",
  },
  // Batteries & Stockage
  {
    id: "huawei-luna-5kwh",
    name: "Huawei Smart String ESS LUNA2000-5-E0 HV",
    brand: "Huawei",
    category: "batteries-stockage",
    power: "5kWh",
    warranty: "10 ans",
    price: 3500.0,
    sku: "BATHW0001",
    weight: "55kg",
    dimensions: "600 × 450 × 200 mm",
    description: "La batterie Huawei LUNA2000-5-E0 HV est une solution de stockage d'énergie haut voltage de 5kWh. Idéale pour les installations résidentielles, elle offre une autonomie optimale et une intégration parfaite avec les systèmes Huawei.",
    technicalDescription: "La batterie Huawei LUNA2000-5-E0 HV utilise la technologie lithium-fer-phosphate (LFP) pour une sécurité et une durabilité maximales. Compatible avec les onduleurs Huawei, elle offre une gestion intelligente de l'énergie.",
    features: [
      "Technologie LFP (Lithium Fer Phosphate)",
      "Capacité 5kWh",
      "Haut voltage",
      "Modulaire et extensible",
      "Monitoring via FusionSolar App",
      "Garantie 10 ans"
    ],
    specifications: {
      "Capacité": "5kWh",
      "Type": "Haut voltage",
      "Technologie": "LFP",
      "Poids": "55kg",
      "Dimensions": "600 × 450 × 200 mm",
      "Garantie": "10 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/huawei-luna-5kwh-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/huawei-luna-5kwh-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/huawei-luna-5kwh-guide.pdf"
    },
    link: "/products/huawei-luna-5kwh",
  },
  {
    id: "huawei-luna-10kwh",
    name: "Huawei Smart String ESS LUNA2000-10-E0 HV",
    brand: "Huawei",
    category: "batteries-stockage",
    power: "10kWh",
    warranty: "10 ans",
    price: 6500.0,
    sku: "BATHW0002",
    weight: "110kg",
    dimensions: "600 × 450 × 400 mm",
    description: "La batterie Huawei LUNA2000-10-E0 HV est une solution de stockage d'énergie haut voltage de 10kWh. Idéale pour les installations résidentielles importantes, elle offre une autonomie optimale et une intégration parfaite avec les systèmes Huawei.",
    technicalDescription: "La batterie Huawei LUNA2000-10-E0 HV utilise la technologie lithium-fer-phosphate (LFP) pour une sécurité et une durabilité maximales. Compatible avec les onduleurs Huawei, elle offre une gestion intelligente de l'énergie.",
    features: [
      "Technologie LFP (Lithium Fer Phosphate)",
      "Capacité 10kWh",
      "Haut voltage",
      "Modulaire et extensible",
      "Monitoring via FusionSolar App",
      "Garantie 10 ans"
    ],
    specifications: {
      "Capacité": "10kWh",
      "Type": "Haut voltage",
      "Technologie": "LFP",
      "Poids": "110kg",
      "Dimensions": "600 × 450 × 400 mm",
      "Garantie": "10 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/huawei-luna-10kwh-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/huawei-luna-10kwh-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/huawei-luna-10kwh-guide.pdf"
    },
    link: "/products/huawei-luna-10kwh",
  },
  {
    id: "huawei-luna-module",
    name: "Huawei Smart String ESS LUNA2000-5KW-C0",
    brand: "Huawei",
    category: "batteries-stockage",
    power: "5kW",
    warranty: "10 ans",
    price: 3200.0,
    sku: "BATHW0003",
    weight: "50kg",
    dimensions: "600 × 450 × 200 mm",
    description: "Le module de batterie Huawei LUNA2000-5KW-C0 est un module de stockage d'énergie de 5kW. Idéal pour les installations résidentielles, il offre une autonomie optimale et une intégration parfaite avec les systèmes Huawei.",
    technicalDescription: "Le module de batterie Huawei LUNA2000-5KW-C0 utilise la technologie lithium-fer-phosphate (LFP) pour une sécurité et une durabilité maximales. Compatible avec les onduleurs Huawei, il offre une gestion intelligente de l'énergie.",
    features: [
      "Technologie LFP (Lithium Fer Phosphate)",
      "Puissance 5kW",
      "Modulaire et extensible",
      "Monitoring via FusionSolar App",
      "Garantie 10 ans"
    ],
    specifications: {
      "Puissance": "5kW",
      "Technologie": "LFP",
      "Poids": "50kg",
      "Dimensions": "600 × 450 × 200 mm",
      "Garantie": "10 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/huawei-luna-module-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/huawei-luna-module-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/huawei-luna-module-guide.pdf"
    },
    link: "/products/huawei-luna-module",
  },
  // Structure de Montage
  {
    id: "mounting-inclined",
    name: "Système de montage toiture inclinée",
    brand: "Schletter",
    category: "structure-montage",
    type: "Toiture inclinée",
    price: 450.0,
    sku: "MOUNT0001",
    weight: "Variable",
    dimensions: "Sur mesure",
    description: "Le système de montage Schletter pour toiture inclinée est conçu pour une installation sécurisée et durable des panneaux solaires sur toits inclinés. Matériaux en aluminium anodisé pour une résistance maximale aux intempéries.",
    technicalDescription: "Le système de montage Schletter pour toiture inclinée utilise des rails en aluminium et des crochets de fixation adaptés à différents types de tuiles. Installation rapide et sécurisée conforme aux normes européennes.",
    features: [
      "Aluminium anodisé haute qualité",
      "Adaptable à différents types de tuiles",
      "Installation rapide",
      "Résistant aux intempéries",
      "Conforme aux normes européennes",
      "Garantie 20 ans"
    ],
    specifications: {
      "Type": "Toiture inclinée",
      "Matériau": "Aluminium anodisé",
      "Poids": "Variable selon configuration",
      "Dimensions": "Sur mesure",
      "Garantie": "20 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/mounting-inclined-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/mounting-inclined-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/mounting-inclined-guide.pdf"
    },
    link: "/products/mounting-inclined",
  },
  {
    id: "mounting-flat",
    name: "Système de montage toiture plate",
    brand: "Schletter",
    category: "structure-montage",
    type: "Toiture plate",
    price: 550.0,
    sku: "MOUNT0002",
    weight: "Variable",
    dimensions: "Sur mesure",
    description: "Le système de montage Schletter pour toiture plate est conçu pour une installation sécurisée et durable des panneaux solaires sur toits plats. Structure inclinable pour optimiser l'orientation des panneaux.",
    technicalDescription: "Le système de montage Schletter pour toiture plate utilise des structures en aluminium avec supports inclinables. Permet d'optimiser l'angle d'inclinaison des panneaux pour maximiser la production.",
    features: [
      "Aluminium anodisé haute qualité",
      "Structure inclinable",
      "Installation rapide",
      "Résistant aux intempéries",
      "Conforme aux normes européennes",
      "Garantie 20 ans"
    ],
    specifications: {
      "Type": "Toiture plate",
      "Matériau": "Aluminium anodisé",
      "Poids": "Variable selon configuration",
      "Dimensions": "Sur mesure",
      "Garantie": "20 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/mounting-flat-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/mounting-flat-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/mounting-flat-guide.pdf"
    },
    link: "/products/mounting-flat",
  },
  {
    id: "mounting-rails",
    name: "Rails de montage aluminium",
    brand: "Schletter",
    category: "structure-montage",
    type: "Accessoires",
    price: 120.0,
    sku: "MOUNT0003",
    weight: "5kg",
    dimensions: "4000 × 50 × 40 mm",
    description: "Les rails de montage Schletter en aluminium sont des accessoires essentiels pour l'installation de panneaux solaires. Haute qualité et résistance pour une installation durable.",
    technicalDescription: "Les rails de montage Schletter sont fabriqués en aluminium anodisé de haute qualité. Disponibles en différentes longueurs, ils s'adaptent à tous les types d'installations.",
    features: [
      "Aluminium anodisé haute qualité",
      "Différentes longueurs disponibles",
      "Résistant à la corrosion",
      "Facile à installer",
      "Garantie 20 ans"
    ],
    specifications: {
      "Type": "Accessoires",
      "Matériau": "Aluminium anodisé",
      "Poids": "5kg",
      "Dimensions": "4000 × 50 × 40 mm",
      "Garantie": "20 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/mounting-rails-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/mounting-rails-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/mounting-rails-guide.pdf"
    },
    link: "/products/mounting-rails",
  },
  // Borne de Recharge
  {
    id: "smappee-ev-wall",
    name: "Smappee EV Wall Black EVWC-332-C8R-E-B",
    brand: "Smappee",
    category: "borne-recharge",
    power: "22.0kW",
    warranty: "2 ans",
    price: 1299.0,
    sku: "CHASP0003",
    weight: "15kg",
    dimensions: "400 × 300 × 150 mm",
    description: "La Smappee EV Wall Black avec câble Type 2 de 8 m et support est une borne de recharge murale haut de gamme, pensée pour répondre aux besoins de recharge rapides et intelligents dans les environnements résidentiels et commerciaux. Compatible 1 ou 3 phases jusqu'à 22kW.",
    technicalDescription: "La borne Smappee EV Wall Black est équipée d'un câble Type 2 de 8 mètres avec support. Elle supporte la charge 1 ou 3 phases jusqu'à 22kW. Connectée via WiFi, elle permet un monitoring en temps réel et une gestion intelligente de la charge via l'application Smappee.",
    features: [
      "Charge jusqu'à 22kW (1 ou 3 phases)",
      "Câble Type 2 de 8m inclus",
      "Connectivité WiFi",
      "Monitoring en temps réel",
      "Application mobile dédiée",
      "Installation murale simple",
      "Garantie 2 ans"
    ],
    specifications: {
      "Puissance max": "22.0kW",
      "Type": "1 ou 3 phases",
      "Câble": "Type 2, 8m",
      "Connectivité": "WiFi",
      "Poids": "15kg",
      "Dimensions": "400 × 300 × 150 mm",
      "Garantie": "2 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/smappee-ev-wall-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/smappee-ev-wall-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/smappee-ev-wall-guide.pdf"
    },
    link: "/products/smappee-ev-wall",
  },
  {
    id: "wallbox-pulsar",
    name: "Wallbox Pulsar Plus",
    brand: "Wallbox",
    category: "borne-recharge",
    power: "11kW",
    warranty: "2 ans",
    price: 899.0,
    sku: "CHAWB0001",
    weight: "12kg",
    dimensions: "350 × 250 × 140 mm",
    description: "La Wallbox Pulsar Plus est une borne de recharge murale compacte et performante de 11kW. Idéale pour les installations résidentielles, elle offre une recharge rapide et intelligente pour votre véhicule électrique.",
    technicalDescription: "La Wallbox Pulsar Plus supporte la charge jusqu'à 11kW en monophasé. Connectée via WiFi, elle permet un monitoring en temps réel et une gestion intelligente de la charge via l'application Wallbox.",
    features: [
      "Charge jusqu'à 11kW",
      "Connectivité WiFi",
      "Monitoring en temps réel",
      "Application mobile dédiée",
      "Installation murale simple",
      "Garantie 2 ans"
    ],
    specifications: {
      "Puissance max": "11kW",
      "Type": "Monophasé",
      "Connectivité": "WiFi",
      "Poids": "12kg",
      "Dimensions": "350 × 250 × 140 mm",
      "Garantie": "2 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/wallbox-pulsar-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/wallbox-pulsar-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/wallbox-pulsar-guide.pdf"
    },
    link: "/products/wallbox-pulsar",
  },
  // Batterie Plug & Play
  {
    id: "plug-play-battery",
    name: "Batterie Plug & Play 5kWh",
    brand: "Huawei",
    category: "batterie-plug-play",
    power: "5kWh",
    warranty: "10 ans",
    price: 3200.0,
    sku: "BATPP0001",
    weight: "50kg",
    dimensions: "600 × 450 × 200 mm",
    description: "La batterie Plug & Play Huawei 5kWh est une solution de stockage d'énergie facile à installer. Installation simple sans configuration complexe, idéale pour les installations résidentielles.",
    technicalDescription: "La batterie Plug & Play Huawei 5kWh utilise la technologie lithium-fer-phosphate (LFP) pour une sécurité et une durabilité maximales. Installation simplifiée avec connexion directe.",
    features: [
      "Technologie LFP (Lithium Fer Phosphate)",
      "Capacité 5kWh",
      "Installation simplifiée",
      "Plug & Play",
      "Monitoring via application",
      "Garantie 10 ans"
    ],
    specifications: {
      "Capacité": "5kWh",
      "Technologie": "LFP",
      "Poids": "50kg",
      "Dimensions": "600 × 450 × 200 mm",
      "Garantie": "10 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/plug-play-battery-5kwh-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/plug-play-battery-5kwh-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/plug-play-battery-5kwh-guide.pdf"
    },
    link: "/products/plug-play-battery",
  },
  {
    id: "plug-play-battery-10",
    name: "Batterie Plug & Play 10kWh",
    brand: "Huawei",
    category: "batterie-plug-play",
    power: "10kWh",
    warranty: "10 ans",
    price: 6000.0,
    sku: "BATPP0002",
    weight: "100kg",
    dimensions: "600 × 450 × 400 mm",
    description: "La batterie Plug & Play Huawei 10kWh est une solution de stockage d'énergie facile à installer. Installation simple sans configuration complexe, idéale pour les installations résidentielles importantes.",
    technicalDescription: "La batterie Plug & Play Huawei 10kWh utilise la technologie lithium-fer-phosphate (LFP) pour une sécurité et une durabilité maximales. Installation simplifiée avec connexion directe.",
    features: [
      "Technologie LFP (Lithium Fer Phosphate)",
      "Capacité 10kWh",
      "Installation simplifiée",
      "Plug & Play",
      "Monitoring via application",
      "Garantie 10 ans"
    ],
    specifications: {
      "Capacité": "10kWh",
      "Technologie": "LFP",
      "Poids": "100kg",
      "Dimensions": "600 × 450 × 400 mm",
      "Garantie": "10 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/plug-play-battery-10kwh-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/plug-play-battery-10kwh-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/plug-play-battery-10kwh-guide.pdf"
    },
    link: "/products/plug-play-battery-10",
  },
  // Pompe à Chaleur
  {
    id: "heat-pump-air",
    name: "Pompe à chaleur air-air",
    brand: "Mitsubishi",
    category: "pompe-chaleur",
    power: "5kW",
    warranty: "5 ans",
    price: 4500.0,
    sku: "PACMA0001",
    weight: "45kg",
    dimensions: "800 × 300 × 650 mm",
    description: "La pompe à chaleur air-air Mitsubishi de 5kW est une solution efficace pour le chauffage et la climatisation de votre habitation. Haute performance énergétique et respectueuse de l'environnement.",
    technicalDescription: "La pompe à chaleur air-air Mitsubishi utilise la technologie inverter pour une efficacité maximale. COP élevé pour une consommation d'énergie réduite. Compatible avec les systèmes de régulation intelligents.",
    features: [
      "Technologie inverter",
      "COP élevé",
      "Chauffage et climatisation",
      "Régulation intelligente",
      "Silencieux",
      "Garantie 5 ans"
    ],
    specifications: {
      "Puissance": "5kW",
      "Type": "Air-air",
      "COP": "4.5",
      "Poids": "45kg",
      "Dimensions": "800 × 300 × 650 mm",
      "Garantie": "5 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/heat-pump-air-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/heat-pump-air-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/heat-pump-air-guide.pdf"
    },
    link: "/products/heat-pump-air",
  },
  {
    id: "heat-pump-pool",
    name: "Pompe à chaleur Piscine",
    brand: "Mitsubishi",
    category: "pompe-chaleur",
    subcategory: "piscine",
    power: "8kW",
    warranty: "5 ans",
    price: 3500.0,
    sku: "PACP0001",
    weight: "60kg",
    dimensions: "900 × 400 × 800 mm",
    description: "La pompe à chaleur piscine Mitsubishi de 8kW est spécialement conçue pour chauffer votre piscine de manière économique et écologique. Haute performance et résistance aux conditions extérieures.",
    technicalDescription: "La pompe à chaleur piscine Mitsubishi utilise la technologie inverter pour une efficacité maximale. Résistante aux intempéries et aux conditions extérieures. Installation simple et rapide.",
    features: [
      "Technologie inverter",
      "COP élevé",
      "Résistant aux intempéries",
      "Installation simple",
      "Économique",
      "Garantie 5 ans"
    ],
    specifications: {
      "Puissance": "8kW",
      "Type": "Piscine",
      "COP": "5.0",
      "Poids": "60kg",
      "Dimensions": "900 × 400 × 800 mm",
      "Garantie": "5 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/heat-pump-pool-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/heat-pump-pool-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/heat-pump-pool-guide.pdf"
    },
    link: "/products/heat-pump-pool",
  },
  {
    id: "thermodynamic-tank",
    name: "Ballon Thermodynamique 200L",
    brand: "Atlantic",
    category: "pompe-chaleur",
    subcategory: "ballon-thermodynamique",
    power: "200L",
    warranty: "5 ans",
    price: 2800.0,
    sku: "BALAT0001",
    weight: "85kg",
    dimensions: "600 × 600 × 1800 mm",
    description: "Le ballon thermodynamique Atlantic 200L combine une pompe à chaleur intégrée avec un ballon d'eau chaude. Solution économique et écologique pour la production d'eau chaude sanitaire.",
    technicalDescription: "Le ballon thermodynamique Atlantic 200L utilise l'air ambiant pour chauffer l'eau. COP élevé pour une consommation d'énergie réduite. Installation intérieure ou extérieure selon modèle.",
    features: [
      "Pompe à chaleur intégrée",
      "Capacité 200L",
      "COP élevé",
      "Économique",
      "Écologique",
      "Garantie 5 ans"
    ],
    specifications: {
      "Capacité": "200L",
      "Type": "Thermodynamique",
      "COP": "3.5",
      "Poids": "85kg",
      "Dimensions": "600 × 600 × 1800 mm",
      "Garantie": "5 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/thermodynamic-tank-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/thermodynamic-tank-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/thermodynamic-tank-guide.pdf"
    },
    link: "/products/thermodynamic-tank",
  },
  {
    id: "heating-accessories",
    name: "Accessoires chauffage",
    brand: "Divers",
    category: "pompe-chaleur",
    subcategory: "accessoires",
    price: 150.0,
    sku: "ACCHE0001",
    description: "Accessoires et pièces détachées pour vos installations de pompe à chaleur. Thermostats, vannes, régulateurs et autres accessoires essentiels.",
    technicalDescription: "Gamme complète d'accessoires pour pompes à chaleur : thermostats intelligents, vannes de régulation, régulateurs, filtres et autres pièces détachées.",
    features: [
      "Thermostats intelligents",
      "Vannes de régulation",
      "Régulateurs",
      "Filtres",
      "Pièces détachées",
      "Compatible avec la plupart des marques"
    ],
    specifications: {
      "Type": "Accessoires",
      "Compatible": "La plupart des marques",
      "Garantie": "2 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/heating-accessories-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/heating-accessories-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/heating-accessories-guide.pdf"
    },
    link: "/products/heating-accessories",
  },
  // Poélés & Cheminée
  {
    id: "wood-stove",
    name: "Poêle à bois",
    brand: "Godin",
    category: "poeles-cheminee",
    power: "8kW",
    price: 2500.0,
    sku: "POELG0001",
    weight: "120kg",
    dimensions: "600 × 500 × 800 mm",
    description: "Le poêle à bois Godin de 8kW est une solution de chauffage d'appoint économique et écologique. Design moderne et performance optimale pour chauffer efficacement votre habitation.",
    technicalDescription: "Le poêle à bois Godin utilise le bois comme combustible pour un chauffage économique. Rendement élevé et respectueux de l'environnement. Design moderne et élégant.",
    features: [
      "Puissance 8kW",
      "Rendement élevé",
      "Design moderne",
      "Économique",
      "Écologique",
      "Facile à utiliser"
    ],
    specifications: {
      "Puissance": "8kW",
      "Type": "Poêle à bois",
      "Poids": "120kg",
      "Dimensions": "600 × 500 × 800 mm"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/wood-stove-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/wood-stove-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/wood-stove-guide.pdf"
    },
    link: "/products/wood-stove",
  },
  {
    id: "fireplace-insert",
    name: "Insert cheminée",
    brand: "Godin",
    category: "poeles-cheminee",
    power: "10kW",
    price: 3200.0,
    sku: "POELG0002",
    weight: "150kg",
    dimensions: "700 × 600 × 500 mm",
    description: "L'insert cheminée Godin de 10kW transforme votre cheminée traditionnelle en système de chauffage performant. Design élégant et performance optimale.",
    technicalDescription: "L'insert cheminée Godin s'intègre parfaitement dans votre cheminée existante. Rendement élevé et distribution optimale de la chaleur. Design élégant et moderne.",
    features: [
      "Puissance 10kW",
      "Rendement élevé",
      "Design élégant",
      "Intégration facile",
      "Distribution optimale de la chaleur",
      "Facile à utiliser"
    ],
    specifications: {
      "Puissance": "10kW",
      "Type": "Insert cheminée",
      "Poids": "150kg",
      "Dimensions": "700 × 600 × 500 mm"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/fireplace-insert-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/fireplace-insert-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/fireplace-insert-guide.pdf"
    },
    link: "/products/fireplace-insert",
  },
  // Climatiseur
  {
    id: "air-conditioner-split",
    name: "Climatiseur Split 3.5kW",
    brand: "Mitsubishi",
    category: "climatiseur",
    power: "3.5kW",
    warranty: "5 ans",
    price: 1800.0,
    sku: "CLIMI0001",
    weight: "25kg",
    dimensions: "800 × 300 × 200 mm",
    description: "Le climatiseur Split Mitsubishi de 3.5kW est une solution efficace pour le rafraîchissement de votre habitation. Haute performance énergétique et silencieux.",
    technicalDescription: "Le climatiseur Split Mitsubishi utilise la technologie inverter pour une efficacité maximale. Silencieux et économique, il offre un confort optimal toute l'année.",
    features: [
      "Technologie inverter",
      "Puissance 3.5kW",
      "Silencieux",
      "Économique",
      "Télécommande",
      "Garantie 5 ans"
    ],
    specifications: {
      "Puissance": "3.5kW",
      "Type": "Split",
      "Poids": "25kg",
      "Dimensions": "800 × 300 × 200 mm",
      "Garantie": "5 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/air-conditioner-split-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/air-conditioner-split-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/air-conditioner-split-guide.pdf"
    },
    link: "/products/air-conditioner-split",
  },
  {
    id: "air-conditioner-multi",
    name: "Climatiseur Multi-split 5kW",
    brand: "Mitsubishi",
    category: "climatiseur",
    power: "5kW",
    warranty: "5 ans",
    price: 3200.0,
    sku: "CLIMI0002",
    weight: "35kg",
    dimensions: "900 × 350 × 250 mm",
    description: "Le climatiseur Multi-split Mitsubishi de 5kW permet de climatiser plusieurs pièces avec une seule unité extérieure. Solution économique et performante pour les grandes surfaces.",
    technicalDescription: "Le climatiseur Multi-split Mitsubishi utilise la technologie inverter pour une efficacité maximale. Permet de connecter plusieurs unités intérieures à une seule unité extérieure.",
    features: [
      "Technologie inverter",
      "Puissance 5kW",
      "Multi-split (plusieurs unités intérieures)",
      "Silencieux",
      "Économique",
      "Garantie 5 ans"
    ],
    specifications: {
      "Puissance": "5kW",
      "Type": "Multi-split",
      "Poids": "35kg",
      "Dimensions": "900 × 350 × 250 mm",
      "Garantie": "5 ans"
    },
    documentation: {
      installationManual: "https://www.photonsolar.be/wp-content/uploads/2024/01/air-conditioner-multi-installation.pdf",
      technicalSheet: "https://www.photonsolar.be/wp-content/uploads/2024/01/air-conditioner-multi-technical.pdf",
      userGuide: "https://www.photonsolar.be/wp-content/uploads/2024/01/air-conditioner-multi-guide.pdf"
    },
    link: "/products/air-conditioner-multi",
  },
];

export function getProductsByCategory(category: string, subcategory?: string): Product[] {
  if (!category) return [];
  
  let filtered = products.filter(p => p.category === category);
  if (subcategory) {
    filtered = filtered.filter(p => p.subcategory === subcategory);
  }
  
  // Debug: log pour vérifier
  console.log(`[getProductsByCategory] Category: "${category}", Subcategory: "${subcategory}", Found: ${filtered.length} products`);
  console.log(`[getProductsByCategory] Total products: ${products.length}, Categories available:`, [...new Set(products.map(p => p.category))]);
  
  return filtered;
}

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function searchProducts(query: string): Product[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const searchTerm = query.toLowerCase().trim();
  
  return products.filter(product => {
    // Recherche dans le nom
    const nameMatch = product.name.toLowerCase().includes(searchTerm);
    
    // Recherche dans la marque
    const brandMatch = product.brand.toLowerCase().includes(searchTerm);
    
    // Recherche dans la catégorie
    const categoryMatch = product.category.toLowerCase().includes(searchTerm);
    
    // Recherche dans la sous-catégorie
    const subcategoryMatch = product.subcategory?.toLowerCase().includes(searchTerm);
    
    // Recherche dans la description
    const descriptionMatch = product.description?.toLowerCase().includes(searchTerm);
    
    // Recherche dans les caractéristiques
    const featuresMatch = product.features?.some(feature => 
      feature.toLowerCase().includes(searchTerm)
    );
    
    // Recherche dans le SKU
    const skuMatch = product.sku?.toLowerCase().includes(searchTerm);
    
    // Recherche dans le type
    const typeMatch = product.type?.toLowerCase().includes(searchTerm);
    
    return nameMatch || brandMatch || categoryMatch || subcategoryMatch || 
           descriptionMatch || featuresMatch || skuMatch || typeMatch;
  });
}

