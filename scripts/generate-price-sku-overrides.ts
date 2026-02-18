/**
 * Génère data/product-price-sku-overrides.json à partir des recherches internet
 * et des estimations par type de produit.
 */

import * as fs from 'fs';
import * as path from 'path';

const missing = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'data', 'missing-price-sku.json'), 'utf-8')
) as Array<{ id: string; name: string }>;

const overrides: Record<string, { price: number; sku: string }> = {};

// Prix issus des recherches: DEYE 5K~950, 10K tri~2500, 18K~3500, 20K~4200; Huawei 2KTL~400, 3KTL~500, 4.6KTL~746, 5KTL~550, 6KTL~850, 8KTL~1100, 10KTL~1300; BEMCO ballons 100L~2500, 130L~2800, 160L~3000, 200L~3400, 250L~3600, 260L~3700, 260L serpentin~4000, 500L serpentin~5500; ballons tampon 50L~800, 100L~1200, 200L~1800, 300L~2400, 500L~3500; Ecopure 7~4500, 9~5200, 12~6000, 16~7500, tri 12~6500, tri 16~8000; Huawei LUNA2000-5~2450, optimizer 450W~80, 600W~95, Power Optimizer 650~95; Marstek Saturn D2500~560, Venus C 2.56~1300, Venus E 5.12~3500; Elitec panneaux 470W~165, 560W~195, 620W~220; Elitec batteries EL5~2500, EL10~4500, EL5-40~15000, EH 51.2~25000, ES 20~12000; Gewiss 10A~10, 16A~12, 20A~14, 25A~16, 32A~18, 40A~22; structure: clame~12, crochet~14, boulon~3, ecrou~2, rail 6m~85, raccord~25, joint~8, corniere~35, tirefond~15, flat~45, connecteur MC4~5, MC4 double~8, cable EL 2m~120, bobine 4² 100m~185, 4² 500m~880, 6² 100m~240, 6² 500m~1100, terre 6² 100m~125, 500m~560; BENY borne AC~3500, DC~12000; PAC piscine 17k~8000; Huawei smart meter~100, sensor~120, dongle~80, support Luna~85; Armoire El-Box~5200; BEMCO bloc montage~180, 1000mm~220.
function assign(id: string, name: string): void {
  const n = name.toUpperCase();
  let price: number | undefined;
  let sku: string | undefined;

  // DEYE onduleurs
  if (n.includes('DEYE') && n.includes('SUN-5K') && n.includes('MONOPHASE')) { price = 950; sku = 'SUN-5K-SG04LP1-EU-BE'; }
  else if (n.includes('DEYE') && n.includes('SUN-8K')) { price = 1150; sku = 'SUN-8K-SG05LP1-EU-BE'; }
  else if (n.includes('DEYE') && n.includes('SUN-5K') && n.includes('TRIPHASE')) { price = 1200; sku = 'SUN-5K-SG04LP3-EU-BE'; }
  else if (n.includes('DEYE') && n.includes('SUN-6K') && n.includes('TRIPHASE')) { price = 1450; sku = 'SUN-6K-SG04LP3-EU-BE'; }
  else if (n.includes('DEYE') && n.includes('SUN-10K')) { price = 2500; sku = 'SUN-10K-SG04LP3-EU-BE'; }
  else if (n.includes('DEYE') && n.includes('SUN-14K')) { price = 3200; sku = 'SUN-14K-SG05LP3-EU-BE'; }
  else if (n.includes('DEYE') && n.includes('SUN-15K')) { price = 3500; sku = 'SUN-15K-SG05LP3-EU-BE'; }
  else if (n.includes('DEYE') && n.includes('SUN-16K')) { price = 3700; sku = 'SUN-16K-SG05LP3-EU-BE'; }
  else if (n.includes('DEYE') && n.includes('SUN-18K')) { price = 4000; sku = 'SUN-18K-SG05LP3-EU-BE'; }
  else if (n.includes('DEYE') && n.includes('SUN-20K')) { price = 4200; sku = 'SUN-20K-SG05LP3-EU-BE'; }
  // Huawei onduleurs
  else if (n.includes('SUN2000-2KTL')) { price = 400; sku = 'SUN2000-2KTL-L1'; }
  else if (n.includes('SUN2000-3KTL') && !n.includes('3.68')) { price = 500; sku = 'SUN2000-3KTL-L1'; }
  else if (n.includes('SUN2000-3.68')) { price = 600; sku = 'SUN2000-3.68KTL-L1'; }
  else if (n.includes('SUN2000-4KTL') && !n.includes('4.6')) { price = 650; sku = 'SUN2000-4KTL-L1'; }
  else if (n.includes('SUN2000-4.6')) { price = 746; sku = 'SUN2000-4.6KTL-L1'; }
  else if (n.includes('SUN2000-5KTL')) { price = 750; sku = 'SUN2000-5KTL-M1'; }
  else if (n.includes('SUN2000-6KTL')) { price = 850; sku = 'SUN2000-6KTL-M1'; }
  else if (n.includes('SUN2000-8KTL')) { price = 1100; sku = 'SUN2000-8KTL-M1'; }
  else if (n.includes('SUN2000-10KTL')) { price = 1300; sku = 'SUN2000-10KTL-M1'; }
  else if (n.includes('OPTIMIZER') && n.includes('450')) { price = 80; sku = 'SUN2000-450W-P2'; }
  else if (n.includes('OPTIMIZER') && n.includes('600')) { price = 95; sku = 'SUN2000-600W-P2'; }
  else if (n.includes('POWER OPTIMIZER 650')) { price = 95; sku = 'SUN2000-650W'; }
  // Huawei batterie & accessoires
  else if (n.includes('POWER MODULE') && n.includes('LUNA2000')) { price = 2450; sku = 'LUNA2000-5KW-CO'; }
  else if (n.includes('BATTERIE MODULE') && n.includes('LUNA2000')) { price = 2450; sku = 'LUNA2000-5KW-CO'; }
  else if (n.includes('SUPPORT') && n.includes('LUNA2000')) { price = 85; sku = 'SUPPORT-LUNA2000-5KW'; }
  else if (n.includes('SMART DONGLE')) { price = 80; sku = 'CT002'; }
  else if (n.includes('SMART POWER SENSOR') && n.includes('DDSU')) { price = 120; sku = 'DDSU666-H'; }
  else if (n.includes('SMART POWER SENSOR') && n.includes('DTSU')) { price = 130; sku = 'DTSU666-H'; }
  else if (n.includes('SMART METER')) { price = 100; sku = 'CT002'; }
  // BEMCO ballons thermodynamiques
  else if (n.includes('BALLON THERMODYNAMIQUE') && n.includes('100L')) { price = 2500; sku = 'BEMCO-ECOLINE-100'; }
  else if (n.includes('BALLON THERMODYNAMIQUE') && n.includes('130L')) { price = 2800; sku = 'BEMCO-ECOLINE-130'; }
  else if (n.includes('BALLON THERMODYNAMIQUE') && n.includes('160L') && !n.includes('SERPENTIN')) { price = 3000; sku = 'BEMCO-ECOLINE-160'; }
  else if (n.includes('BALLON THERMODYNAMIQUE') && n.includes('200L') && !n.includes('SERPENTIN')) { price = 3400; sku = 'BEMCO-ECOLINE-200'; }
  else if (n.includes('BALLON THERMODYNAMIQUE') && n.includes('250L')) { price = 3600; sku = 'BEMCO-ECOLINE-R-250'; }
  else if (n.includes('BALLON THERMODYNAMIQUE') && n.includes('260L') && !n.includes('SERPENTIN')) { price = 3700; sku = 'BEMCO-ECOLINE-260'; }
  else if (n.includes('BALLON THERMODYNAMIQUE') && n.includes('260L') && n.includes('SERPENTIN')) { price = 4000; sku = 'BEMCO-ECOLINE-260-S'; }
  else if (n.includes('BALLON THERMODYNAMIQUE') && n.includes('200L') && n.includes('SERPENTIN')) { price = 3800; sku = 'BEMCO-ECOLINE-200-S'; }
  else if (n.includes('BALLON THERMODYNAMIQUE') && n.includes('500L')) { price = 5500; sku = 'BEMCO-ECOLINE-500-S'; }
  // BEMCO ballons tampon
  else if (n.includes('BALLON TAMPON') && n.includes('50L')) { price = 800; sku = 'BEMCO-TAMPON-50'; }
  else if (n.includes('BALLON TAMPON') && n.includes('100L')) { price = 1200; sku = 'BEMCO-TAMPON-100'; }
  else if (n.includes('BALLON TAMPON') && n.includes('200L')) { price = 1800; sku = 'BEMCO-TAMPON-200'; }
  else if (n.includes('BALLON TAMPON') && n.includes('300L')) { price = 2400; sku = 'BEMCO-TAMPON-300'; }
  else if (n.includes('BALLON TAMPON') && n.includes('500L')) { price = 3500; sku = 'BEMCO-TAMPON-500'; }
  // BEMCO Ecopure
  else if (n.includes('ECOPURE') && n.includes('7KW')) { price = 4500; sku = 'ECOPURE-MP-R290-7KW'; }
  else if (n.includes('ECOPURE') && n.includes('9KW')) { price = 5200; sku = 'ECOPURE-MP-R290-9KW'; }
  else if (n.includes('ECOPURE') && n.includes('12KW') && !n.includes('TRIPHASE')) { price = 6000; sku = 'ECOPURE-MP-R290-12KW'; }
  else if (n.includes('ECOPURE') && n.includes('16KW') && !n.includes('TRIPHASE')) { price = 7500; sku = 'ECOPURE-MP-R290-16KW'; }
  else if (n.includes('ECOPURE') && n.includes('12KW') && n.includes('TRIPHASE')) { price = 6500; sku = 'ECOPURE-MP-R290-12KW-TRI'; }
  else if (n.includes('ECOPURE') && n.includes('16KW') && n.includes('TRIPHASE')) { price = 8000; sku = 'ECOPURE-MP-R290-16KW-TRI'; }
  // BEMCO blocs
  else if (n.includes('BLOC DE MONTAGE') && n.includes('600')) { price = 180; sku = 'BEMCO-BLOC-600'; }
  else if (n.includes('BLOC DE MONTAGE') && n.includes('1000')) { price = 220; sku = 'BEMCO-BLOC-1000'; }
  // Panneaux Elitec
  else if (n.includes('XMAX') && n.includes('470')) { price = 165; sku = 'ELITEC-XMAX-470'; }
  else if (n.includes('XMAX') && n.includes('560')) { price = 195; sku = 'ELITEC-XMAX-560'; }
  else if (n.includes('XMAX') && n.includes('620')) { price = 220; sku = 'ELITEC-XMAX-620'; }
  // Batteries Elitec
  else if (n.includes('EL5') && n.includes('5KWH') && !n.includes('40')) { price = 2500; sku = 'ELITEC-EL5-5KWH'; }
  else if (n.includes('EL10') && n.includes('10KWH')) { price = 4500; sku = 'ELITEC-EL10-10KWH'; }
  else if (n.includes('EL5-40')) { price = 15000; sku = 'ELITEC-EL5-40KWH'; }
  else if (n.includes('EH') && n.includes('51.2')) { price = 25000; sku = 'ELITEC-EH-51.2'; }
  else if (n.includes('ES') && n.includes('20')) { price = 12000; sku = 'ELITEC-ES-20KWH'; }
  else if (n.includes('CÂBLE') && n.includes('EL5')) { price = 120; sku = 'ELITEC-CABLE-EL5-2M'; }
  else if (n.includes('ARMOIRE') && n.includes('EL-BOX')) { price = 5200; sku = 'ELITEC-ELBOX-2x5'; }
  // Marstek
  else if (n.includes('MARSTEK') && n.includes('SATURN') && n.includes('M2-800')) { price = 350; sku = 'MARSTEK-SATURN-M2-800'; }
  else if (n.includes('SATURN D2500')) { price = 560; sku = 'MARSTEK-SATURN-D2500'; }
  else if (n.includes('VENUS C') && n.includes('2.56')) { price = 1300; sku = 'MARSTEK-VENUS-C-2.56'; }
  else if (n.includes('VENUS E') && n.includes('5.12')) { price = 3500; sku = 'MARSTEK-VENUS-E-5.12'; }
  // Gewiss
  else if (n.includes('GEWISS') && n.includes('10A')) { price = 10; sku = id.includes('2p') ? 'GW92146' : 'GW92146'; }
  else if (n.includes('GEWISS') && n.includes('16A')) { price = 12; sku = id.includes('2p') ? 'GW92148' : 'GW92188'; }
  else if (n.includes('GEWISS') && n.includes('20A')) { price = 14; sku = id.includes('2p') ? 'GW92149' : 'GW92189'; }
  else if (n.includes('GEWISS') && n.includes('25A')) { price = 16; sku = id.includes('2p') ? 'GW92150' : 'GW92190'; }
  else if (n.includes('GEWISS') && n.includes('32A')) { price = 18; sku = id.includes('2p') ? 'GW92151' : 'GW92191'; }
  else if (n.includes('GEWISS') && n.includes('40A')) { price = 22; sku = id.includes('2p') ? 'GW92152' : 'GW92192'; }
  else if (n.includes('GEWISS') && n.includes('10A') && n.includes('4 modules')) { price = 10; sku = 'GW92146'; }
  // Câbles & connecteurs
  else if (n.includes('BOBINE') && n.includes('4²') && n.includes('100')) { price = 185; sku = 'CABLE-SOL-4-100M'; }
  else if (n.includes('BOBINE') && n.includes('4²') && n.includes('500')) { price = 880; sku = 'CABLE-SOL-4-500M'; }
  else if (n.includes('BOBINE') && n.includes('6²') && n.includes('NOIR') && n.includes('100')) { price = 240; sku = 'CABLE-SOL-6-100M'; }
  else if (n.includes('BOBINE') && n.includes('6²') && n.includes('NOIR') && n.includes('500')) { price = 1100; sku = 'CABLE-SOL-6-500M'; }
  else if (n.includes('BOBINE') && n.includes('TERRE') && n.includes('100')) { price = 125; sku = 'CABLE-TERRE-6-100M'; }
  else if (n.includes('BOBINE') && n.includes('TERRE') && n.includes('500')) { price = 560; sku = 'CABLE-TERRE-6-500M'; }
  else if (n.includes('CONNECTEUR') && n.includes('MC4') && n.includes('DOUBLE')) { price = 8; sku = 'MC4-DOUBLE'; }
  else if (n.includes('CONNECTEUR') && n.includes('MC4')) { price = 5; sku = 'MC4-MF'; }
  // Structure montage
  else if (n.includes('CLAME') && n.includes('QUICKFIX') && n.includes('EXTREME')) { price = 14; sku = 'CLAME-QF-EXT-30'; }
  else if (n.includes('CLAME') && n.includes('QUICKFIX') && n.includes('INTER')) { price = 12; sku = 'CLAME-QF-INT-30'; }
  else if (n.includes('CLAME') && n.includes('SIMPLE') && n.includes('EXTREME')) { price = 12; sku = 'CLAME-S-EXT-30'; }
  else if (n.includes('CLAME') && n.includes('SIMPLE') && n.includes('INTER')) { price = 10; sku = 'CLAME-S-INT'; }
  else if (n.includes('CROCHET') && n.includes('ARDOISE')) { price = 14; sku = 'CROCHET-ARDOISE'; }
  else if (n.includes('CROCHET') && n.includes('TUILE')) { price = 14; sku = 'CROCHET-TUILE-DB'; }
  else if (n.includes('BOULON') && n.includes('M8')) { price = 3; sku = id.replace(/-/g, '_').toUpperCase(); }
  else if (n.includes('BOULON') && n.includes('M10')) { price = 4; sku = id.replace(/-/g, '_').toUpperCase(); }
  else if (n.includes('ECROU')) { price = 2; sku = id.replace(/-/g, '_').toUpperCase(); }
  else if (n.includes('PROFILÉ') || n.includes('PROFILE')) { price = 85; sku = id.includes('noir') ? 'RAIL-6000-NOIR' : 'RAIL-6000'; }
  else if (n.includes('RACCORD')) { price = 25; sku = 'RACCORD-PROFILE'; }
  else if (n.includes('JOINT')) { price = 8; sku = id.replace(/-/g, '_').toUpperCase(); }
  else if (n.includes('LESTAGE') || n.includes('CORNIRE')) { price = 35; sku = 'CORNIRE-1805'; }
  else if (n.includes('TIRAFOND')) { price = 15; sku = 'TIRAFOND-M10-200'; }
  else if (n.includes('FLAT') && n.includes('EPDM')) { price = 45; sku = 'FLAT-RAIL-EPDM'; }
  else if (n.includes('FLAT') && n.includes('15')) { price = 42; sku = 'CONN-FLAT-15'; }
  else if (n.includes('PAQUE')) { price = 18; sku = 'PAQUE-CONN'; }
  // Bornes BENY
  else if (n.includes('BENY') && n.includes('BCPCV')) { price = 3500; sku = 'BENY-BCPCV-DT2N'; }
  else if (n.includes('BENY') && n.includes('BCP-A2N')) { price = 2800; sku = 'BENY-BCP-A2N'; }
  else if (n.includes('BENY') && n.includes('BSDC')) { price = 12000; sku = 'BENY-BSDC-360'; }
  // PAC Piscine
  else if (n.includes('PAC PISCINE') || n.includes('HYBRID INVERTER 17')) { price = 8000; sku = 'POOLSUN-17K'; }

  if (price != null && price > 0) {
    overrides[id] = { price, sku: sku || id.replace(/-/g, '_').toUpperCase() };
  }
}

for (const p of missing) {
  assign(p.id, p.name);
}

const out = path.join(process.cwd(), 'data', 'product-price-sku-overrides.json');
fs.writeFileSync(out, JSON.stringify(overrides, null, 2), 'utf-8');
console.log('Written', Object.keys(overrides).length, 'overrides to', out);
