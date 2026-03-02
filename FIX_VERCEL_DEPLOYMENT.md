# 🔧 Guide de Résolution - Déploiement Vercel

## ⚠️ Problème Identifié

Votre site fonctionne en local (preview Emergent) mais pas en production sur Vercel car :

1. **Configuration des variables d'environnement manquante sur Vercel**
2. **MongoDB Atlas doit autoriser les connexions depuis Vercel**

## ✅ Solution Étape par Étape

### Étape 1 : Configuration MongoDB Atlas

#### 1.1 Autoriser les connexions Vercel

Vercel utilise des IPs dynamiques, vous devez donc autoriser toutes les IPs :

1. Allez sur [MongoDB Atlas](https://cloud.mongodb.com)
2. Cliquez sur **Network Access** (dans le menu de gauche)
3. Cliquez sur **Add IP Address**
4. Sélectionnez **"Allow Access from Anywhere"** (0.0.0.0/0)
5. Cliquez sur **Confirm**

#### 1.2 Récupérer votre chaîne de connexion

1. Allez sur **Database** > Cliquez sur **Connect** sur votre cluster
2. Choisissez **"Connect your application"**
3. Copiez la chaîne de connexion (format : `mongodb+srv://...`)
4. **IMPORTANT** : Remplacez `<password>` par votre vrai mot de passe

Exemple :
```
mongodb+srv://username:MonMotDePasse123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Étape 2 : Configuration Vercel - Variables d'Environnement

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet **winnersconsulting**
3. Cliquez sur **Settings** (en haut)
4. Cliquez sur **Environment Variables** (dans le menu de gauche)

#### 2.1 Ajoutez ces 3 variables OBLIGATOIRES :

| Variable Name | Value | Environnement |
|--------------|-------|---------------|
| **MONGO_URL** | Votre chaîne de connexion MongoDB (voir Étape 1.2) | ✅ Production<br>✅ Preview<br>✅ Development |
| **DB_NAME** | `winnersconsulting` | ✅ Production<br>✅ Preview<br>✅ Development |
| **JWT_SECRET** | Une clé secrète forte (min 32 caractères) | ✅ Production<br>✅ Preview<br>✅ Development |

**Exemple pour JWT_SECRET** (générez-en un unique) :
```
wC5m9$hP2@nK8vL3xR7qT4yF6zN1bV0sD
```

#### 2.2 Comment ajouter une variable :

1. Cliquez sur **Add New**
2. Entrez le **Name** (par exemple : `MONGO_URL`)
3. Entrez la **Value** (votre chaîne de connexion MongoDB)
4. Cochez **Production**, **Preview** et **Development**
5. Cliquez sur **Save**
6. Répétez pour les 3 variables

### Étape 3 : Redéployer

Une fois les variables ajoutées, vous DEVEZ redéployer :

#### Option A : Via Vercel Dashboard
1. Allez dans **Deployments**
2. Cliquez sur les **3 points** (⋯) du dernier déploiement
3. Sélectionnez **Redeploy**
4. Cliquez sur **Redeploy** dans la popup

#### Option B : Via Git Push
```bash
git add .
git commit -m "Fix: Add environment variables configuration"
git push origin main
```

### Étape 4 : Initialiser le compte Admin

Une fois le redéploiement terminé (après 2-3 minutes) :

1. Ouvrez votre terminal ou Postman
2. Exécutez cette commande (remplacez `votre-site.vercel.app` par votre vraie URL) :

```bash
curl -X POST https://votre-site.vercel.app/api/admin/setup
```

Cela créera le compte administrateur :
- **Email** : `admin@winners-consulting.com`
- **Mot de passe** : `Admin2025!`

⚠️ **IMPORTANT** : Changez ce mot de passe dès la première connexion !

### Étape 5 : Ajouter des données initiales

Connectez-vous en tant qu'admin et ajoutez des données :

1. Allez sur `https://votre-site.vercel.app`
2. Cliquez sur **Se connecter**
3. Utilisez les identifiants admin ci-dessus
4. Allez dans le **Panneau Admin**
5. Ajoutez des :
   - Universités
   - Offres/Programmes
   - Logements

**OU** utilisez le endpoint de seed pour ajouter des données de test :

```bash
curl -X POST https://votre-site.vercel.app/api/admin/seed-data \
  -H "Authorization: Bearer VOTRE_TOKEN_ADMIN"
```

## 🧪 Tests de Vérification

### Test 1 : API fonctionne
```bash
curl https://votre-site.vercel.app/api/
```
Devrait retourner : `{"message":"Winners Consulting API","status":"ok"}`

### Test 2 : Récupérer les offres
```bash
curl https://votre-site.vercel.app/api/offers
```
Devrait retourner un tableau JSON (peut être vide si pas de données)

### Test 3 : Login
Ouvrez votre site et essayez de vous connecter avec un compte test.

### Test 4 : Console navigateur
1. Ouvrez votre site
2. Appuyez sur **F12**
3. Allez dans l'onglet **Console**
4. Vérifiez qu'il n'y a pas d'erreurs rouges

## 🐛 Dépannage

### Problème : "Erreur de connexion" au login

**Causes possibles** :
- MongoDB Atlas n'autorise pas les connexions (Vérifiez Network Access = 0.0.0.0/0)
- Variables d'environnement manquantes sur Vercel
- Mot de passe MongoDB incorrect dans MONGO_URL

**Solution** :
1. Vérifiez les logs Vercel : Dashboard > Deployments > View Function Logs
2. Cherchez les erreurs liées à MongoDB
3. Vérifiez que votre MONGO_URL est correcte

### Problème : Les offres ne s'affichent pas

**Cause** : Base de données vide

**Solution** :
1. Connectez-vous en tant qu'admin
2. Ajoutez des offres via le panneau admin
3. OU utilisez le endpoint `/api/admin/seed-data`

### Problème : 500 Internal Server Error

**Cause** : Variables d'environnement manquantes

**Solution** :
1. Vérifiez que les 3 variables sont définies sur Vercel
2. Vérifiez les Function Logs sur Vercel
3. Redéployez après avoir ajouté les variables

### Problème : CORS Error

**Cause** : Configuration CORS (rare)

**Solution** : L'API autorise déjà tous les origins. Vérifiez dans `/api/index.py` :
```python
allow_origins=["*"]
```

## 📊 Vérification des Variables d'Environnement

Pour vérifier que vos variables sont bien configurées sur Vercel :

1. Allez sur **Settings** > **Environment Variables**
2. Vous devriez voir :
   - ✅ MONGO_URL (avec des points : `mongodb+srv://use...`)
   - ✅ DB_NAME (valeur : `winnersconsulting`)
   - ✅ JWT_SECRET (masqué pour sécurité)
3. Chaque variable doit avoir **3 checkmarks** (Production, Preview, Development)

## 📁 Architecture du Projet Vercel

```
Votre Site Vercel (https://votre-site.vercel.app)
│
├── Frontend React (/)
│   ├── Build statique dans /frontend/build
│   ├── Utilise .env.production (REACT_APP_BACKEND_URL vide)
│   └── Appels API vers /api/*
│
├── Backend API (/api/*)
│   ├── Fonction Serverless Python (/api/index.py)
│   ├── Variables d'env : MONGO_URL, DB_NAME, JWT_SECRET
│   └── Connecté à MongoDB Atlas
│
└── MongoDB Atlas (Cloud)
    ├── Autorise 0.0.0.0/0
    └── Base de données : winnersconsulting
```

## 🎯 Checklist Finale

Avant de considérer que c'est résolu :

- [ ] MongoDB Atlas autorise 0.0.0.0/0 dans Network Access
- [ ] 3 variables d'environnement ajoutées sur Vercel (MONGO_URL, DB_NAME, JWT_SECRET)
- [ ] Site redéployé après ajout des variables
- [ ] Compte admin créé via `/api/admin/setup`
- [ ] Test de login fonctionne
- [ ] Les offres s'affichent (après ajout de données)
- [ ] Aucune erreur dans Console navigateur (F12)
- [ ] Aucune erreur dans Function Logs Vercel

## 🆘 Besoin d'Aide ?

Si après avoir suivi ce guide, ça ne fonctionne toujours pas :

1. **Vérifiez les Function Logs** :
   - Vercel Dashboard > Deployments > Cliquez sur votre déploiement
   - Cliquez sur **View Function Logs**
   - Cherchez les erreurs

2. **Vérifiez la Console du navigateur** :
   - Ouvrez votre site
   - Appuyez sur F12
   - Regardez l'onglet Console et Network

3. **Testez l'API directement** :
   ```bash
   curl https://votre-site.vercel.app/api/
   ```

4. **Partagez les erreurs exactes** que vous voyez dans les logs

---

**Bon déploiement ! 🚀**
