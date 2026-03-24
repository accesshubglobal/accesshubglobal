# Winner's Consulting - PRD

## Projet
Application full-stack (React + FastAPI + MongoDB) pour Winner's Consulting, une agence de conseil en études internationales (Chine & France).

## Fonctionnalités Principales
- Site vitrine multi-sections (Accueil, Programmes, Universités, Logement, Blog, Communauté)
- Système d'authentification RBAC (user, agent, admin_secondaire, admin_principal)
- CMS Admin complet pour gestion de contenu
- Système de candidature avec suivi et messagerie
- Système d'agents/partenaires avec codes d'activation
- Vérification email et récupération de mot de passe (Resend)
- Upload d'images (Cloudinary)

## Architecture Technique
- Frontend: React (CRA) + TailwindCSS + Shadcn/UI
- Backend: FastAPI + MongoDB
- Intégrations: Cloudinary (images), Resend (emails)

## Structure Admin CMS (Refactorisée)
```
AdminCMS.jsx (~138 lignes) - Routeur/conteneur
├── admin/AdminSidebar.jsx   - Navigation sidebar
├── admin/AdminHeader.jsx    - Header avec breadcrumbs
├── admin/DashboardSection.jsx
├── admin/OffersSection.jsx
├── admin/UniversitiesSection.jsx
├── admin/ScholarshipsSection.jsx
├── admin/UsersSection.jsx
├── admin/AgentsSection.jsx
├── admin/ApplicationsSection.jsx
├── admin/HousingSection.jsx
├── admin/MessagesSection.jsx
├── admin/ChatsSection.jsx
├── admin/ContactsSection.jsx
├── admin/NewsletterSection.jsx
├── admin/BlogSection.jsx
├── admin/BannersSection.jsx
├── admin/TestimonialsSection.jsx
├── admin/FaqSection.jsx
├── admin/CommunitySection.jsx
├── admin/PaymentSettingsSection.jsx
├── admin/TermsSection.jsx
└── admin/adminApi.js        - Config API partagée
```

## Tâches Complétées
- [x] RBAC System (user, agent, admin_secondaire, admin_principal)
- [x] Agent/Partner System avec codes d'activation
- [x] Email verification + Forgot password (Resend)
- [x] University Feature Overhaul (pages dynamiques, uploads)
- [x] **Refactoring AdminCMS.jsx** (5081 lignes → ~138 lignes routeur + 20 composants)

## Tâches À Venir
### P1 - Priorité haute
- [ ] Intégration paiement en ligne (Stripe ou autre)
- [ ] Confirmation utilisateur sur l'UI des universités

### P2 - Priorité moyenne
- [ ] Notifications email automatiques pour changements de statut candidatures

### P3 - Priorité basse
- [ ] Recherche globale dans la navbar du site principal
- [ ] Mode sombre pour le CMS admin
- [ ] Système de badges/réputation pour le forum communautaire

## Credentials
- Admin Principal: admin@winners-consulting.com / Admin2025!
