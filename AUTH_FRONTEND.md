# Pages Frontend d'Authentification - Photon Solar

## 📋 Vue d'ensemble

Ce document décrit les pages frontend créées pour le système d'authentification.

## 🎨 Pages créées

### 1. Page de Connexion (`/login`)

**Fichier:** `src/app/login/page.tsx`

**Fonctionnalités:**
- Formulaire de connexion avec React Hook Form
- Validation Zod côté client
- Affichage/masquage du mot de passe
- Gestion des erreurs avec messages clairs
- Notifications toast pour succès/erreurs
- Redirection après connexion réussie
- Support des query parameters (email vérifié, erreurs)
- Lien vers réinitialisation de mot de passe
- Lien vers page d'inscription

**Design:**
- Design cohérent avec le site (couleur orange #E67E22)
- Responsive (mobile-friendly)
- Animations avec Framer Motion
- Icônes Lucide React

**Query Parameters supportés:**
- `verified=true` : Affiche un message de succès pour email vérifié
- `error=xxx` : Affiche un message d'erreur spécifique
- `callbackUrl=xxx` : Redirige vers cette URL après connexion

---

### 2. Page d'Inscription (`/register`)

**Fichier:** `src/app/register/page.tsx`

**Fonctionnalités:**
- Formulaire d'inscription avec React Hook Form
- Validation Zod stricte côté client
- Indicateur de force du mot de passe en temps réel
- Checklist des exigences du mot de passe
- Affichage/masquage des mots de passe
- Gestion des erreurs avec messages clairs
- Notifications toast
- Redirection vers login après inscription
- Envoi automatique d'email de vérification

**Design:**
- Design cohérent avec le site
- Indicateur visuel de force du mot de passe (barre de progression)
- Checklist interactive (vert si requis rempli)
- Responsive

**Validation:**
- Nom : 2-100 caractères, lettres uniquement
- Email : Format valide
- Mot de passe : 8+ caractères, majuscule, minuscule, chiffre, spécial
- Confirmation : Doit correspondre au mot de passe

---

### 3. Page de Réinitialisation de Mot de Passe (`/reset-password`)

**Fichier:** `src/app/reset-password/page.tsx`

**Fonctionnalités:**
- Deux modes : demande de réinitialisation et réinitialisation avec token
- Détection automatique du mode selon la présence du token dans l'URL
- Formulaire de demande avec email
- Formulaire de réinitialisation avec nouveau mot de passe
- Validation Zod
- Gestion des tokens expirés
- Notifications toast
- Redirection vers login après succès

**Modes:**
1. **Mode demande** (`/reset-password`) : L'utilisateur entre son email
2. **Mode réinitialisation** (`/reset-password?token=xxx`) : L'utilisateur entre son nouveau mot de passe

---

## 🎨 Composant Toast

**Fichier:** `src/components/Toast.tsx`

**Fonctionnalités:**
- Système de notifications toast réutilisable
- 4 types : success, error, info, warning
- Animations avec Framer Motion
- Auto-dismiss après 5 secondes (configurable)
- Fermeture manuelle
- Hook `useToast()` pour faciliter l'utilisation

**Utilisation:**
```tsx
const { success, error, info, warning, toasts, removeToast } = useToast();

// Afficher un toast
success("Opération réussie !");
error("Une erreur est survenue.");
info("Information importante.");
warning("Attention !");

// Afficher les toasts
<ToastContainer toasts={toasts} onRemove={removeToast} />
```

---

## 🔧 Intégration

### NextAuth Client

Les pages utilisent `signIn` de `next-auth/react` pour la connexion :

```tsx
import { signIn } from "next-auth/react";

const result = await signIn("credentials", {
  email: data.email,
  password: data.password,
  redirect: false,
});
```

### React Hook Form + Zod

Tous les formulaires utilisent React Hook Form avec validation Zod :

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@/lib/validations/auth";

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(signInSchema),
});
```

---

## 🎯 Flux utilisateur

### Inscription
1. Utilisateur remplit le formulaire `/register`
2. Validation côté client (Zod)
3. Envoi à `/api/auth/register`
4. Création du compte + envoi email de vérification
5. Redirection vers `/login` avec message de succès
6. Utilisateur vérifie son email
7. Redirection vers `/login?verified=true` après vérification

### Connexion
1. Utilisateur remplit le formulaire `/login`
2. Validation côté client
3. Appel à NextAuth `signIn`
4. Redirection vers la page d'origine ou `/`

### Réinitialisation de mot de passe
1. Utilisateur clique sur "Mot de passe oublié ?"
2. Redirection vers `/reset-password`
3. Utilisateur entre son email
4. Réception d'un email avec lien
5. Clic sur le lien → `/reset-password?token=xxx`
6. Utilisateur entre nouveau mot de passe
7. Redirection vers `/login` avec message de succès

---

## 🐛 Gestion des erreurs

### Erreurs de validation
- Affichées sous chaque champ avec message spécifique
- Couleur rouge pour les champs en erreur
- Messages en français

### Erreurs API
- Affichées via toast notifications
- Messages clairs et actionnables
- Gestion du rate limiting avec messages appropriés

### Erreurs de réseau
- Message générique avec invitation à réessayer
- Logs dans la console pour le debugging

---

## 📱 Responsive Design

Toutes les pages sont :
- Responsive (mobile, tablette, desktop)
- Accessibles (ARIA labels, navigation clavier)
- Optimisées pour le touch (boutons assez grands)

---

## 🎨 Design System

**Couleurs:**
- Primaire : Orange #E67E22
- Succès : Vert #16a34a
- Erreur : Rouge #dc2626
- Info : Bleu #2563eb
- Warning : Jaune #ca8a04

**Typographie:**
- Titres : Font-bold, text-3xl
- Labels : Font-medium, text-sm
- Corps : Text-base

**Espacements:**
- Formulaire : space-y-6
- Padding : p-8
- Marges : mb-8 pour les titres

---

## 🚀 Prochaines étapes

1. Ajouter SessionProvider dans ClientProviders pour gérer la session NextAuth
2. Créer un middleware pour protéger les routes privées
3. Ajouter un composant pour afficher l'état de connexion dans la Navbar
4. Créer une page de profil utilisateur
5. Ajouter la possibilité de renvoyer l'email de vérification depuis la page login

