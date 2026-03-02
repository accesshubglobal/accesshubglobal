# Winner's Consulting - Product Requirements Document

## Aperçu du projet

Winner's Consulting est une plateforme de consultation pour études à l'étranger permettant aux étudiants de trouver des programmes d'études, des bourses et des logements en Chine et en France.

## Problème initial

Le client souhaitait configurer son site existant pour un déploiement sur Vercel avec MongoDB Atlas. Les contraintes spécifiques étaient :
- Utiliser npm au lieu de yarn pour les dépendances Vercel
- Forcer Node.js 20 (incompatibilité avec react-scripts@5.0.1 sur Node 24)
- Pré-compiler le frontend
- S'assurer que le dossier build est poussé sur GitHub

## Architecture technique

### Stack technologique
- **Frontend** : React 19, Tailwind CSS, Radix UI
- **Backend** : FastAPI (Python 3.11) - Serverless Functions
- **Base de données** : MongoDB Atlas
- **Déploiement** : Vercel

### Structure du projet
```
/
├── api/                    # Backend FastAPI (Serverless)
│   ├── index.py           # API principale avec tous les endpoints
│   └── requirements.txt   # Dépendances Python
├── frontend/              # Frontend React
│   ├── build/            # Build de production pré-compilé
│   ├── src/              # Code source React
│   └── package.json      # Dépendances Node.js
├── vercel.json           # Configuration Vercel
├── .nvmrc                # Version Node.js (20)
└── .npmrc                # Configuration npm (legacy-peer-deps)
```

## Fonctionnalités implémentées

### Core (P0)
- [x] Page d'accueil avec présentation des services
- [x] Catalogue de programmes d'études avec filtres
- [x] Système d'authentification JWT
- [x] Panel utilisateur (favoris, candidatures, messages)
- [x] Panel administrateur complet

### Secondaires (P1)
- [x] Chat en direct
- [x] Système de notifications
- [x] Multilinguisme (FR/EN/CN)
- [x] Recherche et filtres avancés

### Non implémentées (P2/Backlog)
- [ ] Paiement en ligne
- [ ] Envoi d'emails automatiques
- [ ] Intégration calendrier
- [ ] Application mobile

## Configuration Vercel

### Variables d'environnement requises
| Variable | Description |
|----------|-------------|
| `MONGO_URL` | Chaîne de connexion MongoDB Atlas |
| `DB_NAME` | Nom de la base de données |
| `JWT_SECRET` | Clé secrète pour les tokens JWT |

### Build command
```bash
cd frontend && npm install --legacy-peer-deps && CI=false npm run build
```

## Modifications effectuées (18 Fév 2026)

1. **Création de l'API Serverless** (`/app/api/index.py`)
   - Conversion du backend FastAPI en serverless function avec Mangum
   - Support complet de tous les endpoints

2. **Configuration Vercel** (`/app/vercel.json`)
   - Build command avec npm et legacy-peer-deps
   - Configuration des fonctions Python 3.11
   - Rewrites pour les routes API

3. **Mise à jour du frontend**
   - Suppression de packageManager yarn
   - Ajout de engines node 20.x
   - Correction des URLs BACKEND_URL pour supporter les déploiements same-origin
   - Build de production généré

4. **Documentation**
   - README.md mis à jour
   - DEPLOYMENT.md créé avec instructions détaillées

## Tests validés

- ✅ Page d'accueil s'affiche correctement
- ✅ API /api/offers répond correctement (5 offres)
- ✅ API /api/universities répond correctement (5 universités)
- ✅ Navigation fonctionne
- ✅ Modal d'authentification s'ouvre
- ✅ Système de filtres fonctionne
- ✅ Admin setup fonctionne

## Prochaines étapes

1. Déployer sur Vercel
2. Configurer les variables d'environnement MongoDB Atlas
3. Créer le compte admin en production
4. Tester les fonctionnalités en production

## Credentials de test

- **Admin** : admin@winners-consulting.com / Admin2025!
