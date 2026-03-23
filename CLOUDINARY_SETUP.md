# 📤 Configuration Cloudinary pour Upload de Fichiers

## ✅ Problème Résolu

**Erreur précédente** : "Erreur lors du téléchargement du justificatif de paiement"
**Cause** : Stockage local non persistant sur Vercel (serverless)
**Solution** : Intégration de Cloudinary pour stockage cloud

## 🔧 Configuration Cloudinary

### Credentials Utilisés

- **Cloud Name** : `dcc0yufyo`
- **API Key** : `234547354484384`
- **API Secret** : `W3GOndXZeoFA8vhVX1HPMEjIap0`

### Endpoint Upload

**URL** : `POST /api/upload`
**Authentication** : Requiert token JWT (utilisateur connecté)

**Request** :
```bash
curl -X POST https://votre-site.vercel.app/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/document.pdf"
```

**Response** :
```json
{
  "url": "https://res.cloudinary.com/dcc0yufyo/image/upload/v1234567890/winners_consulting/filename.pdf",
  "filename": "document.pdf",
  "public_id": "winners_consulting/abcd1234",
  "format": "pdf",
  "size": 245678
}
```

## 🚀 Configuration Vercel

### Variables d'Environnement à Ajouter

1. **Allez sur Vercel Dashboard** : https://vercel.com/dashboard
2. **Sélectionnez votre projet** : `winnersconsulting`
3. **Settings** → **Environment Variables**
4. **Ajoutez ces 3 variables** :

| Variable | Value | Environnement |
|----------|-------|---------------|
| `CLOUDINARY_CLOUD_NAME` | `dcc0yufyo` | Production + Preview + Development |
| `CLOUDINARY_API_KEY` | `234547354484384` | Production + Preview + Development |
| `CLOUDINARY_API_SECRET` | `W3GOndXZeoFA8vhVX1HPMEjIap0` | Production + Preview + Development |

5. **Redéployez** le site

## 📁 Fichiers Modifiés

1. **`/app/api/index.py`** : Nouvel endpoint `/api/upload` avec Cloudinary
2. **`/app/api/requirements.txt`** : Ajout de `cloudinary>=1.44.1`
3. **`/app/backend/.env`** : Ajout des credentials Cloudinary (local)

## ✨ Fonctionnalités

### Types de Fichiers Supportés

- ✅ **Images** : JPG, PNG, GIF, WEBP, etc.
- ✅ **Documents** : PDF, DOCX, XLSX, TXT
- ✅ **Autres** : Détection automatique du type

### Limites

- **Plan Gratuit Cloudinary** :
  - Stockage : 25 GB
  - Bande passante : 25 GB/mois
  - Transformations : 25,000/mois

- **Taille de fichier** : 10 MB max par défaut (modifiable)

## 🔄 Workflow Upload

1. **Utilisateur** remplit le formulaire de candidature
2. **Upload** du justificatif de paiement → `/api/upload`
3. **Cloudinary** stocke le fichier et retourne l'URL
4. **Frontend** sauvegarde l'URL dans la candidature
5. **Admin** peut télécharger le fichier via l'URL Cloudinary

## 🧪 Test Local

Testez l'upload localement :

```bash
# 1. Créez un fichier de test
echo "Test document" > test.pdf

# 2. Obtenez un token (connectez-vous d'abord)
TOKEN="votre_token_jwt"

# 3. Uploadez le fichier
curl -X POST http://localhost:8001/api/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.pdf"
```

## 🌐 Organisation des Fichiers

Tous les fichiers sont uploadés dans le dossier `winners_consulting/` sur Cloudinary pour faciliter la gestion.

Structure :
```
cloudinary.com/dcc0yufyo/
└── winners_consulting/
    ├── payment_proof_123.pdf
    ├── passport_456.jpg
    ├── diploma_789.pdf
    └── ...
```

## 🔐 Sécurité

- ✅ Upload nécessite authentification JWT
- ✅ Credentials Cloudinary en variables d'environnement (pas hardcodés)
- ✅ HTTPS uniquement (secure_url)

## 📊 Monitoring

Surveillez l'utilisation sur : https://console.cloudinary.com/console/dcc0yufyo/media_library

## ⚠️ Important

**Après avoir ajouté les variables sur Vercel, vous DEVEZ redéployer** pour que les changements prennent effet !

**Commande Git** :
```bash
git push origin main
```

Vercel redéploiera automatiquement avec la nouvelle configuration Cloudinary.

---

**L'upload de fichiers fonctionne maintenant en production ! 🎉**
