# 🚀 Guide de Démarrage Rapide - Panneau Admin

## Accès rapide

1. **Démarrer le serveur** :
   ```bash
   npm run dev
   ```

2. **Accéder au panneau admin** :
   - Ouvrez votre navigateur
   - Allez sur : `http://localhost:3000/admin`
   - Mot de passe : `admin123`

## Première utilisation

### 1. Changer le mot de passe
- Connectez-vous
- Allez dans **Paramètres** (icône ⚙️)
- Entrez un nouveau mot de passe
- Sauvegardez

### 2. Ajouter un produit
- Cliquez sur **"Gestion des Produits"**
- Cliquez sur **"Ajouter un produit"**
- Remplissez au minimum : Nom, Marque, Catégorie
- Cliquez sur **"Enregistrer"**

### 3. Uploader une image
- Cliquez sur **"Gestion des Images"**
- Cliquez sur **"Uploader des images"**
- Sélectionnez vos images
- Une fois uploadées, survolez l'image et cliquez sur **"Copier URL"**
- Utilisez cette URL dans le formulaire de produit

### 4. Modifier le contenu du site
- Cliquez sur **"Contenu du Site"**
- Développez les sections que vous voulez modifier
- Modifiez les textes
- Cliquez sur **"Sauvegarder"** en haut

## Fonctionnalités principales

### ✅ Gestion des Produits
- Ajouter, modifier, supprimer des produits
- Gérer les images, descriptions, spécifications
- Recherche et filtrage

### ✅ Gestion des Images
- Upload multiple d'images
- Galerie avec aperçu
- Suppression individuelle ou en masse
- Copie d'URL pour utilisation rapide

### ✅ Contenu du Site
- Métadonnées (titre, description, mots-clés)
- Bannière Hero
- Slides Hero (carrousel)
- Promotions

### ✅ Paramètres
- Changement de mot de passe
- Configuration du site

## Astuces

💡 **Images** : Les images sont automatiquement sauvegardées dans `/public/images/products/`

💡 **Produits** : Les produits sont sauvegardés dans `data/products.json` et synchronisés avec `src/data/products.ts`

💡 **Recherche** : Utilisez la barre de recherche pour trouver rapidement un produit ou une image

💡 **Sauvegarde** : N'oubliez pas de cliquer sur "Sauvegarder" après chaque modification dans la section Contenu

## Problèmes courants

**Je ne peux pas me connecter**
- Vérifiez que le mot de passe est correct (par défaut : `admin123`)
- Videz le cache du navigateur

**Les images ne s'uploadent pas**
- Vérifiez la taille (max 10MB)
- Vérifiez le format (JPG, PNG, GIF, WebP)
- Vérifiez les permissions du dossier `public/images/`

**Les modifications ne s'affichent pas**
- Rafraîchissez la page (F5)
- Vérifiez que vous avez bien cliqué sur "Sauvegarder"
- Redémarrez le serveur si nécessaire

---

Pour plus de détails, consultez `ADMIN_PANEL_README.md`

