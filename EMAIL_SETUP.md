# Configuration des emails (vérification de compte, mot de passe oublié)

Le site utilise **Resend** pour envoyer les emails (vérification d’email après inscription, réinitialisation de mot de passe, renvoi de lien de vérification).

## Comportement actuel

- **Sans configuration** : les APIs répondent « succès » mais **aucun email n’est envoyé**. L’utilisateur ne reçoit rien.
- **Avec configuration** : les emails sont envoyés via Resend.

## Variables d’environnement à configurer

Ajoutez-les dans `.env` / `.env.local` (et dans les variables d’environnement de votre hébergeur, ex. DigitalOcean).

| Variable | Description | Exemple |
|----------|-------------|---------|
| `RESEND_API_KEY` | Clé API Resend (obligatoire pour envoyer des emails) | `re_xxxxxxxxxxxx` |
| `RESEND_FROM_EMAIL` | Adresse d’envoi (expéditeur) | `noreply@votredomaine.com` ou `Photon Solar <noreply@photonsolar.be>` |
| `NEXTAUTH_URL` | URL publique du site (pour les liens dans les emails) | `https://photonsolar.be` ou `http://localhost:3000` en dev |

## Étapes pour activer les emails

### 1. Créer un compte Resend

1. Allez sur [resend.com](https://resend.com) et créez un compte.
2. Dans le dashboard, créez une **API Key** (onglet API Keys) et copiez la clé (elle commence par `re_`).
3. Ajoutez-la dans votre `.env` :
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
   ```

### 2. Configurer l’adresse d’envoi

Resend exige une adresse (ou un domaine) vérifiée :

- **En développement** : vous pouvez utiliser le domaine de test Resend (ex. `onboarding@resend.dev`) pour recevoir les emails sur votre boîte Resend.
- **En production** : ajoutez et vérifiez votre domaine (ex. `photonsolar.be`) dans Resend, puis utilisez une adresse de ce domaine comme expéditeur.

Dans `.env` :

```env
RESEND_FROM_EMAIL=Photon Solar <noreply@photonsolar.be>
```

Si vous n’indiquez pas `RESEND_FROM_EMAIL`, le code utilise par défaut `noreply@photonsolar.be` (à condition que ce domaine soit vérifié dans Resend).

### 3. Définir l’URL du site

Les liens de vérification et de réinitialisation de mot de passe pointent vers `NEXTAUTH_URL`. En production, définissez l’URL réelle du site :

```env
NEXTAUTH_URL=https://votresite.com
```

Sur DigitalOcean App Platform, définissez cette variable dans **Settings → App-Level Environment Variables**.

## Emails concernés

| Fonctionnalité | Route / déclencheur | Condition d’envoi |
|----------------|---------------------|-------------------|
| Vérification après inscription | `POST /api/register` | `RESEND_API_KEY` défini |
| Renvoi lien de vérification | `POST /api/auth/verify-email` (resend) | `RESEND_API_KEY` défini |
| Mot de passe oublié | `POST /api/auth/reset-password` (action `request`) | `RESEND_API_KEY` défini |

## Vérifier que tout fonctionne

1. Vérifiez que les 3 variables sont bien définies (y compris en production).
2. Après inscription : un email « Vérifiez votre adresse email » doit arriver (vérifiez aussi les spams).
3. Mot de passe oublié : après avoir saisi l’email, un email « Réinitialisation de votre mot de passe » doit arriver.

Si rien n’arrive, vérifiez les logs serveur (erreurs Resend, quota, domaine non vérifié).
