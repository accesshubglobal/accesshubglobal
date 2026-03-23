# Winner's Consulting - Product Requirements Document

## Aperçu du projet
Winner's Consulting est une plateforme de consultation pour études à l'étranger (Chine, France). React + FastAPI + MongoDB Atlas.

## Architecture
- **Frontend** : React 19, Tailwind CSS, html2pdf.js
- **Backend** : FastAPI, Motor (Async MongoDB)
- **Base de données** : MongoDB Atlas (`winnersconsulting`)
- **Déploiement** : Vercel (api/index.py)
- **Stockage fichiers** : Cloudinary (upload direct navigateur)

## Base de données
- **URL** : MongoDB Atlas (winnersconsulting.zxnwfnl.mongodb.net)
- **DB** : winnersconsulting
- **Collections** : users, offers, universities, housing, applications, messages, newsletter, payment_settings, chats, notifications

## Fonctionnalités COMPLÉTÉES
- [x] Authentification JWT (admin + users)
- [x] Catalogue de programmes (offres, universités, logements) depuis MongoDB
- [x] Candidatures complètes (4 étapes: info, documents, paiement, confirmation)
- [x] Upload direct Cloudinary (bypass Vercel 4.5MB limit)
- [x] Panel admin (CRUD offres, candidatures, messages, stats, newsletter)
- [x] Chat différencié admin/user
- [x] Vue détaillée candidatures + PDF/Impression
- [x] Newsletter (inscription + gestion admin + export CSV)
- [x] Nettoyage mock data - tout sur MongoDB Atlas réel

## Credentials
- **Admin** : admin@winners-consulting.com / Admin2025!
- **User test** : etudiant@test.com / Test1234!

## Backlog (P2)
- [ ] Paiement en ligne
- [ ] Emails automatiques
- [ ] Consolidation server.py / api/index.py

## Notes techniques
- Backend local: `/app/backend/server.py`
- Backend production: `/app/api/index.py`
- Contenu UI statique: `/app/frontend/src/data/siteContent.js` (pas du mock, c'est du contenu de site)
- Variables Cloudinary requises sur Vercel: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

## Dernier changement (23 Mars 2026)
- Suppression totale de ~900 lignes de mock/seed data (server.py)
- Connexion directe MongoDB Atlas (plus de données locales)
- Données insérées dans la vraie base: 20 offres, 17 universités, 16 logements
- mockData.js renommé → siteContent.js, offersData.js supprimé
