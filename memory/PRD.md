# Winner's Consulting → AccessHub Global - PRD

## Projet
Application full-stack (React + FastAPI + MongoDB) pour AccessHub Global (anciennement Winner's Consulting), une agence de conseil en études internationales (Chine & France).

## Fonctionnalités Principales
- Site vitrine multi-sections (Accueil, Programmes, Universités, Logement, Blog, Communauté)
- Système d'authentification RBAC (user, agent, admin_secondaire, admin_principal)
- CMS Admin complet pour gestion de contenu (refactorisé en 20+ composants)
- Système de candidature avec suivi et messagerie
- Système d'agents/partenaires avec codes d'activation
- Vérification email et récupération de mot de passe (Resend)
- Upload d'images (Cloudinary)
- 5 pages institutionnelles (À propos, Informations, Mentions légales, Confidentialité, CGU)

## Architecture Technique
- Frontend: React (CRA) + TailwindCSS + Shadcn/UI
- Backend: FastAPI + MongoDB
- Intégrations: Cloudinary (images), Resend (emails via auth.accesshubglobal.com)

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
- [x] Formulaire candidature étendu: 11 sections (Personal Info, Adresses, Santé, Chine, Passeport, Formation, Expérience, Famille, Garant, Contact urgence)
- [x] Credentials Cloudinary et Resend mis à jour (cloud: dtjgzpmna)

## Tâches À Venir
### P1 - Priorité haute
- [ ] Intégration paiement en ligne (Stripe ou autre)

### P2 - Priorité moyenne
- [ ] Notifications email automatiques pour changements de statut candidatures

### P3 - Priorité basse
- [ ] Recherche globale dans la navbar
- [ ] Mode sombre CMS admin
- [ ] Badges/réputation forum communautaire

## Credentials
- Admin Principal: admin@accesshubglobal.com / Admin2025!
- Resend: auth.accesshubglobal.com
- Contact: accesshubglobal@gmail.com
