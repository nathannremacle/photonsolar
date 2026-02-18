/**
 * Correction manuelle produit par produit : analyse chaque produit individuellement
 * et applique des corrections intelligentes basées sur le nom, la catégorie, etc.
 * 
 * Usage: npx tsx scripts/fix-products-manual.ts
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Règles de correction de marque basées sur le nom du produit */
function detectBrandFromName(name: string, currentBrand: string): string | null {
  const nameUpper = name.toUpperCase();
  
  // Si la marque actuelle n'est pas Photonsolar, on la garde
  if (currentBrand && currentBrand.trim().toLowerCase() !== 'photonsolar') {
    return null; // Pas de changement nécessaire
  }
  
  // Détection par mots-clés dans le nom
  if (nameUpper.includes('DEYE') || nameUpper.includes('SUN-')) {
    return 'DEYE';
  }
  if (nameUpper.includes('HUAWEI') || nameUpper.includes('SUN2000') || nameUpper.includes('LUNA2000')) {
    return 'Huawei';
  }
  if (nameUpper.includes('BEMCO') || nameUpper.includes('ECOLINE') || nameUpper.includes('ECOPURE')) {
    return 'BEMCO';
  }
  if (nameUpper.includes('ELITEC') || nameUpper.includes('XMAX') || nameUpper.includes('HC7')) {
    return 'ELITEC SOLAR';
  }
  if (nameUpper.includes('MARSTEK') || nameUpper.includes('SATURN') || nameUpper.includes('VENUS')) {
    return 'MARSTEK';
  }
  if (nameUpper.includes('BENY')) {
    return 'BENY';
  }
  if (nameUpper.includes('GEWISS')) {
    return 'Gewiss';
  }
  if (nameUpper.includes('SOLPLANET') || nameUpper.includes('MICRO ONDULEUR')) {
    return 'Solplanet';
  }
  if (nameUpper.includes('GROWATT')) {
    return 'Growatt';
  }
  if (nameUpper.includes('SCHLETTER') || nameUpper.includes('MONTAGE')) {
    return 'Schletter';
  }
  if (nameUpper.includes('SMAPPEE')) {
    return 'Smappee';
  }
  if (nameUpper.includes('WALLBOX') || nameUpper.includes('PULSAR')) {
    return 'Wallbox';
  }
  if (nameUpper.includes('MITSUBISHI')) {
    return 'Mitsubishi';
  }
  if (nameUpper.includes('ATLANTIC')) {
    return 'Atlantic';
  }
  if (nameUpper.includes('GODIN')) {
    return 'Godin';
  }
  if (nameUpper.includes('POOL') || nameUpper.includes('PISCINE')) {
    return 'Mitsubishi';
  }
  if (nameUpper.includes('POWER OPTIMIZER') || nameUpper.includes('OPTIMIZER')) {
    return 'Huawei';
  }
  if (nameUpper.includes('SMART METER') || nameUpper.includes('SMART POWER SENSOR') || nameUpper.includes('SMART DONGLE') || nameUpper.includes('DDSU') || nameUpper.includes('DTSU') || nameUpper.includes('CT002')) {
    return 'Huawei';
  }
  if (nameUpper.includes('LUNA2000') || nameUpper.includes('POWER MODULE')) {
    return 'Huawei';
  }
  if (nameUpper.includes('SUPPORT MURALE') || nameUpper.includes('SUPPORT MURALE')) {
    return 'Huawei';
  }
  if (nameUpper.includes('MC4') || nameUpper.includes('CONNECTEUR')) {
    // Les connecteurs MC4 sont généralement génériques, mais on peut laisser Photonsolar ou mettre une marque générique
    return null; // On garde Photonsolar pour les connecteurs génériques
  }
  if (nameUpper.includes('BOBINE') || nameUpper.includes('CABLE')) {
    // Câbles génériques, on peut laisser Photonsolar
    return null;
  }
  if (nameUpper.includes('POOLSUN')) {
    return 'Poolsun';
  }
  
  return null; // Pas de correction automatique possible
}

/** Correction de catégorie basée sur le nom et la catégorie actuelle */
function fixCategory(name: string, currentCategory: string, currentSubcategory: string | null): { category: string; subcategory: string | null } | null {
  const nameUpper = name.toUpperCase();
  
  // Ballons thermodynamiques BEMCO -> pompe-chaleur / ballon-thermodynamique
  if (nameUpper.includes('BALLON THERMODYNAMIQUE') || nameUpper.includes('BALLON THERMODYNAMIQUE')) {
    if (currentCategory !== 'pompe-chaleur') {
      return { category: 'pompe-chaleur', subcategory: 'ballon-thermodynamique' };
    }
  }
  
  // Pompes à chaleur piscine
  if (nameUpper.includes('PISCINE') || nameUpper.includes('POOL')) {
    if (currentCategory !== 'pompe-chaleur' || currentSubcategory !== 'piscine') {
      return { category: 'pompe-chaleur', subcategory: 'piscine' };
    }
  }
  
  // Ecopure BEMCO -> pompe-chaleur (pas structure-montage)
  if (nameUpper.includes('ECOPURE')) {
    if (currentCategory === 'structure-montage') {
      return { category: 'pompe-chaleur', subcategory: null };
    }
  }
  
  // Onduleurs Huawei SUN2000 -> onduleurs (pas structure-montage)
  if ((nameUpper.includes('SUN2000') || nameUpper.includes('ONDULEUR')) && nameUpper.includes('INJECTION')) {
    if (currentCategory === 'structure-montage') {
      return { category: 'onduleurs', subcategory: 'on-grid' };
    }
  }
  
  // Optimizer Huawei -> onduleurs / micro-onduleur ou structure-montage selon contexte
  if (nameUpper.includes('OPTIMIZER')) {
    if (currentCategory === 'structure-montage') {
      return { category: 'onduleurs', subcategory: 'micro-onduleur' };
    }
  }
  
  // Panneaux solaires Elitec -> panneaux-solaires (pas structure-montage)
  if (nameUpper.includes('PANNEAU SOLAIRE') || nameUpper.includes('XMAX') || nameUpper.includes('HC7')) {
    if (currentCategory === 'structure-montage') {
      return { category: 'panneaux-solaires', subcategory: null };
    }
  }
  
  // Batteries -> batteries-stockage ou batterie-plug-play selon contexte
  if (nameUpper.includes('BATTERIE') && !nameUpper.includes('PLUG')) {
    if (currentCategory === 'structure-montage' || currentCategory === 'batterie-plug-play') {
      // Si c'est une batterie lithium avec référence spécifique, vérifier
      if (nameUpper.includes('EL5') || nameUpper.includes('EL10') || nameUpper.includes('EH') || nameUpper.includes('ES')) {
        return { category: 'batteries-stockage', subcategory: null };
      }
    }
  }
  
  // Accessoires chauffage BEMCO -> pompe-chaleur / accessoires
  if (nameUpper.includes('BALLON TAMPON') || nameUpper.includes('BLOC DE MONTAGE')) {
    if (currentCategory !== 'pompe-chaleur' || currentSubcategory !== 'accessoires') {
      return { category: 'pompe-chaleur', subcategory: 'accessoires' };
    }
  }
  
  // Câbles, connecteurs, disjoncteurs -> structure-montage / electricite
  if (nameUpper.includes('CABLE') || nameUpper.includes('CONNECTEUR') || nameUpper.includes('DISJONCTEUR') || nameUpper.includes('MC4') || nameUpper.includes('GEWISS')) {
    if (currentCategory !== 'structure-montage' || currentSubcategory !== 'electricite') {
      return { category: 'structure-montage', subcategory: 'electricite' };
    }
  }
  
  // Visseries, rails, crochets -> structure-montage avec bonne sous-catégorie
  if (nameUpper.includes('BOULON') || nameUpper.includes('ECROU') || nameUpper.includes('VISSERIE') || nameUpper.includes('TIRAFOND')) {
    if (currentCategory !== 'structure-montage' || currentSubcategory !== 'visseries') {
      return { category: 'structure-montage', subcategory: 'visseries' };
    }
  }
  
  if (nameUpper.includes('RAIL') || nameUpper.includes('PROFILE') || nameUpper.includes('RACCORD') || nameUpper.includes('CLAME') || nameUpper.includes('CROCHET') || nameUpper.includes('FLAT') || nameUpper.includes('JOINT') || nameUpper.includes('CORNERE') || nameUpper.includes('PAQUE')) {
    if (currentCategory !== 'structure-montage' || (currentSubcategory !== 'toiture-inclinee' && currentSubcategory !== 'toiture-plane' && currentSubcategory !== 'visseries')) {
      // Déterminer la sous-catégorie selon le contexte
      if (nameUpper.includes('FLAT')) {
        return { category: 'structure-montage', subcategory: 'toiture-plane' };
      }
      return { category: 'structure-montage', subcategory: 'toiture-inclinee' };
    }
  }
  
  // Corriger structure-de-montage -> structure-montage
  if (currentCategory === 'structure-de-montage') {
    return { category: 'structure-montage', subcategory: currentSubcategory };
  }
  
  // Corriger electricite -> structure-montage / electricite
  if (currentCategory === 'electricite') {
    return { category: 'structure-montage', subcategory: 'electricite' };
  }
  
  // Corriger accessoires-chauffages -> pompe-chaleur / accessoires
  if (currentCategory === 'accessoires-chauffages') {
    return { category: 'pompe-chaleur', subcategory: 'accessoires' };
  }
  
  // Corriger pompe-a-chaleur-piscine -> pompe-chaleur / piscine
  if (currentCategory === 'pompe-a-chaleur-piscine') {
    return { category: 'pompe-chaleur', subcategory: 'piscine' };
  }
  
  // Batteries Huawei LUNA2000 -> batteries-stockage
  if (nameUpper.includes('LUNA2000') && nameUpper.includes('BATTERIE')) {
    if (currentCategory !== 'batteries-stockage') {
      return { category: 'batteries-stockage', subcategory: null };
    }
  }
  
  // Modules Huawei LUNA2000 -> batteries-stockage
  if (nameUpper.includes('POWER MODULE') && nameUpper.includes('LUNA2000')) {
    if (currentCategory !== 'batteries-stockage') {
      return { category: 'batteries-stockage', subcategory: null };
    }
  }
  
  // Support Huawei -> batteries-stockage (accessoire batterie)
  if (nameUpper.includes('SUPPORT') && nameUpper.includes('LUNA2000')) {
    if (currentCategory !== 'batteries-stockage') {
      return { category: 'batteries-stockage', subcategory: null };
    }
  }
  
  // Smart Meter, Smart Power Sensor, Smart Dongle -> onduleurs ou structure-montage selon contexte
  if (nameUpper.includes('SMART METER') || nameUpper.includes('SMART POWER SENSOR') || nameUpper.includes('SMART DONGLE')) {
    if (currentCategory === 'structure-montage') {
      return { category: 'onduleurs', subcategory: null };
    }
  }
  
  return null; // Pas de correction nécessaire
}

async function main() {
  console.log('🔧 Correction manuelle produit par produit\n');
  
  const products = await prisma.product.findMany({
    orderBy: { name: 'asc' },
  });
  
  let fixedBrand = 0;
  let fixedCategory = 0;
  let fixedName = 0;
  
  for (const product of products) {
    const updates: {
      brand?: string;
      category?: string;
      subcategory?: string | null;
      name?: string;
    } = {};
    
    // Correction spéciale : Power Optimizer 650 (nom exact) avec marque Photonsolar ou DEYE -> Huawei
    if (product.name === 'Power Optimizer 650' && (product.brand === 'DEYE' || product.brand === 'Photonsolar')) {
      updates.brand = 'Huawei';
      fixedBrand++;
      console.log(`  [${product.id}] Marque: "${product.brand}" → "Huawei" (Power Optimizer = Huawei)`);
    }
    
    // Correction de marque
    const correctBrand = detectBrandFromName(product.name, product.brand);
    if (correctBrand) {
      updates.brand = correctBrand;
      fixedBrand++;
      console.log(`  [${product.id}] Marque: "${product.brand}" → "${correctBrand}"`);
    }
    
    // Correction de catégorie
    const correctCat = fixCategory(product.name, product.category, product.subcategory);
    if (correctCat) {
      updates.category = correctCat.category;
      updates.subcategory = correctCat.subcategory;
      fixedCategory++;
      console.log(`  [${product.id}] Catégorie: "${product.category}"${product.subcategory ? ` / ${product.subcategory}` : ''} → "${correctCat.category}"${correctCat.subcategory ? ` / ${correctCat.subcategory}` : ''}`);
    }
    
    // Normalisation du nom (supprimer espaces multiples, trim)
    const normalizedName = product.name.replace(/\s+/g, ' ').trim();
    if (normalizedName !== product.name) {
      updates.name = normalizedName;
      fixedName++;
      console.log(`  [${product.id}] Nom normalisé`);
    }
    
    // Appliquer les mises à jour
    if (Object.keys(updates).length > 0) {
      await prisma.product.update({
        where: { id: product.id },
        data: updates,
      });
    }
  }
  
  console.log('\n✅ Correction terminée');
  console.log(`   Marques corrigées: ${fixedBrand}`);
  console.log(`   Catégories corrigées: ${fixedCategory}`);
  console.log(`   Noms normalisés: ${fixedName}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
