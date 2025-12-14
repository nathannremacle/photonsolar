# Configuration NextAuth - Guide de dépannage

## ⚠️ Erreur : "There was a problem with the server configuration"

Cette erreur se produit généralement lorsque les variables d'environnement NextAuth ne sont pas correctement configurées.

## 🔧 Solution rapide

### 1. Créer le fichier `.env.local`

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

```env
# NextAuth - OBLIGATOIRE
NEXTAUTH_SECRET="votre-secret-ici"
NEXTAUTH_URL="http://localhost:3000"

# Database - OBLIGATOIRE
DATABASE_URL="postgresql://user:password@localhost:5432/photonsolar"

# Upstash Redis (optionnel pour le développement, mais recommandé)
UPSTASH_REDIS_REST_URL="https://your-redis-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token-here"

# Resend (optionnel)
RESEND_API_KEY="re_your_api_key_here"
RESEND_FROM_EMAIL="noreply@photonsolar.be"
```

### 2. Générer un secret NextAuth

**Option A : Avec OpenSSL (recommandé)**
```bash
openssl rand -base64 32
```

**Option B : En ligne**
Visitez : https://generate-secret.vercel.app/32

**Option C : Avec Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copiez le secret généré et collez-le dans `NEXTAUTH_SECRET` de votre `.env.local`.

### 3. Vérifier NEXTAUTH_URL

- **Développement local** : `http://localhost:3000`
- **Production** : `https://votre-domaine.com`

### 4. Redémarrer le serveur

Après avoir créé/modifié le fichier `.env.local`, **redémarrez complètement le serveur de développement** :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez :
npm run dev
```

## 🔍 Vérifications supplémentaires

### Vérifier que les variables sont chargées

Ajoutez temporairement ce code dans `src/auth.ts` pour vérifier (à supprimer après) :

```typescript
console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "✅ Défini" : "❌ Manquant");
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL || "❌ Manquant");
```

### Vérifier la base de données

Assurez-vous que :
1. PostgreSQL est démarré
2. La base de données existe
3. `DATABASE_URL` est correcte
4. Les tables Prisma sont créées : `npm run db:push`

### Vérifier la route API

Testez l'endpoint NextAuth :
```
GET http://localhost:3000/api/auth/providers
```

Si cela fonctionne, vous devriez voir la liste des providers.

## 🐛 Erreurs courantes

### "NEXTAUTH_SECRET is not set"
- ✅ Créez `.env.local` avec `NEXTAUTH_SECRET`
- ✅ Redémarrez le serveur

### "Invalid NEXTAUTH_URL"
- ✅ Vérifiez que `NEXTAUTH_URL` correspond à l'URL de votre application
- ✅ En développement : `http://localhost:3000`
- ✅ Pas de slash final dans l'URL

### "Database connection failed"
- ✅ Vérifiez que PostgreSQL est démarré
- ✅ Vérifiez `DATABASE_URL`
- ✅ Exécutez `npm run db:push` pour créer les tables

## 📝 Checklist

- [ ] Fichier `.env.local` créé à la racine du projet
- [ ] `NEXTAUTH_SECRET` défini (32+ caractères)
- [ ] `NEXTAUTH_URL` défini (sans slash final)
- [ ] `DATABASE_URL` défini et valide
- [ ] Serveur redémarré après modification de `.env.local`
- [ ] Prisma Client généré : `npm run db:generate`
- [ ] Tables créées : `npm run db:push`

## 🚀 Après configuration

Une fois les variables configurées et le serveur redémarré, l'erreur devrait disparaître.

Testez la connexion :
1. Allez sur `/login`
2. Créez un compte sur `/register`
3. Connectez-vous

Si l'erreur persiste, vérifiez les logs du serveur pour plus de détails.

