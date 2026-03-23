# Winner's Consulting - Product Requirements Document

## Aperçu du projet
Winner's Consulting est une plateforme de consultation pour études à l'étranger permettant aux étudiants de trouver des programmes d'études, des bourses et des logements en Chine et en France.

## Architecture technique
- **Frontend** : React 19, Tailwind CSS, Radix UI, html2pdf.js
- **Backend** : FastAPI (Python 3.11) - Serverless Functions
- **Base de données** : MongoDB Atlas
- **Déploiement** : Vercel
- **Stockage fichiers** : Cloudinary (upload direct navigateur→Cloudinary)

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
- [x] Upload fichiers via Cloudinary direct (bypass Vercel 4.5MB limit)
- [x] Vue détaillée des candidatures avec toutes les infos de l'offre + PDF
- [x] Newsletter fonctionnelle (inscription footer + gestion admin + export CSV)
- [x] Fix messages admin/user (isAdmin)
- [x] Fix liste documents requis dans modal candidature
- [x] Fix upload preuve de paiement en production

### Backlog (P2)
- [ ] Paiement en ligne
- [ ] Envoi d'emails automatiques
- [ ] Intégration calendrier
- [ ] Consolidation server.py / api/index.py

## Credentials de test
- **Admin** : admin@winners-consulting.com / Admin2025!
- **User test** : etudiant@test.com / Test1234!

## Derniers changements (23 Mars 2026)
- Fix documents list: ApplicationModal lit requiredDocuments puis documents
- Fix upload: endpoint GET /api/upload/signature + upload direct Cloudinary via fetch()
- Fix CORS: remplacé axios par fetch() pour l'upload Cloudinary
- Newsletter: POST /api/newsletter/subscribe, GET/DELETE /api/admin/newsletter
- Fix isAdmin manquant dans admin reply (server.py)

## Notes Production (Vercel)
- Backend production: /app/api/index.py (pas /app/backend/server.py)
- Variables Cloudinary requises dans Vercel: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
