# AccessHub Global - PRD

## Projet
Application full-stack (React + FastAPI + MongoDB) pour AccessHub Global (anciennement Winner's Consulting), une agence de conseil en études internationales (Chine & France).

## Fonctionnalités Principales
- Site vitrine multi-sections (Accueil, Programmes, Universités, Logement, Blog, Communauté)
- Système d'authentification RBAC (user, agent, admin_secondaire, admin_principal, partenaire)
- CMS Admin complet pour gestion de contenu (refactorisé en 20+ composants)
- Système de candidature avec suivi et messagerie
- Système d'agents/partenaires avec codes d'activation
- Vérification email et récupération de mot de passe (Resend)
- Upload d'images (Cloudinary)
- 5 pages institutionnelles (À propos, Informations, Mentions légales, Confidentialité, CGU)
- i18n site-wide (FR/EN)
- Rôle Partenaire complet avec tableau de bord, université, offres, messagerie

## Architecture Technique
- Frontend: React (CRA) + TailwindCSS + Shadcn/UI
- Backend: FastAPI + MongoDB
- Intégrations: Cloudinary (images), Resend (emails via auth.accesshubglobal.com)

## Composants Partagés (DRY)
- `OfferFormModal.jsx` — Utilisé par Admin ET Partenaire (props: isPartner, feesOnlyMode, submitLabel)
- `UniversityFormModal.jsx` — Utilisé par Admin ET Partenaire (props: isPartner pour validation stricte)

## Tâches Complétées
- [x] RBAC System
- [x] Agent/Partner System
- [x] Email verification + Forgot password (Resend)
- [x] University Feature Overhaul
- [x] Refactoring AdminCMS.jsx (5081→138 lignes)
- [x] Rebranding Winner's Consulting → AccessHub Global
- [x] Nouveau favicon + logo
- [x] Header mobile redesigné (Logo|Login|Langue|Menu)
- [x] Footer redesigné avec logo noir + scroll-to-top
- [x] Resend domaine mis à jour (auth.accesshubglobal.com)
- [x] Fix upload images universités
- [x] 5 pages institutionnelles (/about, /company, /legal, /privacy, /terms)
- [x] Formulaire candidature étendu: 11 sections
- [x] Export PDF admin des candidatures (html2pdf.js)
- [x] Système newsletter automatique Resend
- [x] Traductions i18n complètes (FR/EN)
- [x] Rôle Partenaire: inscription, tableau de bord, validation admin
- [x] OfferFormModal partagé Admin + Partenaire
- [x] Admin: mode feesOnlyMode pour révision offres partenaires (P0 - FAIT)
- [x] UniversityFormModal partagé avec validation stricte partenaires (P0 - FAIT)
  - Min. 5 photos obligatoires
  - Vidéo YouTube obligatoire
  - Tous champs requis marqués *
- [x] Blocage offres si aucune université soumise (frontend + backend) (P0 - FAIT)
- [x] Messagerie Partner ↔ Admin dans tableau de bord partenaire (P0 - FAIT)
- [x] Correction bug OfferFormModal (contenu dupliqué supprimé) (P0 - FAIT)

## Tâches À Venir
### P1 - Priorité haute
- [ ] Intégration paiement en ligne (Stripe ou autre)

### P2 - Priorité moyenne
- [ ] Notifications email automatiques pour changements de statut candidatures

### P3 - Priorité basse
- [ ] Recherche globale dans la navbar
- [ ] Mode sombre CMS admin
- [ ] Badges/réputation forum communautaire
- [ ] Refactoring _routes.py en modules séparés (2685+ lignes actuellement)

## Credentials
- Admin Principal: admin@winners-consulting.com / Admin2025!
- Resend: auth.accesshubglobal.com
- Contact: accesshubglobal@gmail.com
