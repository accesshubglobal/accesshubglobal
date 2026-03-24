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
  _routes.py      # Source unique: TOUTES les routes API (~90 routes)
  index.py        # Adaptateur Vercel (thin wrapper)
  requirements.txt
backend/
  server.py       # Adaptateur local (thin wrapper + WebSocket)
  .env
```

## Collections MongoDB
users, offers, universities, housing, applications, messages, newsletter, payment_settings, chats, notifications, password_resets, site_settings, testimonials, contact_messages

## Fonctionnalites COMPLETEES
- [x] Authentification JWT (admin + users)
- [x] Catalogue de programmes depuis MongoDB
- [x] Candidatures completes (4 etapes)
- [x] Upload direct Cloudinary
- [x] Panel admin complet (CRUD offres, candidatures, messages, stats, newsletter)
- [x] Chat admin/user
- [x] PDF/Impression candidatures
- [x] Newsletter
- [x] Frais de dossier dynamiques par offre
- [x] Conditions Generales editables
- [x] QR codes par upload d'image
- [x] Messages admin avec pieces jointes + split-screen
- [x] Consolidation server.py / api/index.py
- [x] Boutons fonctionnels (Commencer, Consultation, En savoir plus, Nous contacter, Publier besoins)
- [x] Bannieres admin-manageables
- [x] **Temoignages fonctionnels** - soumission utilisateur + validation admin
- [x] **Formulaire contact fonctionnel** - envoi public + gestion admin
- [x] **FAQ dynamiques** - gestion admin (ajouter/modifier/supprimer)

## Credentials
- **Admin** : admin@winners-consulting.com / Admin2025!

## Backlog
- [ ] Paiement en ligne (P1)
- [ ] Emails automatiques pour changements de statut (P2)

## Notes techniques
- Routes API: `/app/api/_routes.py` (source unique)
- Variables Cloudinary sur Vercel: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
