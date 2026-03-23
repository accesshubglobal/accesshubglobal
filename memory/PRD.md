# Winner's Consulting - Product Requirements Document

## Aperçu du projet

Winner's Consulting est une plateforme de consultation pour études à l'étranger permettant aux étudiants de trouver des programmes d'études, des bourses et des logements en Chine et en France.

## Architecture technique

### Stack technologique
- **Frontend** : React 19, Tailwind CSS, Radix UI, html2pdf.js
- **Backend** : FastAPI (Python 3.11) - Serverless Functions
- **Base de données** : MongoDB Atlas
- **Déploiement** : Vercel
- **Stockage fichiers** : Cloudinary

### Structure du projet
```
/
├── api/                    # Backend FastAPI (Serverless Vercel)
│   ├── index.py           # API principale
│   └── requirements.txt   # Dépendances Python
├── backend/               # Backend local (développement)
│   ├── server.py          # API locale
│   └── .env               # Variables d'environnement
├── frontend/              # Frontend React
│   ├── src/components/    # Composants React
│   └── package.json       # Dépendances Node.js
├── vercel.json            # Configuration Vercel
└── memory/PRD.md          # Ce document
```

## Fonctionnalités implémentées

### Core (P0) - COMPLÉTÉ
- [x] Page d'accueil avec présentation des services
- [x] Catalogue de programmes avec filtres avancés
- [x] Système d'authentification JWT
- [x] Panel utilisateur (profil, favoris, candidatures, messages)
- [x] Panel administrateur complet (offres, candidatures, messages, stats)
- [x] Déploiement Vercel (SPA routing, serverless backend)

### Fonctionnalités avancées (P1) - COMPLÉTÉ
- [x] Chat différencié (admin à droite, user à gauche)
- [x] Formulaire d'offre admin étendu (frais, conditions, documents, templates)
- [x] Bouton "Postuler" dans les favoris
- [x] Upload fichiers via Cloudinary (production)
- [x] Vue détaillée des candidatures avec toutes les infos de l'offre
- [x] Boutons Imprimer et Télécharger PDF (html2pdf.js)
- [x] Système de notifications
- [x] Chat en direct
- [x] Newsletter fonctionnelle (inscription footer + gestion admin + export CSV)
- [x] Fix messages admin/user (isAdmin manquant dans reply backend)

### Backlog (P2)
- [ ] Paiement en ligne
- [ ] Envoi d'emails automatiques
- [ ] Intégration calendrier
- [ ] Application mobile

## Credentials de test
- **Admin** : admin@winners-consulting.com / Admin2025!
- **User test** : etudiant@test.com / Test1234!

## Derniers changements (23 Mars 2026)
- Newsletter : endpoint POST /api/newsletter/subscribe, GET /api/admin/newsletter, DELETE /api/admin/newsletter/{email}
- Footer : formulaire connecté à l'API avec feedback visuel
- AdminCMS : section Newsletter avec tableau, export CSV, suppression
- Fix isAdmin manquant dans admin reply (server.py)
- Vue détaillée candidatures avec infos complètes de l'offre + PDF
