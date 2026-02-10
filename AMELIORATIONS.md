# Proposition d'améliorations – Photon Solar

Revue du site et du code. Les points sont classés par priorité (sécurité > production > UX/SEO > technique).

---

## ✅ Implémenté (résumé)

- **Admin** : Session serveur (cookie signé), vérification sur toutes les routes API admin, middleware pour `/admin/*`, rate limit login avec Redis, mot de passe hashé (bcrypt, `ADMIN_PASSWORD_HASH`).
- **Téléchargements** : Upload/suppression des PDF vers DigitalOcean Spaces quand configuré.
- **Contact** : API `POST /api/contact` + envoi email via Resend ; variable optionnelle `CONTACT_EMAIL`.
- **Produits** : `GET /api/products/[id]`, SEO (metadata) + 404 sur produit inexistant, page `not-found.tsx`, BestSellers alimenté par l’API uniquement.
- **Toasts** : Contexte global + remplacement d’alertes (contact, admin produits).
- **Divers** : Suppression du code de debug (fetch agent), script `npm run test`.

---

## Priorité haute – Sécurité

### 1. Protéger les routes API admin côté serveur

**Problème** : Les routes `/api/admin/*` (products, images, homepage, news, orders, settings, downloads) ne vérifient **pas** l’authentification. Seul le login vérifie le mot de passe. N’importe qui peut appeler ces endpoints.

**Piste** :
- Introduire un token de session admin (cookie HTTP-only ou JWT court) après login.
- Dans chaque route admin, vérifier ce token (middleware ou helper) et renvoyer 401 si invalide.
- Ou protéger `/admin` et toutes les API admin via le middleware Next.js (ex. cookie de session après login).

### 2. Admin : ne pas s’appuyer uniquement sur le sessionStorage

**Problème** : `checkAdminSession()` lit uniquement `sessionStorage`. On peut le contourner en appelant les API depuis un autre outil (Postman, curl).

**Piste** : Vérifier la session (ou un token) **côté serveur** à chaque requête admin, comme en (1).

### 3. Hasher le mot de passe admin

**Problème** : `admin-auth.ts` compare en clair avec `ADMIN_PASSWORD`. Si le fichier `.env` fuit, le mot de passe est exposé.

**Piste** : Utiliser `bcrypt` (déjà dans le projet) : au premier setup, hasher et stocker le hash ; à la vérification, `bcrypt.compare(password, hash)`.

---

## Priorité haute – Production (DigitalOcean)

### 4. Upload des téléchargements (PDF) en environnement éphémère

**Problème** : `api/admin/downloads/upload` écrit dans `public/downloads/` (disque local). Sur App Platform le FS est éphémère → les PDF disparaissent au redéploiement.

**Piste** : Stocker les PDF dans DigitalOcean Spaces (même bucket ou préfixe dédié, ex. `downloads/`) et servir les URLs CDN, comme pour les images.

### 5. Protéger la route admin par détection d’environnement

**Problème** : La page « Images » et d’autres flux supposent parfois un FS writable. Sur DO, tout passe par Spaces ; pas de incohérence côté code si tout est déjà migré, mais toute nouvelle route qui écrit en local devra être évitée ou adaptée.

**Piste** : Documenter que tout stockage fichier (images, PDF, etc.) doit passer par Spaces (ou équivalent), et ne plus ajouter d’écriture disque pour le contenu utilisateur.

---

## Priorité moyenne – UX et fonctionnel

### 6. Formulaire de contact : envoi réel

**Problème** : La page Contact fait `console.log(formData)` et affiche un message de succès sans envoyer les données nulle part.

**Piste** :
- Créer une route API (ex. `POST /api/contact`) qui envoie l’email via Resend (déjà utilisé pour reset-password / verify-email).
- Ou intégrer un service type Formspree / Netlify Forms si vous préférez déléguer l’envoi.

### 7. Page produit : métadonnées et SEO dynamiques

**Problème** : La page `/products/[id]` n’a pas de `generateMetadata`. Les partages et les moteurs de recherche voient le titre/description globaux, pas ceux du produit.

**Piste** : Dans `app/products/[id]/page.tsx` (ou un layout parent), ajouter `generateMetadata` qui charge le produit (API ou Prisma) et retourne `title`, `description`, `openGraph` à partir du nom, description et image du produit.

### 8. Page produit : chargement ciblé

**Problème** : La page produit charge **tous** les produits puis filtre par `id` côté client (`/api/products` puis `find`). Inutile et lent avec un gros catalogue.

**Piste** : Ajouter `GET /api/products/[id]` (ou utiliser une query Prisma par id) et appeler cette route depuis la page produit. Garder la liste complète pour les pages qui en ont besoin (liste, recherche).

### 9. Page 404 dédiée

**Problème** : Pas de `not-found.tsx` dans `app/`. Les “produit non trouvé” et autres cas 404 utilisent du contenu inline, pas une page 404 cohérente.

**Piste** : Créer `app/not-found.tsx` avec un message clair et un lien vers l’accueil (et éventuellement la recherche). Depuis la page produit, utiliser `notFound()` de Next.js quand le produit n’existe pas.

### 10. Messages d’erreur utilisateur (admin et front)

**Problème** : Beaucoup d’endroits utilisent `alert()` pour les erreurs. Peu lisible et pas accessible.

**Piste** : Introduire un système de toasts (vous avez déjà un composant `Toast.tsx`) ou un state global d’erreur, et l’utiliser après les appels API (upload, sauvegarde produit, contact, etc.) à la place des `alert()`.

---

## Priorité moyenne – Technique et cohérence

### 11. Source unique des produits (API vs `data/products.ts`)

**Problème** : `BestSellers` utilise `getProductById` depuis `@/data/products` tout en chargeant les IDs depuis `/api/homepage`. D’autres parties utilisent `/api/products`. Risque de décalage entre ce qui est en base (admin) et ce qui s’affiche (fichier statique).

**Piste** : Faire en sorte que la homepage et les composants “produits” s’alimentent tous depuis l’API produits (Prisma). Si `data/products.ts` reste pour le seed ou des fallbacks, documenter clairement son rôle et éviter qu’il soit la source d’affichage principale.

### 12. Supprimer le code de debug dans `products-storage.ts`

**Problème** : Un `fetch('http://127.0.0.1:7242/ingest/...')` (agent log) est présent dans la conversion Prisma → Product. Inutile en production et peut générer des erreurs réseau.

**Piste** : Supprimer cet appel ou le conditionner à `process.env.NODE_ENV === 'development'` et à une variable d’env dédiée.

### 13. Admin : rate limiting avec Redis

**Problème** : Le rate limiting du login admin utilise un store **en mémoire** (`rate-limiter.ts`). Sur plusieurs instances ou après redémarrage, la limite est réinitialisée.

**Piste** : Utiliser le même système que l’auth publique (Upstash Redis) pour le login admin, comme dans `rate-limit.ts`, afin d’avoir une limite cohérente et persistante.

### 14. Middleware : protéger `/admin`

**Problème** : Le middleware ne protège que `/profile` et `/account`. Les pages sous `/admin` ne sont protégées que par un check client (`checkAdminSession()`), pas par le serveur.

**Piste** : Une fois l’auth admin côté serveur en place (cookie/token), faire en sorte que le middleware redirige vers `/admin` (login) toute requête vers `/admin/*` sans session valide. Cela évite d’afficher brièvement le contenu admin avant la redirection client.

---

## Priorité basse – Améliorations optionnelles

### 15. Metadata sur les autres pages dynamiques

**Piste** : Ajouter `generateMetadata` (ou metadata export) sur les pages importantes : `/blogs/news/[slug]`, `/collections/[category]`, `/contact`, `/telechargements`, etc., pour de meilleurs titres/descriptions et partages sociaux.

### 16. Scripts npm

**Piste** : Ajouter par exemple `"test": "echo \"No tests yet\""` ou un script de lint/test pour la CI. Vérifier que `npm run build` et `npm run lint` tournent sans erreur avant chaque déploiement.

### 17. Accessibilité (a11y)

**Piste** : Vérifier les formulaires (labels, erreurs associées), les boutons “upload” / “supprimer” (états de chargement, messages d’erreur), et les modales (focus trap, fermeture clavier). Corriger les éventuels contrastes ou textes trop petits signalés par un outil type axe-core ou Lighthouse.

### 18. Performance et cache

**Piste** : Pour les pages peu modifiées (liste produits, homepage), envisager `revalidate` (ISR) ou des en-têtes Cache-Control sur les API pour réduire la charge et améliorer le temps de réponse.

---

## Résumé des actions recommandées (ordre suggéré)

| # | Action | Impact |
|---|--------|--------|
| 1–2 | Protéger les API admin + session serveur | Sécurité critique |
| 3 | Hasher le mot de passe admin | Sécurité |
| 4 | Migrer l’upload des PDF vers Spaces | Production DO |
| 6 | Formulaire contact → API + email | Fonctionnel |
| 7–8 | SEO + chargement produit par id | UX / SEO |
| 9 | Page not-found | UX |
| 11–12 | Source produits unique + retrait debug | Cohérence / stabilité |
| 13 | Rate limit admin avec Redis | Sécurité / cohérence |

Si vous indiquez par quoi vous voulez commencer (sécurité admin, contact, SEO, ou PDF/Spaces), on peut détailler les changements fichier par fichier.
