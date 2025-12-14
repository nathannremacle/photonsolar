# Routes API d'authentification - Photon Solar

## 📋 Vue d'ensemble

Ce document décrit toutes les routes API créées pour le système d'authentification.

## 🔐 Routes disponibles

### 1. Inscription (`POST /api/auth/register`)

Crée un nouveau compte utilisateur.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "message": "Compte créé avec succès. Veuillez vérifier votre email pour activer votre compte.",
  "user": {
    "id": "clx...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Response Error (400):**
```json
{
  "error": "Données invalides",
  "details": [
    {
      "field": "password",
      "message": "Le mot de passe doit contenir au moins 8 caractères"
    }
  ]
}
```

**Rate Limiting:** 3 inscriptions par heure par IP

**Fonctionnalités:**
- Validation Zod stricte
- Vérification d'unicité de l'email
- Hash du mot de passe avec bcrypt (12 rounds)
- Génération d'un token de vérification email
- Envoi automatique d'email de vérification (si Resend configuré)

---

### 2. Connexion (`POST /api/auth/signin`)

Connecte un utilisateur existant.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Connexion réussie"
}
```

**Response Error (401):**
```json
{
  "error": "Email ou mot de passe incorrect."
}
```

**Rate Limiting:** 5 tentatives par 15 minutes par IP

**Fonctionnalités:**
- Validation Zod
- Utilise NextAuth pour la gestion de session
- Rate limiting avec Upstash Redis
- Réinitialisation du rate limit en cas de succès

---

### 3. Vérification Email (`GET /api/auth/verify-email?token=xxx`)

Vérifie l'adresse email d'un utilisateur avec un token.

**Query Parameters:**
- `token`: Token de vérification reçu par email

**Response:** Redirection vers `/login?verified=true` ou `/login?error=xxx`

**Codes d'erreur possibles:**
- `missing_token`: Token manquant
- `invalid_token`: Token invalide
- `token_not_found`: Token non trouvé
- `token_expired`: Token expiré
- `verification_failed`: Erreur lors de la vérification

**Fonctionnalités:**
- Validation du token
- Vérification de l'expiration (24 heures)
- Mise à jour du champ `emailVerified`
- Suppression du token après utilisation (one-time use)

---

### 4. Renvoyer Email de Vérification (`POST /api/auth/verify-email/resend`)

Renvoie un email de vérification.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Un nouveau lien de vérification a été envoyé à votre adresse email."
}
```

**Rate Limiting:** 3 demandes par heure par email

**Fonctionnalités:**
- Suppression des anciens tokens
- Génération d'un nouveau token
- Envoi d'email avec nouveau lien

---

### 5. Réinitialisation de Mot de Passe

#### 5.1. Demander une réinitialisation (`POST /api/auth/reset-password`)

**Request Body:**
```json
{
  "action": "request",
  "email": "john@example.com"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé."
}
```

**Rate Limiting:** 3 demandes par heure par email

#### 5.2. Réinitialiser le mot de passe (`POST /api/auth/reset-password`)

**Request Body:**
```json
{
  "action": "reset",
  "token": "xxx",
  "password": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter."
}
```

**Response Error (400):**
```json
{
  "error": "Le token a expiré. Veuillez demander un nouveau lien de réinitialisation."
}
```

**Fonctionnalités:**
- Validation Zod stricte du nouveau mot de passe
- Vérification du token et expiration (1 heure)
- Hash du nouveau mot de passe
- Suppression du token après utilisation

---

## 🛡️ Sécurité

### Rate Limiting

Toutes les routes sensibles sont protégées par rate limiting via Upstash Redis :

| Route | Limite | Fenêtre | Identifiant |
|-------|--------|---------|-------------|
| `/api/auth/register` | 3 | 1 heure | IP |
| `/api/auth/signin` | 5 | 15 minutes | IP |
| `/api/auth/verify-email/resend` | 3 | 1 heure | Email |
| `/api/auth/reset-password` (request) | 3 | 1 heure | Email |

### Validation

- **Zod** : Toutes les entrées sont validées avec des schémas Zod stricts
- **Mots de passe** : Minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
- **Emails** : Validation du format et normalisation (lowercase)

### Hashing

- **bcryptjs** : Tous les mots de passe sont hashés avec 12 rounds
- Les mots de passe ne sont jamais stockés en clair

### Tokens

- **Génération** : `crypto.randomBytes(32)` pour des tokens sécurisés
- **Expiration** :
  - Vérification email : 24 heures
  - Réinitialisation mot de passe : 1 heure
- **One-time use** : Tous les tokens sont supprimés après utilisation

## 📧 Emails

Les emails sont envoyés via **Resend** avec des templates HTML professionnels :

- Email de vérification
- Email de réinitialisation de mot de passe
- Email de renvoi de vérification

**Configuration requise:**
- `RESEND_API_KEY` dans `.env`
- `RESEND_FROM_EMAIL` dans `.env`
- `NEXTAUTH_URL` pour les liens dans les emails

## 🧪 Test des routes

### Avec curl

**Inscription:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!",
    "confirmPassword": "TestPass123!"
  }'
```

**Connexion:**
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### Avec Postman/Insomnia

Importez les routes et testez avec les exemples ci-dessus.

## 🐛 Dépannage

### Erreur: "Rate limited"
- Attendez la fin de la fenêtre de rate limiting
- Vérifiez que Upstash Redis est correctement configuré

### Erreur: "Email déjà utilisé"
- L'email existe déjà dans la base de données
- Utilisez un autre email ou connectez-vous

### Erreur: "Token expiré"
- Le token a dépassé sa durée de validité
- Demandez un nouveau token

### Erreur: "Email non envoyé"
- Vérifiez que `RESEND_API_KEY` est configuré
- Vérifiez les logs du serveur pour plus de détails

## 📚 Prochaines étapes

Une fois les routes API testées, vous pouvez :

1. Créer les pages frontend (`/login`, `/register`)
2. Intégrer les formulaires avec React Hook Form
3. Ajouter les notifications toast
4. Protéger les routes avec middleware NextAuth

