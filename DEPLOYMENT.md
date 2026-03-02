# Guide de Déploiement sur Vercel

Ce guide vous montre comment déployer Winner's Consulting sur Vercel avec MongoDB Atlas.

## Prérequis

1. Un compte [Vercel](https://vercel.com)
2. Un cluster [MongoDB Atlas](https://cloud.mongodb.com) configuré
3. Un repository GitHub avec ce projet

## Étape 1 : Configuration MongoDB Atlas

### 1.1 Créer un cluster
1. Connectez-vous à MongoDB Atlas
2. Créez un nouveau cluster (le tier gratuit M0 suffit)
3. Choisissez un provider et une région proche de vos utilisateurs

### 1.2 Configurer l'accès réseau
1. Allez dans **Network Access**
2. Cliquez sur **Add IP Address**
3. Sélectionnez **Allow Access from Anywhere** (0.0.0.0/0)
   - Note: C'est nécessaire car Vercel utilise des IPs dynamiques

### 1.3 Créer un utilisateur de base de données
1. Allez dans **Database Access**
2. Cliquez sur **Add New Database User**
3. Créez un utilisateur avec un mot de passe fort
4. Donnez-lui le rôle `readWrite`

### 1.4 Obtenir la chaîne de connexion
1. Cliquez sur **Connect** sur votre cluster
2. Choisissez **Connect your application**
3. Copiez la chaîne de connexion
4. Remplacez `<password>` par votre mot de passe

## Étape 2 : Déploiement sur Vercel

### 2.1 Importer le projet
1. Allez sur [vercel.com/new](https://vercel.com/new)
2. Importez votre repository GitHub
3. Vercel détectera automatiquement `vercel.json`

### 2.2 Configurer les variables d'environnement
Ajoutez ces variables dans **Settings > Environment Variables** :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `MONGO_URL` | Chaîne de connexion MongoDB Atlas | `mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority` |
| `DB_NAME` | Nom de la base de données | `winnersconsulting` |
| `JWT_SECRET` | Clé secrète pour les tokens (générez une clé forte) | `votre-cle-secrete-de-32-caracteres-minimum` |

### 2.3 Déployer
1. Cliquez sur **Deploy**
2. Attendez que le build se termine
3. Votre application sera disponible sur `votre-projet.vercel.app`

## Étape 3 : Configuration post-déploiement

### 3.1 Créer le compte administrateur
Après le premier déploiement, appelez cet endpoint pour créer l'admin :

```bash
curl -X POST https://votre-projet.vercel.app/api/admin/setup
```

Cela créera :
- Email : `admin@winners-consulting.com`
- Mot de passe : `Admin2025!`

**IMPORTANT** : Changez ce mot de passe immédiatement !

### 3.2 Ajouter des données initiales (optionnel)
Connectez-vous en tant qu'admin et utilisez le panneau d'administration pour ajouter :
- Des universités
- Des programmes d'études
- Des logements

## Dépannage

### Erreur de build NPM
Si vous avez des erreurs de dépendances :
- Le fichier `.npmrc` contient `legacy-peer-deps=true`
- Le build utilise `CI=false` pour ignorer les warnings ESLint

### Erreur de connexion MongoDB
1. Vérifiez que l'IP 0.0.0.0/0 est autorisée dans Network Access
2. Vérifiez que le mot de passe ne contient pas de caractères spéciaux non encodés
3. Testez la connexion avec MongoDB Compass

### Erreur 500 sur les routes API
1. Vérifiez les logs Vercel dans **Deployments > Logs**
2. Assurez-vous que toutes les variables d'environnement sont définies

## Structure du projet

```
/
├── api/
│   ├── index.py          # API FastAPI (Serverless Function)
│   └── requirements.txt  # Dépendances Python
├── frontend/
│   ├── build/           # Build de production React
│   ├── src/             # Code source
│   └── package.json     # Dépendances Node.js
├── vercel.json          # Configuration Vercel
├── .nvmrc               # Version Node.js (20)
└── .npmrc               # Configuration npm
```

## Support

Pour toute question, créez une issue sur le repository GitHub.
