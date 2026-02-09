# Déployer Photon Solar sur DigitalOcean

Ce guide décrit comment tester et déployer le projet sur **DigitalOcean App Platform** (recommandé).

## Prérequis

- Un compte [DigitalOcean](https://www.digitalocean.com/)
- Le code poussé sur **GitHub** (ou GitLab) — App Platform se connecte au dépôt
- Les services externes déjà configurés : **Upstash Redis**, **Resend** (optionnel)

---

## Option 1 : App Platform (recommandé)

### Étape 1 : Base de données PostgreSQL

1. Dans DigitalOcean : **Databases** → **Create Database**
2. Choisir **PostgreSQL**, une région proche de vous, un plan (ex. Basic 1 GB pour tester).
3. Créer le cluster.
4. Une fois créé, ouvrir le cluster → **Connection Details**.
5. Noter :
   - **Host**
   - **Port** (souvent 25060)
   - **Database** (par ex. `defaultdb`)
   - **User**
   - **Password**

Construire les deux URLs pour Prisma :

- **DATABASE_URL** (avec pooling, pour le serveur Next.js) :
  ```text
  postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
  ```
- **DIRECT_URL** (sans pooling, pour les migrations) :
  ```text
  postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
  ```

Pour Managed PostgreSQL DO, on utilise souvent la même URL pour les deux (pas de pooler séparé). Si un **Connection pool** est proposé, utilisez son host/port pour `DATABASE_URL` et l’URL directe pour `DIRECT_URL`.

### Étape 2 : Créer l’app sur App Platform

1. **Apps** → **Create App**.
2. Choisir **GitHub** (ou GitLab), autoriser DO, sélectionner le dépôt **photonsolar** et la branche (ex. `main`).
3. DigitalOcean détecte en général **Next.js** :
   - **Build Command** : `npm run build` (ou `prisma generate && next build`)
   - **Run Command** : `npm start`
   - **HTTP Port** : `3000`
4. Si ce n’est pas le cas, configurer manuellement :
   - Type : **Web Service**
   - Build : `npm run build`
   - Run : `npm start`
   - Port : `3000`

### Étape 3 : Variables d’environnement

Dans l’app : **Settings** → **App-Level Environment Variables**, ajouter :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL PostgreSQL (avec `?sslmode=require`) | `postgresql://doadmin:xxx@db-postgresql-xxx.ondigitalocean.com:25060/defaultdb?sslmode=require` |
| `DIRECT_URL` | Même URL ou URL directe (migrations) | Idem que `DATABASE_URL` si pas de pooler |
| `NEXTAUTH_SECRET` | Secret NextAuth (générer un secret fort) | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL publique de l’app | `https://votre-app-xxxx.ondigitalocean.app` (à mettre à jour après 1er déploiement) |
| `UPSTASH_REDIS_REST_URL` | URL REST Redis (Upstash) | Déjà dans `.env.local` |
| `UPSTASH_REDIS_REST_TOKEN` | Token Redis (Upstash) | Déjà dans `.env.local` |
| `ADMIN_PASSWORD` | Mot de passe admin (sécurisé) | À définir en production |
| `SITE_URL` | URL du site (optionnel) | `https://votre-app-xxxx.ondigitalocean.app` |
| `RESEND_API_KEY` | (Optionnel) Envoi d’emails | Clé Resend |
| `RESEND_FROM_EMAIL` | (Optionnel) Email expéditeur | `noreply@photonsolar.be` |

**Important** : après le premier déploiement, récupérer l’URL fournie par DigitalOcean (ex. `https://photonsolar-xxxx.ondigitalocean.app`) et mettre à jour `NEXTAUTH_URL` et `SITE_URL`, puis redéployer.

### Étape 4 : Migrations / schéma en production

Les migrations ne s’exécutent pas automatiquement. Deux possibilités :

**A) Depuis votre machine (recommandé pour la première fois)**  
Avec la même version du code et uniquement `DATABASE_URL` et `DIRECT_URL` pointant vers la base DO :

```bash
# Utiliser les URLs de la base DO (copier depuis le dashboard)
set DATABASE_URL=postgresql://...
set DIRECT_URL=postgresql://...
npx prisma db push
# ou, si vous utilisez les migrations :
npx prisma migrate deploy
```

**B) Script de build qui pousse le schéma**  
Vous pouvez ajouter un script dans `package.json` et l’appeler dans la commande de build sur DO (voir ci‑dessous). Pour un premier test, la méthode A est plus simple.

### Étape 5 : Premier déploiement

1. Cliquer sur **Next** puis **Create Resources**.
2. Attendre le build et le déploiement.
3. Ouvrir l’URL de l’app (ex. `https://photonsolar-xxxx.ondigitalocean.app`).
4. Remettre `NEXTAUTH_URL` et `SITE_URL` à cette URL, sauvegarder, et laisser DO redéployer.

---

## Option 2 : Fichier de spec App Platform (optionnel)

Vous pouvez définir l’app dans un fichier pour la recréer ou la versionner. À la racine du projet, créez `.do/app.yaml` :

```yaml
name: photonsolar
services:
  - name: web
    github:
      repo: VOTRE_USER/photonsolar
      branch: main
    build_command: npm run build
    run_command: npm start
    environment_slug: node-js
    http_port: 3000
    instance_count: 1
    instance_size_slug: basic-xxs
    envs:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        value: ${db.DATABASE_URL}
        type: SECRET
      - key: DIRECT_URL
        value: ${db.DIRECT_URL}
        type: SECRET
      - key: NEXTAUTH_SECRET
        value: ${NEXTAUTH_SECRET}
        type: SECRET
      - key: NEXTAUTH_URL
        value: ${NEXTAUTH_URL}
      # Ajouter les autres variables (UPSTASH, ADMIN_PASSWORD, etc.)

databases:
  - name: db
    engine: PG
    version: "16"
```

Puis dans le dashboard DO : **Create App** → **Import from spec** et pointer vers ce fichier. Les variables marquées `SECRET` devront être renseignées dans le dashboard.

---

## Stockage des images en production

Sur App Platform, le système de fichiers est éphémère. Les uploads ne doivent pas être stockés sur le disque local. Suivre le guide **STORAGE_SETUP.md** et utiliser par exemple :

- **DigitalOcean Spaces** (S3‑compatible) — cohérent avec DO
- Ou **Cloudinary** / **Vercel Blob** comme décrit dans le projet

Configurer les variables d’environnement correspondantes (ex. Spaces : clés API, bucket, région) et adapter la route d’upload si nécessaire.

---

## Résumé des commandes utiles

```bash
# Générer un secret NextAuth
openssl rand -base64 32

# En local, pousser le schéma vers la base DO (après avoir défini DATABASE_URL / DIRECT_URL)
npx prisma db push
# ou
npx prisma migrate deploy
```

---

## Coûts indicatifs (test)

- **App Platform** : plan Basic (ex. 5 $/mois pour un petit service).
- **Managed PostgreSQL** : à partir d’environ 15 $/mois (Basic).
- **Spaces** (optionnel) : stockage + bande passante selon usage.

Vous pouvez commencer avec une app seule (sans base DO) en pointant `DATABASE_URL` vers une base PostgreSQL hébergée ailleurs (ex. Neon, Supabase) pour tester uniquement le déploiement de l’app sur DigitalOcean.
