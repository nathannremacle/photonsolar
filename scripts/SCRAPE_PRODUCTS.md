# Script de synchronisation des produits (scrape-products.ts)

Ce document décrit en détail le script `scrape-products.ts`, qui récupère le catalogue produits depuis **photonsolar.be** (PrestaShop) et synchronise la base de données du site (Prisma/PostgreSQL). La structure des produits importés est alignée sur celle du catalogue d’origine (`src/data/products.ts`).

---

## Prérequis

- **Node.js** avec `tsx` (ou `ts-node`)
- Fichier **`.env`** à la racine du projet avec au minimum :
  - `DATABASE_URL` : même base que le site (Neon/PostgreSQL)
- Optionnel : `PRODUCTS_URL` (défaut : `https://www.photonsolar.be`), `SCRAPE_DELAY_MS` (défaut : 800), `SCRAPE_EXTRA_URLS`

---

## Lancement

```bash
# Scrape du site puis insertion des nouveaux produits (sans toucher aux existants)
npx tsx scripts/scrape-products.ts

# Charger les produits depuis le JSON local (pas de requêtes HTTP)
npx tsx scripts/scrape-products.ts --source=json

# Ré-éditer les produits déjà en base (mise à jour nom, marque, prix, SKU, description, specs)
npx tsx scripts/scrape-products.ts --update-existing
```

---

## Options en ligne de commande

| Option | Description |
|--------|--------------|
| `--source=json` | Ne pas scraper le site ; charger les produits depuis `data/products-photonsolar-be.json`. En l’absence de ce fichier, la liste est vide. |
| `--update-existing` | Pour chaque produit déjà présent en base (identifié par id, SKU ou nom), **mettre à jour** ses champs avec les données scrapées au lieu de l’ignorer. Permet de corriger marque, prix, SKU, description, spécifications après amélioration du parsing. |

---

## Déroulement du script (ordre des opérations)

1. **Connexion base**  
   Utilisation de `DATABASE_URL` via `dotenv/config`.

2. **Suppression des fiches techniques**  
   Pour **tous** les produits en base : suppression de `documentation.technicalSheet` (aucune fiche technique n’est ajoutée par le script).

3. **Correction des produits existants**  
   - Déduplication des URLs d’images (même image avec paramètres de requête différents).  
   - Mapping des catégories / sous-catégories : ex. `fixations` → `structure-montage`, `hybrid` → `hybride`, certains `autres` + `electricite` → `structure-montage` + `electricite`.

4. **Récupération de la liste de produits**  
   - **Source scrape (défaut)** : découverte des URLs produit via les pages catégories (voir ci-dessous), puis scrape de chaque fiche.  
   - **Source JSON** : chargement depuis `data/products-photonsolar-be.json`.  
   - En cas d’échec du scrape, repli automatique sur le JSON si disponible.

5. **Insertion ou mise à jour**  
   - Pour chaque produit : recherche d’un enregistrement existant (voir section « Détection des doublons »).  
   - Si trouvé et `--update-existing` : mise à jour des champs (nom, marque, prix, SKU, description, images, catégories, spécifications, etc.).  
   - Si trouvé et pas `--update-existing` : ignoré (compté comme doublon).  
   - Si non trouvé : création d’un nouveau produit.

6. **Résumé**  
   Affichage du nombre d’insérés, de mis à jour (si `--update-existing`), d’ignorés (doublons) et du total en base.

---

## Découverte des URLs produit

- **Pages parcourues** : liste fixe `CATEGORY_PAGE_URLS` (accueil, panneaux, onduleurs, hybrid, on-grid, micro-onduleur, batteries, plug-play, structure de montage, toiture inclinée/plane, visseries, pompe à chaleur, ballon thermodynamique, piscine, accessoires chauffage, borne de recharge, électricité).
- **Règle pour un lien produit** : URL dont le chemin se termine par `/\d+-*.html` (ex. `/10-panneaux-solaires/45-panneau-....html`), sur le domaine `photonsolar.be`.
- **URLs supplémentaires** : variable d’environnement `SCRAPE_EXTRA_URLS` (séparateurs : nouvelle ligne, virgule, point-virgule) ou fichier `data/scrape-extra-urls.txt` (une URL par ligne, lignes vides et `#` ignorés).

---

## Parsing d’une fiche produit (PrestaShop)

Chaque page HTML est chargée puis parsée avec **Cheerio**. Les données sont extraites dans l’ordre suivant.

### Fiche produit (data sheet)

La fonction `parseDataSheet($)` construit un objet clé/valeur à partir de :

- **Listes de définitions** : `dl.data-sheet`, `.product-features`, `[data-sheet]` — paires `dt` / `dd`.
- **Tableaux** : `table.data-sheet`, `.product-features`, `#product-details` — paires `th` / `td`.
- **Blocs label/valeur** : `.label` et son `.value` (ou élément suivant).

Ce résultat est utilisé pour la **marque**, le **SKU** et les **spécifications** (structure identique à l’ancien catalogue).

### Nom

- Premier `h1` (sélecteurs : `.product-name`, `[itemprop="name"]`, `.page-title`, etc., sinon premier `h1`).
- Normalisation : espaces multiples remplacés par un seul espace, trim.  
- Style conservé type « Type + Marque + Modèle » (ex. « Ballon Thermodynamique BEMCO Ecoline R 250L »).

### Référence (SKU)

- Priorité 1 : clé **« Référence »** ou **« Reference »** dans la data sheet.
- Puis : `.product-reference .value`, `[itemprop="sku"]`, `.reference`, ou cellule de tableau contenant « référence » + cellule suivante.

### Marque

- Priorité 1 : clé **« Marque »** dans la data sheet.
- Puis : `[itemprop="brand"]`, `.product-brand`, liens fabricant, etc.
- Fallback : recherche dans le bloc texte (`.product-features`, `#product-details`, `[data-sheet]`) du motif « Marque X ».
- Si rien n’est trouvé : **« Photonsolar »**.

### Catégorie et sous-catégorie

- **Depuis l’URL** : premier segment du chemin (ex. `10-panneaux-solaires`, `23-ballon-thermodynamique`) mappé via `URL_PATH_TO_CATEGORY` vers les slugs du site (ex. `panneaux-solaires`, `pompe-chaleur` + `ballon-thermodynamique`).
- **Fallback** : fil d’Ariane ou lien catégorie, puis `CATEGORY_MAP` pour le libellé texte.

### Prix

- Texte affiché : `.product-price`, `[itemprop="price"]`, `.current-price`, `.current-price-value` (nettoyage des caractères non numériques, virgule → point).
- Si absent ou invalide : attribut `data-product-price` (conteneur ou `.product-add-to-cart`), puis `input[name="product_price"]`.

### Description

- Blocs : `#description`, `#product-description`, `.product-description`, `[itemprop="description"]`, `.description`, `[id*="description"]`.
- Si vide : parcours des `.tab-pane` et `[role="tabpanel"]` ; le bloc de texte le plus long (> 50 caractères) est pris comme description.
- Normalisation : espaces multiples → un espace, trim.

### Images

- Image principale : `.product-cover img`, `.product-image img`, `[itemprop="image"]`, puis `.product-images img`.
- Toutes les images : `.product-images img`, `.thumbnails img` (`src` ou `data-src`), URLs résolues par rapport à l’URL de la page.
- Déduplication des URLs (sans paramètres de requête / hash) ; la première image dédupliquée est l’image principale.

### Identifiant produit (slug)

- `id` = `slugify(sku)` si SKU présent, sinon `slugify(name)`. Ce slug est l’identifiant du produit en base et dans l’URL du site (`/products/{id}`).

### Spécifications

- Objet `specifications` = data sheet complète (toutes les paires clé/valeur extraites). Structure identique à l’ancien catalogue ; aucune fiche technique n’est liée.

---

## Mapping catégories (URL → site)

Les segments de chemin des pages catégories sont mappés vers les catégories et sous-catégories du site, par exemple :

- `10-panneaux-solaires` → `panneaux-solaires`
- `11-onduleurs` → `onduleurs`
- `42--hybrid` → `onduleurs` / `hybride`
- `25-structure-de-montage` → `structure-montage`
- `33-toiture-incline` → `structure-montage` / `toiture-inclinee`
- `23-ballon-thermodynamique` → `pompe-chaleur` / `ballon-thermodynamique`
- etc.

Détail complet dans `URL_PATH_TO_CATEGORY` et `CATEGORY_MAP` dans le script.

---

## Détection des doublons et mise à jour

### Sans `--update-existing`

- Un produit est considéré comme **déjà présent** s’il existe en base avec :
  - le même **SKU** (si le produit scrapé a un SKU), ou
  - la même combinaison **nom + marque**.
- Dans ce cas, le produit est ignoré (pas d’insertion).

### Avec `--update-existing`

- Recherche d’un produit existant dans cet ordre :
  1. **Id (slug)** : `id` du produit scrapé (slugify(sku) ou slugify(name)).
  2. **SKU** : produit avec le même `sku`.
  3. **Nom** : produit avec le même `name`.
- Si un enregistrement est trouvé, il est **mis à jour** avec : name, brand, category, subcategory, price, originalPrice, sku, description, image, images, link, features, specifications, power, type, nominalPower, maxPower, capacity, heatingPower.  
- L’**id** en base n’est pas modifié (liens et stabilité des URLs conservés).

---

## Fichiers et variables d’environnement

| Fichier / variable | Rôle |
|--------------------|------|
| `scripts/scrape-products.ts` | Script principal (scrape + sync base). |
| `scripts/verify-products.ts` | Vérification que chaque produit en base respecte la structure des premiers produits (prix, SKU, description, image, specs/features). |
| `.env` | `DATABASE_URL` (obligatoire), optionnel : `PRODUCTS_URL`, `SCRAPE_DELAY_MS`, `SCRAPE_EXTRA_URLS`. |
| `data/products-photonsolar-be.json` | Fallback : liste de produits au format `ScrapedProduct[]` (utilisé si `--source=json` ou si le scrape échoue). |
| `data/scrape-extra-urls.txt` | URLs produit supplémentaires (une par ligne). |

---

## Structure des données en base

Les produits créés ou mis à jour respectent le schéma Prisma `Product`. Le script ne remplit pas : fiches techniques (`documentation.technicalSheet`), `technicalDescription`, champs physiques non extraits (poids, dimensions, garantie, etc.), ni champs optionnels non présents sur la fiche (voltage, mpptCount, etc.). Ces champs restent à `null` ou valeur par défaut. Les **spécifications** proviennent intégralement de la data sheet PrestaShop (même structure que l’ancien catalogue).

---

## Vérification des produits (verify-products.ts)

Un script dédié permet de **vérifier que chaque produit en base est “complet”** au sens des premiers produits du catalogue (`src/data/products.ts`) : prix, SKU, description, image, spécifications ou features, et marque non générique.

**Commande :**

```bash
# Rapport lisible en console (produits incomplets + résumé par critère manquant)
npx tsx scripts/verify-products.ts

# Sortie JSON (total, ok, incomplete, détail par produit)
npx tsx scripts/verify-products.ts --json
```

**Critères vérifiés :**

| Critère | Attendu |
|--------|--------|
| `price` | Prix renseigné et > 0 |
| `sku` | Référence / SKU non vide |
| `description` | Texte présent, longueur ≥ 30 caractères |
| `image` | Au moins une image (principale ou galerie) |
| `specsOrFeatures` | Au moins des spécifications (clé/valeur) ou des points forts (features) |
| Marque | Avertissement si marque = "Photonsolar" (possible fallback si non trouvée sur la page) |

Recommandation : lancer `verify-products.ts` après une synchro (scrape ou `--update-existing`) pour repérer les fiches à compléter à la main ou à re-scraper si des infos manquent sur le site.

---

## En cas de problème

- **Aucun produit scrapé** : vérifier la connexion réseau et que `PRODUCTS_URL` pointe vers le bon site. Le script peut basculer sur `data/products-photonsolar-be.json` s’il existe.
- **Marque ou SKU incorrects** : relancer avec `--update-existing` après avoir vérifié que le parsing PrestaShop (data sheet, sélecteurs) correspond bien au HTML des fiches produit.
- **Erreur base** : vérifier `DATABASE_URL` dans `.env` et que la base est accessible (ex. Neon).
- **Produits “incomplets”** : lancer `npx tsx scripts/verify-products.ts` pour voir quels champs manquent ; compléter en admin ou améliorer le parsing puis relancer `--update-existing`.

Pour ré-éditer tous les produits déjà importés avec les dernières règles de parsing (nom, marque, prix, SKU, description, spécifications), utiliser :

```bash
npx tsx scripts/scrape-products.ts --update-existing
```
