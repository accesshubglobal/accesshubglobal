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
- [x] **Sécurité — Email unique insensible à la casse** : normalisation lowercase à l'inscription et connexion (FAIT - 04/2026)
- [x] **Sécurité — Nom d'entreprise unique** : vérification croisée users+universities (insensible casse) sur tous les registers (FAIT - 04/2026)
- [x] **Sécurité — Brute force** : blocage après 5 tentatives échouées pendant 15 min (FAIT - 04/2026)
- [x] **Sécurité — JWT 24h** : tokens expirent après 24h (au lieu de 7 jours) (FAIT - 04/2026)
- [x] **Sécurité — Mot de passe fort** : min 8 chars + 1 majuscule + 1 chiffre (backend + indicateur visuel frontend) (FAIT - 04/2026)
- [x] **Sécurité — Rate limiting** : max 3 inscriptions / 5 min et max 10 connexions / 1 min par email (FAIT - 04/2026)
- [x] **Sécurité — Sanitisation** : strip, truncate, suppression caractères de contrôle sur tous les champs texte (FAIT - 04/2026)
- [x] **Compte Agent — Gate documents** : Onglet "Mes Documents" avec pièce d'identité + justificatif de domicile obligatoires. Bloque inscription étudiants jusqu'à validation admin. Admin voit les docs + bouton "Valider docs" (FAIT - 04/2026)
- [x] **Compte Employeur** : Gate code activation chaque connexion (ActivationCodeGate), doc officiel obligatoire, re-approbation sur edit profil, contrat PDF admin, gestion code admin (FAIT - 04/2026)
- [x] **Compte Université/Partenaire** : Gate code activation chaque connexion (PartnerActivationCodeGate), onglet Contrat dans dashboard, endpoints admin upload contrat + gestion code (FAIT - 04/2026)
- [x] **Compte Logement — Gate code** : LogementActivationCodeGate (LG-XXXXXXXX) bloque dashboard jusqu'à saisie code (FAIT - 04/2026)
- [x] **Compte Logement — Contrat** : Onglet Contrat dans sidebar, admin upload PDF via LogementPartnersSection (FAIT - 04/2026)
- [x] **Compte Logement — Entreprise** : Onglet Mon Entreprise avec infos société + doc officiel obligatoire + pièce d'identité obligatoire (FAIT - 04/2026)
- [x] **Compte Logement — Dupliquer annonce** : Bouton Dupliquer sur chaque annonce dans Mes Annonces (FAIT - 04/2026)
- [x] **Compte Logement — Fix sidebar** : mt-auto sur footer pour coller en bas de page (FAIT - 04/2026)
- [x] **Admin LogementPartners** : Code LG-TESTCODE affiché, modale modifier code + upload contrat (FAIT - 04/2026)


|- [x] **Fix Bug Gate Code** : Clé sessionStorage remplacée de `user?.id` (null lors du 1er render async) par `token.slice(-16)` — cohérence garantie dans tous les 4 dashboards (Agent, Partenaire, Employeur, Logement) (FAIT - 04/2026)
|- [x] **Fix Bug PDF Contrat** : `fixPdfUrl` retourne l'URL inchangée (plus de conversion `/image/upload/` → `/raw/upload/` qui créait des 404 pour les anciens uploads). `downloadFile` ajoute `fl_attachment` correctement (FAIT - 04/2026)
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
