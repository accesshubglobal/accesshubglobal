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

## Tâches Complétées (mise à jour 04/2026)
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
- [x] Pièces jointes dans la messagerie Partner ↔ Admin (images inline, autres fichiers = lien téléchargement) (FAIT)
- [x] Champs obligatoires supplémentaires UniversityFormModal partenaires : Photo de couverture, Logo, Image principale, Année de création, Président, min. 3 facultés, min. 6 conditions d'admission (FAIT)
- [x] Correction bug OfferFormModal (contenu dupliqué supprimé) (P0 - FAIT)

- [x] Agent Dashboard : formulaire étudiant 7 étapes complet avec validations strictes (P0 bug fix : goNext cause racine = browser form submit sur changement type bouton → Enregistrer changé en type='button' + goNext gère l'étape finale) (FAIT)
- [x] Agent AppPreviewModal : réécrit complet avec toutes les sections (programme, frais, données personnelles, santé, passeport, adresses, famille, contact urgence, timeline, PDF) (FAIT)
- [x] Nouveau type utilisateur **Employeur** (Partenaires d'emploi) : inscription code EM-, approbation admin, dashboard complet (FAIT - 04/2026)
- [x] Dashboard employeur : infos entreprise (logo, couverture, doc officiel upload), gestion offres d'emploi, gestion candidatures (FAIT - 04/2026)
- [x] Offres d'emploi : champs complets, validation admin avant publication, candidature directe CV+lettre (FAIT - 04/2026)
- [x] Section "Offres d'emploi" sur homepage (dark theme dynamique), page publique /emploi avec filtres (FAIT - 04/2026)
- [x] Footer : section "Nos Partenaires" avec 3 liens, Header : lien "Emploi" amber (FAIT - 04/2026)
- [x] Nouveau type utilisateur **Partenaire Logement** : inscription, tableau de bord, gestion propriétés, approbation admin (FAIT - 04/2026)
- [x] Page landing /rejoindre/:type pour tous les rôles (agent, partenaire, employeur, logement) avec config dynamique (FAIT - 04/2026)
- [x] Fix import EmployerRegisterPage manquant dans App.js (FAIT - 04/2026)
- [x] Fix redirect partenaire_logement après login dans AuthModal.jsx (FAIT - 04/2026)
- [x] Section admin 'Partenaires logement' : gestion partenaires + propriétés (LogementPartnersSection) (FAIT - 04/2026)
- [x] Redirect admin_principal/admin_secondaire vers /admin après login (FAIT - 04/2026)
- [x] DashboardShell.jsx : wrapper immersif dark mode partagé pour tous les dashboards (FAIT - 04/2026)
- [x] CompaniesSection + FeaturedCompanyPage : entreprises en vedette sur homepage (FAIT - 04/2026)


### P1 - Priorité haute
- [ ] Intégration paiement en ligne (Stripe ou autre)

### P2 - Priorité moyenne
- [ ] Notifications email automatiques pour changements de statut candidatures

### P3 - Priorité basse
- [ ] Recherche globale dans la navbar
- [ ] Mode sombre CMS admin
- [ ] Badges/réputation forum communautaire
- [x] Refactoring _routes.py → 5 modules séparés dans `api/routers/` (auth, public, admin, agent, partner) — `_routes.py` réduit à 27 lignes

## Credentials
- Admin Principal: admin@winners-consulting.com / Admin2025!
- Resend: auth.accesshubglobal.com
- Contact: accesshubglobal@gmail.com
