# Gestion des Images - Photon Solar

## 📸 Logo Photon Solar

Le logo est maintenant utilisé dans la Navbar :
- **Emplacement** : `public/images/logo.jpg`
- **Utilisation** : Composant `Navbar.tsx` utilise `next/image` pour optimiser le chargement
- **Taille** : 40x40 pixels dans la navbar

## 🖼️ Gestion des Images Produits

### Structure dans `products.ts`

Chaque produit peut avoir deux types d'images :

1. **`image?: string`** - Image principale (pour compatibilité avec l'ancien système)
   - Exemple : `image: "/images/products/deye-sun-3-6kw.png"`

2. **`images?: string[]`** - Tableau d'images multiples pour la galerie
   - Exemple : 
   ```typescript
   images: [
     "/images/products/onduleurs/deye-sun-3-6kw.png",
     "/images/products/onduleurs/deye-sun-3-6kw-2.png",
   ]
   ```

### Exemple : Produit `deye-sun-3-6kw`

```typescript
{
  id: "deye-sun-3-6kw",
  image: "/images/products/deye-sun-3-6kw.jpg", // Image principale
  images: [
    "/images/products/deye-sun-3-6kw.jpg",      // Image 1
    "/images/products/deye-sun-3-6kw-2.jpg",    // Image 2
    "/images/products/deye-sun-3-6kw-3.jpg",    // Image 3
  ],
  // ... autres propriétés
}
```

### Logique de Priorité

Dans la page produit (`src/app/products/[id]/page.tsx`), la logique est la suivante :

```typescript
const productImages = product.images && product.images.length > 0
  ? product.images                    // ✅ Priorité 1 : Utilise images[] si disponible
  : product.image
  ? [product.image]                   // ✅ Priorité 2 : Utilise image si disponible
  : ["/placeholder-product.jpg"];     // ✅ Priorité 3 : Placeholder par défaut
```

### Structure des Dossiers

```
public/
  └── images/
      ├── logo.jpg                    # Logo Photon Solar
      └── products/
          ├── deye-sun-3-6kw.jpg      # Image principale
          ├── deye-sun-3-6kw-2.jpg    # Image 2
          ├── deye-sun-3-6kw-3.jpg    # Image 3
          └── ...                      # Autres produits
```

### Comment Ajouter des Images à un Produit

#### Option 1 : Une seule image (ancien système)
```typescript
{
  id: "mon-produit",
  image: "/images/products/mon-produit.jpg",
  // ...
}
```

#### Option 2 : Plusieurs images (recommandé)
```typescript
{
  id: "mon-produit",
  image: "/images/products/mon-produit.jpg", // Image principale (optionnel)
  images: [
    "/images/products/mon-produit.jpg",
    "/images/products/mon-produit-2.jpg",
    "/images/products/mon-produit-3.jpg",
  ],
  // ...
}
```

### Affichage dans la Page Produit

1. **Image principale** : Affiche l'image sélectionnée en grand format
2. **Galerie de miniatures** : Affiche toutes les images en miniatures cliquables
   - Si plusieurs images : galerie visible
   - Si une seule image : galerie masquée
   - Clic sur une miniature : change l'image principale

### Optimisation avec Next.js Image

Toutes les images utilisent le composant `next/image` qui :
- ✅ Optimise automatiquement les images
- ✅ Lazy loading par défaut
- ✅ Responsive avec `sizes`
- ✅ Formats modernes (WebP, AVIF) si supportés

### Exemple Complet

```typescript
// Dans src/data/products.ts
{
  id: "deye-sun-3-6kw",
  name: "Deye SUN-3-6KW SG04LP1-BE Monophasé",
  brand: "DEYE",
  // ...
  image: "/images/products/deye-sun-3-6kw.jpg", // Image principale
  images: [
    "/images/products/deye-sun-3-6kw.jpg",      // Vue de face
    "/images/products/deye-sun-3-6kw-2.jpg",    // Vue de côté
    "/images/products/deye-sun-3-6kw-3.jpg",    // Vue arrière
    "/images/products/deye-sun-3-6kw-4.jpg",    // Détails
  ],
  // ...
}
```

### Notes Importantes

1. **Format des chemins** : Toujours commencer par `/images/` (dossier public)
2. **Noms de fichiers** : Utiliser des noms cohérents avec l'ID du produit
3. **Extensions** : Supporte `.jpg`, `.jpeg`, `.png`, `.webp`
4. **Taille recommandée** : 
   - Image principale : 800x800px minimum
   - Miniatures : Générées automatiquement par Next.js
5. **Placeholder** : Si aucune image n'est fournie, un placeholder gris s'affiche

