# Winner's Consulting - Product Requirements Document

## Apercu du projet
Winner's Consulting est une plateforme de consultation pour etudes a l'etranger (Chine, France). React + FastAPI + MongoDB Atlas.

## Architecture
- **Frontend** : React 19, Tailwind CSS, html2pdf.js
- **Backend** : FastAPI, Motor (Async MongoDB)
- **Base de donnees** : MongoDB Atlas (`winnersconsulting`)
- **Deploiement** : Vercel (api/index.py)
- **Stockage fichiers** : Cloudinary (upload direct navigateur)

## Architecture Backend (Refactored - 24 Mars 2026)
```
api/
  _models.py      # Source unique: tous les modeles Pydantic
  _helpers.py     # Source unique: DB, auth, serialization, hooks notifications
  _routes.py      # Source unique: TOUTES les routes API (~70 routes)
  index.py        # Adaptateur Vercel (thin wrapper, ~40 lignes)
  requirements.txt
backend/
  server.py       # Adaptateur local (thin wrapper + WebSocket, ~170 lignes)
  .env
```
**Regle d'or**: Pour ajouter/modifier une route, editer UNIQUEMENT `api/_routes.py`. Les deux environnements (local + Vercel) heritent automatiquement.

## Base de donnees
- **URL** : MongoDB Atlas (winnersconsulting.zxnwfnl.mongodb.net)
- **DB** : winnersconsulting
- **Collections** : users, offers, universities, housing, applications, messages, newsletter, payment_settings, chats, notifications, password_resets

## Fonctionnalites COMPLETEES
- [x] Authentification JWT (admin + users)
- [x] Catalogue de programmes (offres, universites, logements) depuis MongoDB
- [x] Candidatures completes (4 etapes: info, documents, paiement, confirmation)
- [x] Upload direct Cloudinary (bypass Vercel 4.5MB limit)
- [x] Panel admin (CRUD offres, candidatures, messages, stats, newsletter)
- [x] Chat differencie admin/user
- [x] Vue detaillee candidatures + PDF/Impression
- [x] Newsletter (inscription + gestion admin + export CSV)
- [x] Nettoyage mock data - tout sur MongoDB Atlas reel
- [x] Frais de dossier dynamiques par offre
- [x] Conditions Generales editables via admin CMS
- [x] QR codes par upload d'image (pas de liens)
- [x] Messages admin avec pieces jointes + split-screen
- [x] **Consolidation server.py / api/index.py** (elimination duplication)
- [x] **Refactoring general** (nettoyage fichiers debug, reorganisation code)

## Credentials
- **Admin** : admin@winners-consulting.com / Admin2025!
- **User test** : etudiant@test.com / Test1234!

## Backlog
- [ ] Paiement en ligne (P1)
- [ ] Emails automatiques (P2)

## Notes techniques
- Backend local: `/app/backend/server.py` (adaptateur + WebSocket)
- Backend production: `/app/api/index.py` (adaptateur Vercel)
- Routes API: `/app/api/_routes.py` (source unique)
- Modeles: `/app/api/_models.py`
- Helpers: `/app/api/_helpers.py`
- Contenu UI statique: `/app/frontend/src/data/siteContent.js`
- Variables Cloudinary requises sur Vercel: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

## Dernier changement (24 Mars 2026)
- Consolidation backend: elimination de ~2900 lignes de code duplique
- Creation de modules partages (_models.py, _helpers.py, _routes.py)
- server.py reduit de 1612 a ~170 lignes
- api/index.py reduit de 1312 a ~40 lignes
- Nettoyage des fichiers debug/documentation obsoletes
- 23 tests automatises passes (100% backend + frontend)
