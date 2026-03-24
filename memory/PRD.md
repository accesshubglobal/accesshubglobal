# Winner's Consulting - Product Requirements Document

## Apercu du projet
Winner's Consulting est une plateforme de consultation pour etudes a l'etranger (Chine, France). React + FastAPI + MongoDB Atlas.

## Architecture
- **Frontend** : React 19, Tailwind CSS
- **Backend** : FastAPI, Motor (Async MongoDB)
- **Base de donnees** : MongoDB Atlas (`winnersconsulting`)
- **Deploiement** : Vercel (api/index.py)
- **Stockage fichiers** : Cloudinary (upload direct navigateur)

## Architecture Backend
```
api/
  _models.py      # Source unique: modeles Pydantic
  _helpers.py     # DB, Auth, Utility
  _routes.py      # Source unique: TOUTES les routes API (~120+ routes)
  index.py        # Adaptateur Vercel
backend/
  server.py       # Adaptateur local (+ WebSocket)
```

## Fonctionnalites COMPLETEES
- [x] Authentification JWT (admin + users)
- [x] Catalogue de programmes depuis MongoDB
- [x] Candidatures (4 etapes) + re-soumission + statut "Modifier"
- [x] Upload Cloudinary + messages avec pieces jointes
- [x] Panel admin complet (CRUD offres, candidatures, messages, stats, newsletter)
- [x] Chat admin/user + PDF/Impression
- [x] Newsletter + Frais dynamiques + CGU editables + QR codes
- [x] Consolidation backend (_routes.py source unique)
- [x] Boutons CTA + Bannieres + Temoignages + Contact + FAQ + Services
- [x] Admin sidebar groupee (6 categories expandables + mode retractable)
- [x] Sidebar/header fixes (scroll contenu independant)
- [x] Footer fonctionnel (liens Services/Programmes/Contact)
- [x] **Blog** (24 Mars 2026):
  - Page publique /blog avec recherche + filtres par categorie
  - Page detail /blog/{id} avec compteur de vues
  - Admin CRUD complet (creer, editer, supprimer, publier/brouillon)
  - 7 categories: Etudes, Visa, Bourses, Vie etudiante, Conseils, Actualites
- [x] **Communaute** (24 Mars 2026):
  - Page publique /community avec discussions + filtres
  - Page detail /community/{id} avec reponses
  - Utilisateurs: creer discussion, repondre, liker posts et reponses
  - Admin: epingler/supprimer discussions, supprimer reponses
  - 7 categories: Etudes, Visa, Vie etudiante, Bourses, Conseils, Experiences
- [x] **RBAC Admin - Controle d'acces par role** (24 Mars 2026):
  - Deux niveaux admin: admin_principal (acces total) et admin_secondary (acces limite)
  - Backend: gardes get_principal_admin et get_admin_user via Depends()
  - Routes sensibles protegees: gestion utilisateurs, paiements, bannieres
  - Frontend: sidebar conditionnel via isPrincipalAdmin (AuthContext)
  - Section Utilisateurs avec 4 onglets: Tous, Admins Principaux, Admins Secondaires, Utilisateurs
  - Admin secondaire: peut gerer offres, blog, communaute, messages, candidatures
  - Admin secondaire: NE peut PAS gerer utilisateurs, paiements, bannieres, parametres
  - Teste: 19/19 tests backend + verification frontend complete
- [x] **Systeme Agent/Partenaire** (24 Mars 2026):
  - Nouveau role "agent" avec flux d'inscription dedie (/agent/register)
  - Code d'activation genere par admin principal (format AG-XXXXXXXX, expire 30j)
  - Approbation par admin principal requise avant acces
  - Dashboard agent (/agent) avec 6 onglets: Tableau de bord, Etudiants, Candidatures, Offres, Favoris, Messages
  - Gestion etudiants: CRUD complet (prenom, nom, email, telephone, nationalite, passeport...)
  - Candidatures: postuler pour un etudiant sur n'importe quelle offre
  - Messagerie: envoyer des messages aux administrateurs
  - Offres/Favoris: consulter et ajouter aux favoris comme un utilisateur
  - Admin: section "Agents" avec gestion codes + approbation/rejet agents
  - Footer "Devenir Partenaire" redirige vers /agent/register
  - Auto-redirect vers /agent apres login agent
  - Teste: 21/21 tests backend + verification frontend complete

## Collections MongoDB
users, offers, universities, housing, applications, messages, newsletter, payment_settings, chats, notifications, password_resets, site_settings, testimonials, contact_messages, blog_posts, community_posts, community_replies, agent_codes, agent_students

## Credentials
- **Admin Principal** : admin@winners-consulting.com / Admin2025!
- **Admin Secondaire (test)** : secondary@test.com / Test2025!
- **Agent (test)** : agent@test.com / Agent2025!

## Roles
- `admin_principal` : Acces total (utilisateurs, paiements, bannieres, parametres, agents)
- `admin_secondary` : Acces contenu uniquement (offres, blog, communaute, messages, candidatures)
- `agent` : Partenaire (gestion etudiants, candidatures pour etudiants, messagerie, favoris)
- `user` : Utilisateur standard

## Backlog
- [ ] Paiement en ligne (P1)
- [ ] Emails automatiques pour changements de statut (P2)
- [ ] Refactoring AdminCMS.jsx en sous-composants (P3)
- [ ] Recherche globale dans la navbar (P3)
- [ ] Mode sombre admin (P3)
- [ ] Systeme de badges/reputation communaute (P3)
- [ ] Configuration variables Cloudinary Vercel
- [ ] Commit GitHub pour deploiement Vercel
