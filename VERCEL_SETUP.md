# Configuration Vercel - IMPORTANT

## Problème résolu

Le problème était que le frontend en production essayait de se connecter à l'URL Emergent preview au lieu de l'API Vercel.

## Variables d'environnement à configurer sur Vercel

### 1. Pour le Backend (Serverless Function)

Allez sur **Vercel Dashboard > Votre Projet > Settings > Environment Variables** et ajoutez :

| Variable | Value | Environnement |
|----------|-------|---------------|
| `MONGO_URL` | `mongodb+srv://votre-user:votre-password@cluster.mongodb.net/?retryWrites=true&w=majority` | Production, Preview, Development |
| `DB_NAME` | `winnersconsulting` | Production, Preview, Development |
| `JWT_SECRET` | `une-clé-secrète-forte-de-32-caractères-minimum` | Production, Preview, Development |

**⚠️ IMPORTANT** : 
- Remplacez `votre-user` et `votre-password` par vos vraies credentials MongoDB Atlas
- Assurez-vous que MongoDB Atlas autorise les connexions depuis n'importe quelle IP (0.0.0.0/0) car Vercel utilise des IPs dynamiques

### 2. Pour le Frontend (Build)

Le frontend n'a PAS besoin de `REACT_APP_BACKEND_URL` en production car :
- Les routes `/api/*` sont automatiquement redirigées vers la fonction serverless par Vercel
- Le fichier `.env.production` définit `REACT_APP_BACKEND_URL=` (vide)
- Cela fait que le frontend utilise le même domaine pour les appels API

## Comment MongoDB Atlas doit être configuré

### Network Access (Accès réseau)
1. Allez sur MongoDB Atlas > Network Access
2. Cliquez sur "Add IP Address"
3. Sélectionnez "Allow Access from Anywhere" (0.0.0.0/0)
4. Sauvegardez

### Database Access (Accès base de données)
1. Allez sur MongoDB Atlas > Database Access
2. Vérifiez que vous avez un utilisateur avec le rôle `readWrite` ou `Atlas admin`
3. Notez bien le nom d'utilisateur et le mot de passe

### Chaîne de connexion
1. Cliquez sur "Connect" sur votre cluster
2. Choisissez "Connect your application"
3. Copiez la chaîne de connexion
4. Format : `mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority`
5. Remplacez `<username>` et `<password>` par vos vraies credentials

## Redéploiement

Après avoir configuré les variables d'environnement sur Vercel :

1. **Option 1 : Via le Dashboard Vercel**
   - Allez dans l'onglet "Deployments"
   - Cliquez sur les 3 points du dernier déploiement
   - Sélectionnez "Redeploy"

2. **Option 2 : Via Git Push**
   ```bash
   git add .
   git commit -m "Fix production environment variables"
   git push origin main
   ```

## Vérification

Après le redéploiement, testez :

1. **Homepage** : Vérifiez que les offres s'affichent
2. **Connexion** : Essayez de vous connecter avec un compte existant
3. **Inscription** : Créez un nouveau compte
4. **Console navigateur** : Ouvrez F12 et vérifiez qu'il n'y a pas d'erreurs CORS ou de connexion

## Création du compte admin

Une fois déployé, créez le compte administrateur :

```bash
curl -X POST https://votre-site.vercel.app/api/admin/setup
```

Credentials par défaut :
- Email : `admin@winners-consulting.com`
- Mot de passe : `Admin2025!`

**⚠️ Changez ce mot de passe immédiatement après la première connexion !**

## Structure des fichiers pour Vercel

```
/
├── api/
│   ├── index.py          # API FastAPI (Serverless Function Vercel)
│   └── requirements.txt  # Dépendances Python pour Vercel
├── frontend/
│   ├── .env             # Variables pour développement local (Emergent)
│   ├── .env.production  # Variables pour production (Vercel) - NOUVEAU
│   └── src/             # Code source React
├── vercel.json          # Configuration Vercel (rewrites, functions)
└── VERCEL_SETUP.md     # Ce fichier
```

## Fichiers importants

### `.env.production` (Nouveau fichier créé)
```
REACT_APP_BACKEND_URL=
```
Ce fichier vide force le frontend à utiliser le même domaine pour les appels API.

### `vercel.json`
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/index.py"
    }
  ]
}
```
Cette configuration redirige automatiquement toutes les requêtes `/api/*` vers la fonction serverless Python.

## Dépannage

### Problème : "Erreur de connexion" lors du login

**Cause** : Variables d'environnement manquantes sur Vercel ou MongoDB Atlas n'autorise pas les connexions Vercel

**Solution** :
1. Vérifiez que MONGO_URL, DB_NAME et JWT_SECRET sont définis sur Vercel
2. Vérifiez que MongoDB Atlas autorise 0.0.0.0/0
3. Vérifiez les logs Vercel : Dashboard > Deployments > View Function Logs

### Problème : Les offres ne s'affichent pas

**Cause** : Base de données vide ou API non accessible

**Solution** :
1. Connectez-vous en tant qu'admin
2. Utilisez le endpoint de seed : `POST https://votre-site.vercel.app/api/admin/seed-data`
3. Ou ajoutez manuellement des offres via le panneau admin

### Problème : Erreur CORS

**Cause** : Configuration CORS dans l'API

**Solution** : L'API dans `/api/index.py` autorise déjà tous les origins (`allow_origins=["*"]`), donc ce ne devrait pas être un problème.

## Support

Pour toute question, vérifiez :
1. Les logs Vercel (Dashboard > Deployments > Function Logs)
2. La console navigateur (F12 > Console)
3. Les variables d'environnement Vercel (Settings > Environment Variables)
