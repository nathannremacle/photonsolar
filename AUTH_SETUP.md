# Configuration de l'authentification - Photon Solar

## 📋 Vue d'ensemble

Ce document décrit la configuration complète du système d'authentification utilisant NextAuth.js v5, Prisma, PostgreSQL, et Upstash Redis.

## 🚀 Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configuration de la base de données PostgreSQL

#### Option A: Base de données locale (Développement)

1. Installer PostgreSQL sur votre machine
2. Créer une base de données :
```sql
CREATE DATABASE photonsolar;
```

#### Option B: Services cloud (Production)

- **Vercel Postgres** : https://vercel.com/docs/storage/vercel-postgres
- **Neon** : https://neon.tech
- **Supabase** : https://supabase.com

### 3. Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/photonsolar"

# NextAuth
# Générer un secret : openssl rand -base64 32
# Ou utiliser : https://generate-secret.vercel.app/32
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Upstash Redis (pour le rate limiting)
# Obtenir depuis : https://console.upstash.com/
UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token-here"

# Resend (pour la vérification email)
# Obtenir la clé API depuis : https://resend.com/api-keys
RESEND_API_KEY="re_your_api_key_here"
RESEND_FROM_EMAIL="noreply@photonsolar.be"

# Optionnel: Configuration email
EMAIL_FROM_NAME="Photon Solar"
EMAIL_FROM_ADDRESS="noreply@photonsolar.be"
```

### 4. Initialiser Prisma

```bash
# Générer le client Prisma
npm run db:generate

# Pousser le schéma vers la base de données (créer les tables)
npm run db:push

# OU utiliser les migrations (recommandé pour la production)
npm run db:migrate
```

### 5. Configuration Upstash Redis

1. Créer un compte sur https://console.upstash.com/
2. Créer une nouvelle base de données Redis
3. Copier l'URL REST et le token dans votre `.env`

### 6. Configuration Resend (Email)

1. Créer un compte sur https://resend.com
2. Vérifier votre domaine ou utiliser l'email de test
3. Créer une clé API
4. Ajouter la clé dans votre `.env`

## 📁 Structure des fichiers

```
prisma/
  └── schema.prisma          # Schéma de base de données Prisma

src/
  ├── auth.ts                # Configuration NextAuth v5
  ├── lib/
  │   ├── prisma.ts          # Client Prisma singleton
  │   ├── validations/
  │   │   └── auth.ts         # Schémas de validation Zod
  │   └── rate-limit.ts       # Rate limiting avec Upstash
  └── app/
      └── api/
          └── auth/
              └── [...nextauth]/
                  └── route.ts # Route API NextAuth
```

## 🔐 Sécurité

### Rate Limiting

Le système utilise Upstash Redis pour le rate limiting avec les limites suivantes :

- **Authentification** : 5 tentatives par 15 minutes par IP/email
- **Inscription** : 3 inscriptions par heure par IP
- **Réinitialisation de mot de passe** : 3 demandes par heure par email
- **Vérification email** : 3 demandes par heure par email

### Validation des mots de passe

Les mots de passe doivent respecter :
- Minimum 8 caractères
- Au moins une majuscule
- Au moins une minuscule
- Au moins un chiffre
- Au moins un caractère spécial (@$!%*?&#)

### Hashing des mots de passe

Les mots de passe sont hashés avec `bcryptjs` avant stockage en base de données.

## 🧪 Test de la configuration

1. Démarrer le serveur de développement :
```bash
npm run dev
```

2. Accéder à l'interface Prisma Studio pour voir les données :
```bash
npm run db:studio
```

3. Tester l'endpoint NextAuth :
```
GET http://localhost:3000/api/auth/providers
```

## 📝 Prochaines étapes

Une fois la Phase 1 terminée, vous pouvez :

1. Créer les pages frontend (`/login`, `/register`)
2. Implémenter la vérification email
3. Ajouter la réinitialisation de mot de passe
4. Protéger les routes avec middleware

## 🐛 Dépannage

### Erreur : "Prisma Client not generated"
```bash
npm run db:generate
```

### Erreur : "DATABASE_URL is not set"
Vérifiez que votre fichier `.env` contient bien `DATABASE_URL`.

### Erreur : "Rate limit not working"
Vérifiez que `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN` sont correctement configurés.

### Erreur : "NextAuth secret not set"
Générez un secret avec :
```bash
openssl rand -base64 32
```

## 📚 Ressources

- [NextAuth.js v5 Documentation](https://authjs.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Upstash Redis](https://docs.upstash.com/redis)
- [Resend Documentation](https://resend.com/docs)

