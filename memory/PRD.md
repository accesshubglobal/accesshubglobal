# Winner's Consulting - Product Requirements Document

## Apercu du projet
Winner's Consulting est une plateforme de consultation pour etudes a l'etranger (Chine, France). React + FastAPI + MongoDB Atlas.

## Architecture
- **Frontend** : React 19, Tailwind CSS, html2pdf.js
- **Backend** : FastAPI, Motor (Async MongoDB)
- **Base de donnees** : MongoDB Atlas (`winnersconsulting`)
- **Deploiement** : Vercel (api/index.py)
- **Stockage fichiers** : Cloudinary (upload direct navigateur)

## Architecture Backend
```
api/
  _models.py      # Source unique: tous les modeles Pydantic
  _helpers.py     # DB, Auth, Utility functions
  _routes.py      # Source unique: TOUTES les routes API (~95+ routes)
  index.py        # Adaptateur Vercel
  requirements.txt
backend/
  server.py       # Adaptateur local (+ WebSocket)
  .env
```

## Fonctionnalites COMPLETEES
- [x] Authentification JWT (admin + users)
- [x] Catalogue de programmes depuis MongoDB
- [x] Candidatures completes (4 etapes) + re-soumission apres modification
- [x] Upload direct Cloudinary
- [x] Panel admin complet (CRUD offres, candidatures, messages, stats, newsletter)
- [x] Chat admin/user + PDF/Impression
- [x] Newsletter + Frais de dossier dynamiques par offre
- [x] Conditions Generales editables + QR codes
- [x] Messages admin avec pieces jointes + split-screen
- [x] Consolidation backend (server.py + api/index.py -> _routes.py)
- [x] Boutons CTA fonctionnels
- [x] Bannieres admin-manageables
- [x] Temoignages fonctionnels + validation admin
- [x] Formulaire contact fonctionnel
- [x] FAQ dynamiques gestion admin
- [x] Section Services interactive avec modals detailles
- [x] Admin Candidatures redesign (vue detail, messagerie, statut "Modifier")
- [x] Re-soumission utilisateur (documents + re-submit quand status=modify)
- [x] Pieces jointes dans messages admin candidature
- [x] Bug fix: page blanche (admissionConditions + AuthContext erreurs Pydantic)
- [x] **Footer fonctionnel** (24 Mars 2026):
  - Liens Services: scroll vers section Services + ouverture du modal correspondant
  - Liens Programmes: scroll vers section Programmes + filtre par categorie
  - "Devenir Partenaire": scroll vers section Contact
  - Communication via CustomEvent (openServiceModal, filterProgram)

## Credentials
- **Admin** : admin@winners-consulting.com / Admin2025!

## Key API Endpoints (recent)
- PUT /api/admin/applications/{id}/status?status=modify&reason=...
- POST /api/admin/applications/{id}/message (supports attachments)
- GET /api/admin/applications/{id}/messages
- PUT /api/applications/{id}/resubmit (user, status must be "modify")
- PUT /api/applications/{id}/documents (user, updates documents array)

## Backlog
- [ ] Paiement en ligne (P1)
- [ ] Emails automatiques pour changements de statut (P2)
- [ ] Refactoring AdminCMS.jsx en sous-composants (P3)
- [ ] Configuration variables Cloudinary Vercel (verification utilisateur)
- [ ] Commit GitHub pour deploiement Vercel

## Notes techniques
- Routes API: `/app/api/_routes.py` (source unique)
- Footer utilise CustomEvent pour communiquer avec ServicesSection et ProgramsSection
- Variables Cloudinary Vercel: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
