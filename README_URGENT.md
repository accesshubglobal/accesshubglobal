# 🚨 PROBLÈME RÉSOLU - Configuration Vercel

## Le Problème

Votre site fonctionne en **local/preview Emergent** mais **PAS en production Vercel** :
- ❌ Erreur de connexion
- ❌ Les offres ne s'affichent pas

## La Cause

**Variables d'environnement manquantes sur Vercel**. Votre backend Vercel ne peut pas se connecter à MongoDB Atlas.

## La Solution Rapide (5 minutes)

### 1️⃣ Configurez MongoDB Atlas

1. Allez sur https://cloud.mongodb.com
2. **Network Access** > **Add IP Address** > **Allow Access from Anywhere (0.0.0.0/0)**
3. **Database** > **Connect** > Copiez votre chaîne de connexion MongoDB

### 2️⃣ Ajoutez les Variables sur Vercel

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet
3. **Settings** > **Environment Variables**
4. Ajoutez ces 3 variables :

| Variable | Value | Environnement |
|----------|-------|---------------|
| `MONGO_URL` | `mongodb+srv://votre-user:pass@cluster...` | Production + Preview + Development |
| `DB_NAME` | `winnersconsulting` | Production + Preview + Development |
| `JWT_SECRET` | `une-clé-secrète-forte-32-caractères` | Production + Preview + Development |

### 3️⃣ Redéployez

**Dashboard Vercel** > **Deployments** > **⋯** (3 points) > **Redeploy**

### 4️⃣ Créez le compte Admin

Une fois redéployé, exécutez :

```bash
curl -X POST https://votre-site.vercel.app/api/admin/setup
```

Login admin :
- Email : `admin@winners-consulting.com`  
- Password : `Admin2025!`

---

## 📖 Guide Détaillé

Consultez **[FIX_VERCEL_DEPLOYMENT.md](./FIX_VERCEL_DEPLOYMENT.md)** pour :
- Instructions détaillées étape par étape
- Dépannage des erreurs
- Tests de vérification
- Architecture du projet

---

## ✅ Vérification

Après le redéploiement, testez :

```bash
# Test 1 : API fonctionne
curl https://votre-site.vercel.app/api/

# Test 2 : Récupérer les offres
curl https://votre-site.vercel.app/api/offers
```

Ouvrez votre site et essayez de vous connecter.

---

**C'est tout ! Votre site devrait maintenant fonctionner en production. 🎉**
