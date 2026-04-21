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


|- [x] **Logements dynamiques** : Nouvel endpoint `GET /api/housing-all` qui combine logements admin (`housing` collection) et logements partenaires (`logement_properties`) en format normalisé. `HousingSection.jsx` (accueil) et `LogementsPage.jsx` (/logements) mis à jour pour afficher les deux sources. Fix `amenities` → `features` dans le formulaire admin. (FAIT - 04/2026) : Nouveau design immersif avec 2 thèmes distincts — Principal (noir minuit #08080f + or #f59e0b) / Secondaire (slate #0f172a + teal #14b8a6). Sidebar refactorisée avec groupes expandables, badges de rôle, toggle collapse. Header avec breadcrumb, pills de rôle et avatar thématique. (FAIT - 04/2026)
|- [x] **Page détail logement** : Cliquer sur une annonce ouvre un modal détail complet (galerie photos avec navigation, localisation, équipements, surface/pièces, description, prix). Bouton "Contacter le propriétaire" ouvre le formulaire de contact. Vue carte : popup "Voir détails" ouvre aussi ce modal. (FAIT - 05/2026)
|- [x] **Section Études** : Navbar "Bourse" → "Études". Page `/etudes` avec 3 cartes destinations animées (Chine, France, Canada). Pages détail `/etudes/chine`, `/etudes/france`, `/etudes/canada` avec hero, stats, 5 onglets chacune (vue d'ensemble, système éducatif, candidature, visa, coût de vie). Contenu Chine basé sur PDFs fournis. (FAIT - 05/2026)
|- [x] **Certificats & Admissions** : Section sur `/about` affichant photos de certificats d'honneur et lettres d'admission obtenues. Gestion admin via "Certificats & Admissions" dans la sidebar (ajout image+titre+description, suppression). Endpoints `/api/certificates`, `/api/admissions`, `/api/admin/certificates`, `/api/admin/admissions`. (FAIT - 05/2026)
|- [x] **IDs offres** : L'ID (8 premiers caractères UUID en majuscules) est affiché dans les détails de chaque offre (logement, emploi, bourse). Recherche par ID activée dans les 3 barres de recherche (logements, emplois, bourses). (FAIT - 05/2026)
|- [x] **Modal de revue pré-approbation** : Avant d'approuver un Employeur ou Partenaire Universitaire, l'admin voit un modal `ReviewModal.jsx` avec toutes les infos (personnelles, entreprise, documents téléchargeables) + warning "Dossier incomplet" si données manquantes. (FAIT - 04/2026)
|- [x] **Duplication d'offres** : Bouton Dupliquer (icône Copy, amber) dans Offres, Bourses, Universités et Logements. Endpoints backend `/api/admin/{type}/{id}/duplicate`. (FAIT - 04/2026)
|- [x] **Fix Bug PDF Contrat** : `fixPdfUrl` retourne l'URL inchangée (plus de conversion `/image/upload/` → `/raw/upload/` qui créait des 404 pour les anciens uploads). `downloadFile` ajoute `fl_attachment` correctement (FAIT - 04/2026)
- [x] **Fix Bug 403 upload candidature (user)** : `ApplicationModal.jsx` — `uploadFile()` détecte PDFs/docs et route directement vers backend `/api/upload` (`resource_type='raw'`). Plus de blocage Cloudinary `/auto/upload` pour PDF sur plan free. Fallback backend aussi sur échec Cloudinary images. (FAIT - 05/2026)
- [x] **Étape Révision (Step 5) dans ApplicationModal** : Récapitulatif lecture-seule de toutes les sections (Programme, Perso, Passeport, Formation, Famille, Urgence, Documents, Paiement) avant soumission. Bouton Soumettre uniquement à cette étape. (FAIT - 05/2026)
- [x] **Popup post-soumission** : Après succès, popup gradient vert (`submission-success-modal`) avec `PartyPopper`, message "Candidature envoyée !", boutons "Fermer" et "Se connecter" (redirige vers `/dashboard`). (FAIT - 05/2026)
- [x] **Redesign PDF candidature** : Nouveau `/app/frontend/src/utils/pdfGenerator.js` — en-tête dégradé avec logo AccessHub Global, slogan, tél `+86 13881130175`, email, site. Bandeau référence + badge statut. Grilles Programme / Candidat / Urgence / Frais / Documents. Footer dark. Fichier `AccessHub-Candidature-<REF>.pdf`. (FAIT - 05/2026)
- [x] **Email de confirmation automatique** : Après soumission, le candidat reçoit un email Resend `auth.accesshubglobal.com` avec le PDF récapitulatif en pièce jointe et un bouton CTA vers `/dashboard`. Implémenté avec `BackgroundTasks` (non bloquant) + `send_application_confirmation_email()` dans `_helpers.py`. Nouveau champ optionnel `pdfBase64` + `pdfFilename` dans `FullApplicationWithPDF`. `pdfGenerator.generateApplicationPDF({output:'base64'})` retourne le PDF en base64. (FAIT - 05/2026)
- [x] **Emails temps réel sur changement de statut** : À chaque `PUT /api/admin/applications/{id}/status` ou `/payment-status`, un email transactionnel stylé part automatiquement via Resend. Template dédié par statut (pending/reviewing/accepted/rejected/modify) avec couleur + icône + message + motif si applicable + CTA contextuel. Non bloquant via `BackgroundTasks`. Helpers : `send_application_status_update_email()` + `send_payment_status_email()`. (FAIT - 05/2026)
- [x] **Photo d'identité obligatoire dans la candidature** : Étape 2 (Documents) de `ApplicationModal` affiche une carte dédiée en tête ("Photo d'identité *") avec input `accept="image/jpeg,image/png"`, aperçu 96×96 px, barre de chargement, message "Photo récente sur fond clair…". Validation `canProceedStep2` exige que la photo soit présente pour passer à l'étape 3. L'étape Révision (step 5) affiche la miniature + nom du candidat. Le PDF exporté intègre la photo dans la section "Informations du candidat". Côté admin (`ApplicationsSection.jsx`), un bloc dégradé bleu avec miniature 96×96 px + boutons "Agrandir" et "Télécharger" apparaît en tête du panneau "Documents soumis" — les autres documents restent accessibles en-dessous avec aperçu/téléchargement/image-preview inline. (FAIT - 05/2026)
- [x] **6 corrections candidature (05/2026)** :
  - (1) Bouton "Ajouter un document" dans step 2 → le candidat peut saisir un nom (ex: "Traduction passeport") et ajouter un slot de téléversement supplémentaire (avec bouton Trash pour le retirer).
  - (2) PDF récapitulatif enrichi — nouveau logo AccessHub en en-tête (PNG fourni par utilisateur), toutes les sections ajoutées : Programme complet, Frais détaillés, Candidat+Photo, **Adresses**, **État de santé**, **Passeport**, **Séjour en Chine**, **Formation académique**, **Expérience professionnelle**, **Informations familiales**, Garant financier, **Contact d'urgence**, **Paiement**, Documents.
  - (3) Blocage double candidature : `checkExistingApplication()` interroge `/api/applications` à l'ouverture du modal — si une candidature `pending/reviewing/modify` existe pour la même offre, le modal affiche un écran dégradé "Candidature déjà en cours" avec ref + statut + boutons Fermer/Mon tableau de bord.
  - (4) Toast Sonner global ajouté dans `App.js` (top-right, richColors, closeButton). Sur soumission : `toast.success('Candidature soumise avec succès !', ...)` en plus du popup dans le modal.
  - (5) Rendu robuste `admissionConditions` dans `UserDashboard.jsx` ET `ApplicationModal.jsx` : extraction `condition/title/text/label` comme label principal + `description` en gris — plus jamais de `[object Object]`.
  - (6) `forceDownload()` dans `ApplicationsSection.jsx` admin : fetch → Blob → object URL → `<a download>` synthétique. Fallback : Cloudinary `/upload/fl_attachment/` + `window.open` nouveau tab. L'admin ne perd plus sa place dans la section candidatures. (FAIT - 05/2026)
- [ ] ~~Notifications email automatiques pour changements de statut candidatures~~ (FAIT 05/2026)
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
