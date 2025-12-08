# 🔒 Informations de Sécurité - Panneau Admin

## 📍 Où est stocké le mot de passe admin ?

Le mot de passe admin est stocké dans **deux emplacements possibles** (par ordre de priorité) :

### 1. Variable d'environnement (RECOMMANDÉ pour la production)
- **Fichier** : `.env.local` ou `.env` (à la racine du projet)
- **Variable** : `ADMIN_PASSWORD`
- **Exemple** :
  ```env
  ADMIN_PASSWORD=votre_mot_de_passe_securise_ici
  ```
- **Avantage** : Non versionné (ajoutez `.env*` au `.gitignore`)
- **⚠️ IMPORTANT** : Ne commitez JAMAIS ce fichier !

### 2. Fichier de configuration (développement)
- **Fichier** : `data/admin-settings.json`
- **Structure** :
  ```json
  {
    "adminPassword": "votre_mot_de_passe"
  }
  ```
- **⚠️ ATTENTION** : Ce fichier est dans `.gitignore` pour éviter qu'il soit commité

### Code source
- **Fichier** : `src/lib/admin-auth.ts`
- **Ligne 4** : `const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";`
- Le mot de passe par défaut `"admin123"` est utilisé uniquement si aucune variable d'environnement n'est définie

## 🛡️ Mesures de sécurité implémentées

### 1. Rate Limiting (Protection contre le brute force)
- **Maximum** : 5 tentatives par IP
- **Fenêtre** : 15 minutes
- **Blocage** : 30 minutes après 5 tentatives échouées
- **Fichier** : `src/lib/rate-limiter.ts`

### 2. Protection par IP
- Chaque tentative de connexion est tracée par adresse IP
- Les tentatives échouées sont comptabilisées par IP
- Le blocage s'applique à l'IP, pas globalement

### 3. Session Storage
- L'authentification utilise `sessionStorage` (navigateur)
- La session expire quand l'onglet est fermé
- Pas de token persistant côté serveur (pour plus de sécurité, implémentez des tokens JWT)

### 4. Validation côté serveur
- Toutes les vérifications de mot de passe se font côté serveur
- Les mots de passe ne sont jamais envoyés en clair dans les logs

## 🔐 Recommandations pour la production

### 1. Utiliser des variables d'environnement
```bash
# .env.local (NE PAS COMMITER)
ADMIN_PASSWORD=un_mot_de_passe_tres_securise_avec_min_12_caracteres
```

### 2. Hash le mot de passe
Actuellement, le mot de passe est stocké en clair. Pour la production, utilisez :
- **bcrypt** ou **argon2** pour hasher les mots de passe
- Stockez uniquement le hash, jamais le mot de passe en clair

### 3. Implémenter JWT ou NextAuth
- Utilisez des tokens JWT avec expiration
- Ou utilisez NextAuth.js pour une authentification complète

### 4. HTTPS obligatoire
- En production, utilisez **uniquement HTTPS**
- Ne jamais envoyer de mots de passe via HTTP

### 5. Logs de sécurité
- Enregistrez toutes les tentatives de connexion (succès et échecs)
- Surveillez les tentatives suspectes

### 6. Authentification à deux facteurs (2FA)
- Ajoutez 2FA pour les comptes admin
- Utilisez des applications comme Google Authenticator

### 7. Limitation d'accès par IP
- Restreignez l'accès au panneau admin à certaines IPs
- Utilisez un firewall ou un middleware Next.js

## 📝 Changer le mot de passe

### Via le panneau admin
1. Connectez-vous au panneau admin
2. Allez dans **Paramètres**
3. Entrez un nouveau mot de passe (min. 6 caractères)
4. Cliquez sur **"Valider"**
5. Le mot de passe sera sauvegardé dans `data/admin-settings.json`

### Via variable d'environnement
1. Créez/modifiez le fichier `.env.local`
2. Ajoutez : `ADMIN_PASSWORD=votre_nouveau_mot_de_passe`
3. Redémarrez le serveur

## ⚠️ Checklist de sécurité

- [ ] Mot de passe fort (min. 12 caractères, majuscules, minuscules, chiffres, symboles)
- [ ] Variable d'environnement configurée
- [ ] `.env.local` dans `.gitignore`
- [ ] HTTPS activé en production
- [ ] Rate limiting activé (✅ déjà implémenté)
- [ ] Logs de sécurité activés
- [ ] 2FA (à implémenter)
- [ ] Limitation IP (à implémenter)
- [ ] Hash des mots de passe (à implémenter)

## 🚨 En cas de compromission

1. **Changez immédiatement le mot de passe**
2. **Vérifiez les logs** pour identifier l'accès non autorisé
3. **Révoquez toutes les sessions** actives
4. **Analysez les modifications** apportées au contenu
5. **Contactez votre équipe de sécurité**

---

**Dernière mise à jour** : 2024  
**Version** : 1.0.0

