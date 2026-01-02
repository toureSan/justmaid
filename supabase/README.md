# Configuration Supabase pour justmaid

## 🚀 Étapes de configuration

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur "New Project"
4. Remplissez les informations :
   - **Name**: justmaid
   - **Database Password**: (notez-le bien !)
   - **Region**: West EU (Frankfurt) ou le plus proche de vous
5. Attendez que le projet soit créé (~2 minutes)

### 2. Configurer la base de données

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Cliquez sur **New Query**
3. Copiez-collez le contenu de `schema.sql`
4. Cliquez sur **Run** pour exécuter le script

### 3. Configurer l'authentification

#### Email/Password
1. **Authentication** > **Providers** > **Email**
2. Activez "Enable Email provider"
3. Désactivez "Confirm email" pour le développement (optionnel)

#### Google OAuth
1. **Authentication** > **Providers** > **Google**
2. Activez le provider
3. Créez des credentials OAuth sur [Google Cloud Console](https://console.cloud.google.com/):
   - Créez un projet
   - APIs & Services > Credentials > Create Credentials > OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs: `https://votre-projet.supabase.co/auth/v1/callback`
4. Copiez le Client ID et Client Secret dans Supabase

#### Apple OAuth
1. **Authentication** > **Providers** > **Apple**
2. Suivez les instructions pour configurer avec votre Apple Developer Account

### 4. Récupérer les clés API

1. **Settings** > **API**
2. Copiez :
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

### 5. Configurer l'application

Créez un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 6. Configurer Stripe (Paiements)

#### A. Créer un compte Stripe
1. Allez sur [stripe.com](https://stripe.com) et créez un compte
2. Activez le mode test pour le développement

#### B. Récupérer les clés API Stripe
1. Dashboard Stripe > **Developers** > **API keys**
2. Copiez :
   - **Publishable key** (pk_test_...) → `VITE_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** (sk_test_...) → Pour la Supabase Edge Function

#### C. Déployer la Edge Function
1. Installez le CLI Supabase si pas déjà fait :
```bash
npm install -g supabase
```

2. Connectez-vous à votre projet :
```bash
supabase login
supabase link --project-ref votre-project-ref
```

3. Ajoutez la clé secrète Stripe :
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_votre_cle_secrete
```

4. Déployez la fonction :
```bash
supabase functions deploy create-checkout-session
```

5. Ajoutez l'URL de la fonction dans `.env` :
```env
VITE_STRIPE_CHECKOUT_API=https://votre-projet.supabase.co/functions/v1/create-checkout-session
```

### 7. Tester

```bash
npm run dev
```

L'application devrait maintenant utiliser Supabase pour :
- ✅ Authentification (inscription, connexion, OAuth)
- ✅ Stockage des profils utilisateurs
- ✅ Gestion des réservations
- ✅ Liste des services et villes
- ✅ Paiements sécurisés via Stripe Checkout

---

## 📊 Structure des tables

| Table | Description |
|-------|-------------|
| `profiles` | Profils utilisateurs (extension de auth.users) |
| `bookings` | Réservations de ménage |
| `payments` | Historique des paiements |
| `services` | Catalogue des services |
| `cities` | Villes couvertes |
| `city_notifications` | Inscriptions "être notifié" |
| `reviews` | Avis clients |

---

## 🔒 Sécurité (Row Level Security)

Toutes les tables ont des politiques RLS activées :
- Les utilisateurs ne peuvent voir/modifier que leurs propres données
- Les services et villes sont publics en lecture
- Les avis sont publics mais seuls les auteurs peuvent les créer

---

## 🔧 Commandes utiles

### Réinitialiser la base de données
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```
Puis ré-exécutez `schema.sql`.

### Voir les utilisateurs
```sql
SELECT * FROM auth.users;
SELECT * FROM profiles;
```

### Voir les réservations
```sql
SELECT 
  b.*,
  p.first_name,
  p.last_name,
  p.email
FROM bookings b
JOIN profiles p ON b.user_id = p.id
ORDER BY b.created_at DESC;
```

---

## 📞 Support

Si vous avez des questions, consultez :
- [Documentation Supabase](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
