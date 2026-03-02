# Winner's Consulting - Plateforme d'études à l'étranger

Application full-stack pour la gestion de consultations d'études à l'étranger.

## Structure du projet

```
/
├── api/                    # Backend FastAPI (Vercel Serverless)
│   ├── index.py           # API principale
│   └── requirements.txt   # Dépendances Python
├── frontend/              # Frontend React
│   ├── build/            # Build de production (pré-compilé)
│   ├── src/              # Code source React
│   └── package.json      # Dépendances Node.js
├── vercel.json           # Configuration Vercel
└── .nvmrc                # Version Node.js (20)
```

## Déploiement sur Vercel

### 1. Prérequis

- Compte Vercel
- Cluster MongoDB Atlas configuré
- Repository GitHub connecté à Vercel

### 2. Variables d'environnement à configurer dans Vercel

Dans les paramètres du projet Vercel (Settings > Environment Variables), ajoutez :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `MONGO_URL` | Chaîne de connexion MongoDB Atlas | `mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority` |
| `DB_NAME` | Nom de la base de données | `winnersconsulting` |
| `JWT_SECRET` | Clé secrète pour les tokens JWT | `votre-cle-secrete-complexe` |

### 3. Configuration MongoDB Atlas

1. Créez un cluster sur [MongoDB Atlas](https://cloud.mongodb.com/)
2. Créez un utilisateur de base de données
3. Configurez l'accès réseau (Network Access) :
   - Ajoutez `0.0.0.0/0` pour permettre l'accès depuis Vercel
4. Copiez la chaîne de connexion

### 4. Déploiement

1. Connectez votre repository GitHub à Vercel
2. Vercel détectera automatiquement la configuration `vercel.json`
3. Ajoutez les variables d'environnement
4. Déployez !

## Fonctionnalités

- 🎓 Catalogue de programmes d'études
- 🏫 Annuaire des universités
- 🏠 Recherche de logements
- 👤 Système d'authentification
- 📝 Candidatures en ligne
- 💬 Chat en direct avec les conseillers
- 🔔 Système de notifications
- 🛠️ Panel d'administration complet

## Administration

Après le premier déploiement, créez le compte administrateur en appelant :

```
POST /api/admin/setup
```

Cela créera un compte admin avec :
- Email : `admin@winners-consulting.com`
- Mot de passe : `Admin2025!`

**Important** : Changez ce mot de passe après la première connexion !

## Technologies

- **Frontend** : React 19, Tailwind CSS, Radix UI
- **Backend** : FastAPI, Python 3.11
- **Base de données** : MongoDB Atlas
- **Déploiement** : Vercel (Serverless)

## Support

Pour toute question, contactez l'équipe de développement.
