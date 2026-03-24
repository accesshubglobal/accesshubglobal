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
  _routes.py      # Source unique: TOUTES les routes API (~75 routes)
  index.py        # Adaptateur Vercel (thin wrapper, ~40 lignes)
  requirements.txt
backend/
  server.py       # Adaptateur local (thin wrapper + WebSocket, ~170 lignes)
  .env
```
**Regle d'or**: Pour ajouter/modifier une route, editer UNIQUEMENT `api/_routes.py`.

## Collections MongoDB
users, offers, universities, housing, applications, messages, newsletter, payment_settings, chats, notifications, password_resets, site_settings

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
- [x] QR codes par upload d'image
- [x] Messages admin avec pieces jointes + split-screen
- [x] Consolidation server.py / api/index.py (elimination duplication)
- [x] Refactoring general (nettoyage fichiers, reorganisation code)
- [x] Bouton "Commencer maintenant" → /dashboard si connecte, auth sinon
- [x] Bouton "Consultation gratuite" → scroll vers section contact
- [x] Bouton "En savoir plus" (carrousel) → affiche tous les programmes
- [x] Bouton "Nous contacter" (sidebar) → ouvre modal contact (auth requise)
- [x] Bouton "Publier vos besoins" → ouvre formulaire besoins (auth requise)
- [x] Bannieres defilantes admin-manageables (URL ou upload image)
- [x] Suppression champ frais de dossier global (PaymentSettings)

## Credentials
- **Admin** : admin@winners-consulting.com / Admin2025!

## Backlog
- [ ] Paiement en ligne (P1)
- [ ] Emails automatiques pour changements de statut (P2)

## Notes techniques
- Routes API: `/app/api/_routes.py` (source unique)
- Modeles: `/app/api/_models.py`
- Helpers: `/app/api/_helpers.py`
- Variables Cloudinary requises sur Vercel: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
