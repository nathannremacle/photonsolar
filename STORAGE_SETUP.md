# Configuration du Stockage d'Images - Photon Solar

## DigitalOcean Spaces (implémenté)

L'upload d'images utilise **DigitalOcean Spaces** (S3-compatible) avec CDN. Les fichiers sont envoyés dans un bucket avec ACL `public-read` et les URLs renvoyées utilisent le sous-domaine CDN.

### Variables d'environnement (.env / App Platform)

Ajoutez ces variables (remplacez les valeurs par les vôtres) :

```env
# DigitalOcean Spaces - Obligatoires pour l'upload
DO_SPACES_KEY=votre_access_key_id
DO_SPACES_SECRET=votre_secret_access_key
DO_SPACES_BUCKET=nom_du_bucket
DO_SPACES_REGION=fra1
DO_SPACES_CDN_URL=https://nom_du_bucket.fra1.cdn.digitaloceanspaces.com

# Optionnel (par défaut : https://fra1.digitaloceanspaces.com si DO_SPACES_REGION=fra1)
# DO_SPACES_ENDPOINT=https://fra1.digitaloceanspaces.com
```

- **DO_SPACES_KEY** / **DO_SPACES_SECRET** : Clés API Spaces (DigitalOcean → API → Spaces keys).
- **DO_SPACES_BUCKET** : Nom du bucket.
- **DO_SPACES_REGION** : Région du Space (ex. `fra1`).
- **DO_SPACES_CDN_URL** : URL de base du CDN (sans slash final), ex. `https://mon-bucket.fra1.cdn.digitaloceanspaces.com`. C’est cette URL qui est utilisée pour les liens renvoyés par l’API.

---

## 🚨 Problème : Environnement Serverless

Si vous obtenez l'erreur `EROFS: read-only file system`, c'est que votre application est déployée sur une plateforme serverless (Vercel, AWS Lambda, etc.) où le système de fichiers est en **lecture seule**.

## ✅ Solutions Recommandées

### Option 1 : Vercel Blob Storage (Recommandé pour Vercel)

Si vous êtes sur Vercel, utilisez Vercel Blob Storage :

1. **Installer le package** :
```bash
npm install @vercel/blob
```

2. **Configurer dans Vercel** :
   - Allez dans votre projet Vercel
   - Settings → Storage → Create Database → Blob
   - Copiez la variable d'environnement `BLOB_READ_WRITE_TOKEN`

3. **Modifier la route d'upload** :
   - Utiliser `@vercel/blob` pour uploader les images
   - Les images seront stockées dans Vercel Blob Storage
   - Retourner l'URL publique de l'image

### Option 2 : Cloudinary (Recommandé pour tous)

Cloudinary est un service de gestion d'images très populaire :

1. **Créer un compte** : https://cloudinary.com
2. **Installer le package** :
```bash
npm install cloudinary
```

3. **Configurer les variables d'environnement** :
```env
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

4. **Modifier la route d'upload** pour utiliser Cloudinary

### Option 3 : AWS S3

Pour une solution plus avancée avec AWS :

1. **Créer un bucket S3**
2. **Installer le package** :
```bash
npm install @aws-sdk/client-s3
```

3. **Configurer les variables d'environnement** :
```env
AWS_ACCESS_KEY_ID=votre_access_key
AWS_SECRET_ACCESS_KEY=votre_secret_key
AWS_REGION=votre_region
AWS_S3_BUCKET=votre_bucket_name
```

### Option 4 : Développement Local

Pour le développement local, vous pouvez continuer à utiliser le système de fichiers local. Assurez-vous simplement que :
- Vous n'êtes pas dans un environnement serverless
- Le répertoire `public/images` existe et est accessible en écriture

## 📝 Exemple d'Implémentation avec Cloudinary

Voici un exemple de modification de la route d'upload pour utiliser Cloudinary :

```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    
    const uploadedFiles: string[] = [];
    
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: 'products',
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });
      
      uploadedFiles.push((result as any).secure_url);
    }
    
    return NextResponse.json({ 
      success: true, 
      files: uploadedFiles 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload' },
      { status: 500 }
    );
  }
}
```

## 🔧 Migration

Pour migrer vers un service de stockage cloud :

1. Choisir un service (Vercel Blob, Cloudinary, S3, etc.)
2. Configurer les variables d'environnement
3. Modifier `src/app/api/admin/images/upload/route.ts`
4. Tester l'upload d'images
5. Migrer les images existantes si nécessaire

## 📚 Ressources

- **Vercel Blob** : https://vercel.com/docs/storage/vercel-blob
- **Cloudinary** : https://cloudinary.com/documentation
- **AWS S3** : https://docs.aws.amazon.com/s3/

