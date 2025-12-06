# 📸 Guide : Où mettre les images des produits

## 📁 Structure des dossiers

Toutes les images des produits doivent être placées dans le dossier `public/images/products/` avec une sous-structure par catégorie :

```
public/
  └── images/
      ├── logo.jpg                    # Logo Photon Solar
      └── products/
          ├── onduleurs/              # Images pour les onduleurs
          │   ├── deye-sun-3-6kw.jpg
          │   ├── deye-sun-3-6kw-2.jpg
          │   ├── deye-sun-3-6kw-3.jpg
          │   ├── deye-sun-3kw.jpg
          │   └── ...
          │
          ├── panneaux-solaires/      # Images pour les panneaux solaires
          │   ├── elitec-xmax-560-bifacial.jpg
          │   ├── elitec-xmax-560-bifacial-2.jpg
          │   └── ...
          │
          ├── batteries-stockage/    # Images pour les batteries
          │   ├── huawei-luna-5kwh.jpg
          │   └── ...
          │
          ├── structure-montage/     # Images pour les structures
          │   ├── mounting-inclined.jpg
          │   └── ...
          │
          ├── borne-recharge/        # Images pour les bornes de recharge
          │   ├── smappee-ev-wall.jpg
          │   └── ...
          │
          ├── batterie-plug-play/     # Images pour les batteries plug & play
          │   ├── plug-play-battery.jpg
          │   └── ...
          │
          ├── pompe-chaleur/         # Images pour les pompes à chaleur
          │   ├── heat-pump-air.jpg
          │   └── ...
          │
          ├── poeles-cheminee/       # Images pour les poêles et cheminées
          │   ├── wood-stove.jpg
          │   └── ...
          │
          └── climatiseur/           # Images pour les climatiseurs
              ├── air-conditioner-split.jpg
              └── ...
```

## 🎨 Pictogrammes dans la Navigation

Les pictogrammes sont maintenant affichés dans la **barre de navigation** (menu principal) à côté de chaque type de produit :

| Type de Produit | Pictogramme | Couleur |
|-----------------|-------------|---------|
| **Panneaux Solaires** | ☀️ Sun | Orange |
| **Onduleurs** | ⚡ Zap | Jaune |
| **Batteries & Stockage** | 🔋 Battery | Bleu |
| **Structure de Montage** | 🔧 Wrench | Gris |
| **Borne de Recharge** | 🔌 Plug | Vert |
| **Pompe à Chaleur** | 🌡️ Thermometer | Rouge |
| **Batterie Plug & Play** | 🔋 BatteryCharging | Violet |
| **Poêles & Cheminée** | 🔥 Flame | Orange foncé |
| **Climatiseur** | 💨 Wind | Cyan |

## 📝 Comment ajouter des images à un produit

### Exemple : Produit `deye-sun-3-6kw` (Onduleur)

1. **Placer les images** dans le bon dossier :
   ```
   public/images/products/onduleurs/
     ├── deye-sun-3-6kw.jpg      (Image principale)
     ├── deye-sun-3-6kw-2.jpg    (Image 2)
     └── deye-sun-3-6kw-3.jpg    (Image 3)
   ```

2. **Mettre à jour** `src/data/products.ts` :
   ```typescript
   {
     id: "deye-sun-3-6kw",
     name: "Deye SUN-3-6KW SG04LP1-BE Monophasé",
     category: "onduleurs",
     // ...
     image: "/images/products/onduleurs/deye-sun-3-6kw.jpg", // Image principale
     images: [
       "/images/products/onduleurs/deye-sun-3-6kw.jpg",
       "/images/products/onduleurs/deye-sun-3-6kw-2.jpg",
       "/images/products/onduleurs/deye-sun-3-6kw-3.jpg",
     ],
     // ...
   }
   ```

### Exemple : Produit `elitec-xmax-560-bifacial` (Panneau Solaire)

1. **Placer les images** :
   ```
   public/images/products/panneaux-solaires/
     ├── elitec-xmax-560-bifacial.jpg
     ├── elitec-xmax-560-bifacial-2.jpg
     └── elitec-xmax-560-bifacial-3.jpg
   ```

2. **Mettre à jour** `products.ts` :
   ```typescript
   {
     id: "elitec-xmax-560-bifacial",
     category: "panneaux-solaires",
     images: [
       "/images/products/panneaux-solaires/elitec-xmax-560-bifacial.jpg",
       "/images/products/panneaux-solaires/elitec-xmax-560-bifacial-2.jpg",
       "/images/products/panneaux-solaires/elitec-xmax-560-bifacial-3.jpg",
     ],
   }
   ```

## 🔄 Logique d'affichage

1. **Si `images[]` existe** → Affiche la galerie d'images
2. **Sinon, si `image` existe** → Affiche l'image unique
3. **Sinon** → Affiche un placeholder gris

## 📋 Règles de nommage

- **Format** : `{id-produit}.jpg` pour l'image principale
- **Images multiples** : `{id-produit}-2.jpg`, `{id-produit}-3.jpg`, etc.
- **Extensions supportées** : `.jpg`, `.jpeg`, `.png`, `.webp`
- **Taille recommandée** : 800x800px minimum (carré)

## ✅ Mapping Catégorie → Dossier

| Catégorie (dans products.ts) | Dossier des images |
|------------------------------|-------------------|
| `onduleurs` | `public/images/products/onduleurs/` |
| `panneaux-solaires` | `public/images/products/panneaux-solaires/` |
| `batteries-stockage` | `public/images/products/batteries-stockage/` |
| `structure-montage` | `public/images/products/structure-montage/` |
| `borne-recharge` | `public/images/products/borne-recharge/` |
| `batterie-plug-play` | `public/images/products/batterie-plug-play/` |
| `pompe-chaleur` | `public/images/products/pompe-chaleur/` |
| `poeles-cheminee` | `public/images/products/poeles-cheminee/` |
| `climatiseur` | `public/images/products/climatiseur/` |

## 🎯 Exemple complet

Pour le produit `deye-sun-3-6kw` :

1. **Placer les fichiers** :
   ```
   public/images/products/onduleurs/deye-sun-3-6kw.jpg
   public/images/products/onduleurs/deye-sun-3-6kw-2.jpg
   public/images/products/onduleurs/deye-sun-3-6kw-3.jpg
   ```

2. **Dans `products.ts`** :
   ```typescript
   {
     id: "deye-sun-3-6kw",
     category: "onduleurs",
     images: [
       "/images/products/onduleurs/deye-sun-3-6kw.jpg",
       "/images/products/onduleurs/deye-sun-3-6kw-2.jpg",
       "/images/products/onduleurs/deye-sun-3-6kw-3.jpg",
     ],
   }
   ```

3. **Résultat** :
   - ✅ Les images s'affichent dans la galerie produit
   - ✅ Le pictogramme ⚡ s'affiche dans le menu navigation (barre des types)

## 📌 Notes importantes

- Les dossiers sont déjà créés et prêts à l'emploi
- Les pictogrammes dans la navigation sont automatiques selon la catégorie
- Les images produits sont optionnelles (placeholder si absentes)
- Utilisez des chemins relatifs commençant par `/images/products/`
