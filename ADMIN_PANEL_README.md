# Panneau d'Administration - Photon Solar

## 🎯 Vue d'ensemble

Le panneau d'administration permet de gérer tout le contenu du site de manière intuitive et efficace. Il offre une interface complète pour :

- ✅ Gérer les produits (ajouter, modifier, supprimer)
- ✅ Gérer les images (uploader, organiser, supprimer)
- ✅ Modifier le contenu du site (textes, sections, métadonnées)
- ✅ Configurer les paramètres du site

## 🔐 Accès au panneau

1. Accédez à `/admin` dans votre navigateur
2. Mot de passe par défaut : `admin123`
3. **⚠️ IMPORTANT** : Changez le mot de passe en production !

### Changer le mot de passe

1. Connectez-vous au panneau admin
2. Allez dans **Paramètres**
3. Entrez un nouveau mot de passe
4. Sauvegardez

## 📦 Gestion des Produits

### Accéder à la gestion des produits

1. Connectez-vous au panneau admin
2. Cliquez sur **"Gestion des Produits"** dans le dashboard

### Ajouter un produit

1. Cliquez sur **"Ajouter un produit"**
2. Remplissez le formulaire :
   - **Nom du produit** (requis)
   - **Marque** (requis)
   - **Catégorie** (requis) - sélectionnez parmi les catégories disponibles
   - **Prix** et autres informations
   - **Images** : entrez les URLs des images séparées par des virgules
   - **Description** et **Description technique**
   - **Spécifications** : cliquez sur "+ Ajouter" pour ajouter des spécifications
   - **Caractéristiques** : une par ligne
3. Cliquez sur **"Enregistrer"**

### Modifier un produit

1. Dans la liste des produits, cliquez sur l'icône **✏️ Modifier**
2. Modifiez les champs souhaités
3. Cliquez sur **"Enregistrer"**

### Supprimer un produit

1. Dans la liste des produits, cliquez sur l'icône **🗑️ Supprimer**
2. Confirmez la suppression

### Rechercher un produit

Utilisez la barre de recherche en haut de la page pour filtrer les produits par nom, marque ou catégorie.

## 🖼️ Gestion des Images

### Accéder à la gestion des images

1. Connectez-vous au panneau admin
2. Cliquez sur **"Gestion des Images"** dans le dashboard

### Uploader des images

1. Cliquez sur **"Uploader des images"**
2. Sélectionnez une ou plusieurs images (JPG, PNG, GIF, WebP)
3. Les images seront automatiquement sauvegardées dans `/public/images/products/`
4. L'URL de l'image sera générée automatiquement

### Utiliser une image dans un produit

1. Après avoir uploadé une image, cliquez sur **"Copier URL"** au survol de l'image
2. Collez l'URL dans le champ "Images" lors de l'ajout/modification d'un produit
3. Pour plusieurs images, séparez les URLs par des virgules

### Supprimer des images

- **Une image** : Survolez l'image et cliquez sur l'icône **🗑️**
- **Plusieurs images** : Sélectionnez les images (cochez-les), puis cliquez sur **"Supprimer (X)"**

## 📝 Gestion du Contenu

### Accéder à la gestion du contenu

1. Connectez-vous au panneau admin
2. Cliquez sur **"Contenu du Site"** dans le dashboard

### Modifier les métadonnées

1. Développez la section **"Métadonnées du site"**
2. Modifiez :
   - **Titre du site** : apparaît dans l'onglet du navigateur
   - **Description** : description pour les moteurs de recherche
   - **Mots-clés** : séparés par des virgules
3. Cliquez sur **"Sauvegarder"** en haut de la page

### Modifier la bannière Hero

1. Développez la section **"Bannière Hero"**
2. Modifiez le titre, sous-titre, texte et lien du bouton
3. Cliquez sur **"Sauvegarder"**

### Gérer les slides Hero

1. Dans la section **"Slides Hero"** :
   - Cliquez sur **"Ajouter un slide"** pour créer un nouveau slide
   - Modifiez les slides existants directement dans le formulaire
   - Cliquez sur **❌** pour supprimer un slide
2. Pour chaque slide, vous pouvez modifier :
   - **Badge** : texte affiché en haut du slide
   - **Titre** : titre principal
   - **Description** : texte descriptif
   - **Texte du bouton** et **Lien du bouton**
   - **Couleur de fond** : classe Tailwind CSS (ex: `bg-gradient-to-br from-blue-500 to-blue-600`)
3. Cliquez sur **"Sauvegarder"**

### Gérer les promotions

1. Dans la section **"Promotions"** :
   - Cliquez sur **"Ajouter une promotion"** pour créer une nouvelle promotion
   - Modifiez les promotions existantes
   - Cliquez sur **❌** pour supprimer une promotion
2. Pour chaque promotion, vous pouvez modifier :
   - **Badge**, **Titre**, **Description**
   - **Caractéristiques** : une par ligne
   - **Texte du bouton** et **Lien du bouton**
   - **Couleur de fond**
3. Cliquez sur **"Sauvegarder"**

## ⚙️ Paramètres

### Accéder aux paramètres

1. Connectez-vous au panneau admin
2. Cliquez sur **"Paramètres"** dans le dashboard

### Modifier les paramètres

- **Nouveau mot de passe admin** : entrez un nouveau mot de passe (laissez vide pour ne pas changer)
- **Nom du site** : nom affiché dans le panneau admin
- **URL du site** : URL principale du site

## 📁 Structure des fichiers

Les données sont stockées dans :

- **Produits** : `data/products.json` (créé automatiquement) et `src/data/products.ts` (synchronisé)
- **Contenu** : `data/site-content.json`
- **Images** : `public/images/products/`
- **Paramètres** : `data/admin-settings.json`

## 🔧 Notes techniques

### Synchronisation des produits

- Les produits sont sauvegardés dans `data/products.json` (format JSON)
- Le fichier `src/data/products.ts` est automatiquement synchronisé pour maintenir la compatibilité
- En cas de problème, le système charge depuis le fichier TS

### Sécurité

- ⚠️ **En production**, utilisez des variables d'environnement pour le mot de passe
- ⚠️ Ajoutez une authentification plus robuste (NextAuth, etc.)
- ⚠️ Limitez l'accès au panneau admin par IP si possible
- ⚠️ Hash les mots de passe (actuellement en clair pour le développement)

### Performance

- Les images uploadées sont stockées dans `public/images/products/`
- Les URLs sont générées automatiquement
- Utilisez des images optimisées (WebP recommandé)

## 🐛 Dépannage

### Le panneau admin ne se charge pas

1. Vérifiez que vous êtes connecté (session valide)
2. Videz le cache du navigateur
3. Vérifiez la console du navigateur pour les erreurs

### Les produits ne s'affichent pas

1. Vérifiez que le fichier `src/data/products.ts` existe
2. Vérifiez les erreurs dans la console du serveur
3. Redémarrez le serveur de développement

### Les images ne s'uploadent pas

1. Vérifiez les permissions du dossier `public/images/`
2. Vérifiez la taille des images (max 10MB)
3. Vérifiez le format des images (JPG, PNG, GIF, WebP)

## 📞 Support

Pour toute question ou problème, consultez la documentation Next.js ou contactez l'équipe de développement.

---

**Version** : 1.0.0  
**Dernière mise à jour** : 2024

