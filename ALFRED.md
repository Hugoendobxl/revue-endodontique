# ALFRED.md — revue-endodontique

> Documentation vivante à jour au 2026-04-11. Ce fichier est lu par Alfred au démarrage de toute session Claude Code sur ce module. Il doit être mis à jour à chaque modification significative du code.

## 1. Rôle du module

Outil de **veille bibliographique en endodontie**. Hugo importe régulièrement les exports PubMed (XML/MEDLINE) du mois, le module les parse, classifie automatiquement les articles par thème via Claude (Anthropic), et présente une bibliothèque cherchable et filtrable. Sert aussi de base de contenu pour la newsletter clinique du cabinet (panneau "NewsletterPanel").

## 2. URLs et identifiants

- **Frontend** : https://revue-endodontique.vercel.app
- **Backend** : aucun backend Railway — utilise les **Vercel Functions** intégrées (`api/*.js`) avec **Firebase Firestore** comme stockage
- **Dépôt GitHub** : Hugoendobxl/revue-endodontique
- **Projet Vercel** : `revue-endodontique`
- **Projet Railway** : aucun

## 3. Stack technique

- **Runtime** : navigateur (build Vite) **+ Vercel Functions Node.js** (`api/*.js`)
- **Framework** : React 19.2 + Vite 8
- **Base de données** : **Firebase Firestore** (différent du reste de l'écosystème qui est en PostgreSQL)
- **IA** : `@anthropic-ai/sdk` 0.82 — classification automatique des articles
- **Authentification** : login simple (mot de passe → JWT artisanal via `AUTH_SECRET`)
- **Hébergement** : Vercel (frontend statique + functions serverless)
- **Dépendances principales** :
  - `react` 19.2 / `react-dom` 19.2
  - `firebase` 12.11 — client Firestore
  - `@anthropic-ai/sdk` 0.82 — appels Claude
  - `vite` 8 + `@vitejs/plugin-react` 6

## 4. Variables d'environnement

⚠️ Ces variables sont définies dans **Vercel Project Settings** (côté serverless functions) :

| Variable | Rôle | Sensible |
|---|---|---|
| `AUTH_SECRET` | Secret pour signer les tokens de login (défaut `dev-secret`) | 🔒 |
| `FIREBASE_API_KEY` | Clé API Firebase | 🔒 |
| `FIREBASE_PROJECT_ID` | ID du projet Firebase | 🌐 |
| `ANTHROPIC_API_KEY` | Clé Anthropic pour la classification IA | 🔒 |

⚠️ Pas de `.env.example`.

## 5. Structure du projet

```
revue-endodontique/
├── index.html
├── vite.config.js
├── eslint.config.js
├── package.json
├── README.md                   # Template Vite par défaut (à nettoyer)
├── vercel.json                 # Functions config (maxDuration enrich/articles/stars)
├── public/
│   ├── icons.svg
│   └── favicon.svg
├── api/                        # ─── Vercel Serverless Functions ──
│   ├── _auth.js                # Helpers de vérification token
│   ├── login.js                # POST login → token
│   ├── articles.js             # CRUD articles (Firestore)
│   ├── enrich.js               # POST → classification Claude (maxDuration 30s)
│   └── stars.js                # GET/PUT favoris (Firestore)
└── src/
    ├── main.jsx
    ├── App.jsx                 # 194 lignes — état global, filtres, rendu
    ├── components/
    │   ├── Header.jsx          # 11 lignes
    │   ├── LoginPage.jsx       # 90 lignes
    │   ├── SearchFilters.jsx   # 49 lignes
    │   ├── ThemeChips.jsx      # 40 lignes
    │   ├── MonthNav.jsx        # 64 lignes
    │   ├── ImportZone.jsx      # 128 lignes (parsing PubMed)
    │   ├── ArticleCard.jsx     # 44 lignes
    │   └── NewsletterPanel.jsx # 18 lignes (placeholder)
    ├── utils/
    │   ├── pubmedParser.js     # Parse XML/MEDLINE
    │   ├── themeClassifier.js  # Wrap Claude
    │   └── storage.js          # Firestore client-side
    ├── styles/index.css
    └── data/initialArticles.js # Données de seed
```

## 6. Points d'entrée API (Vercel Functions)

| Méthode | Route | Auth | Rôle |
|---|---|---|---|
| POST | `/api/login` | non | Body `{password}` → token signé via `AUTH_SECRET` |
| GET / POST | `/api/articles` | token | Lit/écrit la collection Firestore `articles` (writeBatch + updateDoc) |
| GET / PUT | `/api/stars` | token | Lit/écrit les favoris d'utilisateur dans Firestore |
| POST | `/api/enrich` | token | Envoie un article à Claude pour classification thématique (maxDuration 30s) |

⚠️ `_auth.js` est un helper privé (préfixe `_` → exclu du routing Vercel).

## 7. Schéma de base de données

**Firestore** (pas de schéma strict, NoSQL).

Collections probables :
- **`articles`** : un document par article (`pmid`, `title`, `authors`, `abstract`, `journal`, `month`, `theme`, ...)
- **`stars`** : favoris (à confirmer la structure exacte — un doc unique avec un array, ou un doc par favori)

## 8. Écrans / Pages

Application **single-page** :

- **Login** (`LoginPage.jsx`) — saisie d'un mot de passe simple, retour token
- **Header** + **MonthNav** : navigation année/mois
- **SearchFilters** : recherche full-text, filtre journal, filtre favoris
- **ThemeChips** : filtrage rapide par thème (cliquables)
- **ImportZone** : zone de drag&drop pour import XML PubMed → parsing → enrichissement IA → save Firestore
- **Liste d'`ArticleCard`** : titre, auteurs, journal, abstract, étoile favori
- **NewsletterPanel** : panneau (placeholder pour l'instant) destiné à la génération du contenu de la newsletter clinique

## 9. Règles métier critiques

- **Auth simple par mot de passe** : pas d'utilisateur/email, juste un secret partagé. `AUTH_SECRET` côté serveur.
- **Filtres combinables** (`App.jsx` ligne 69+) : année, mois, journal, thème (via chip ou via filtre), favoris, recherche full-text (titre + abstract + thème)
- **Classification automatique** par Claude via `enrich.js` — chaque article importé est envoyé à l'API Anthropic qui retourne un thème normalisé
- **Stockage Firestore** : différent du reste de l'écosystème (PostgreSQL Railway) — choix lié à la simplicité de mise en place et au volume faible (quelques milliers d'articles)
- **`maxDuration: 30s`** sur `api/enrich.js` — laisse à Claude le temps de traiter un batch
- **Format d'import** : XML/MEDLINE de PubMed (export natif)

## 10. Intégrations externes

| Service | Rôle | Variables d'env |
|---|---|---|
| **Firebase Firestore** | Stockage articles + favoris | `FIREBASE_API_KEY`, `FIREBASE_PROJECT_ID` |
| **Anthropic API (Claude)** | Classification thématique | `ANTHROPIC_API_KEY` |
| **PubMed** (indirect) | Source des articles importés (export manuel par Hugo) | aucune |

## 11. Dépendances avec d'autres modules de l'écosystème

**Est appelé par** :
- `endodontie-launcher-v2` (tuile "Revue endodontique" — ouverture dans nouvel onglet)

**Appelle** : aucun autre module de l'écosystème.

Module **autonome**. Sera potentiellement intégré à un futur module Newsletter (cf. `NewsletterPanel.jsx` qui est aujourd'hui un placeholder).

## 12. Déploiement

- **Déclenchement** : push sur `main` → auto-deploy Vercel (frontend + functions)
- **Build frontend** : `vite build` → `dist/`
- **Functions** : `api/*.js` détectés automatiquement par Vercel
- **Branche de production** : `main`

## 13. Fichiers sensibles à ne pas modifier sans validation

- `api/_auth.js` — helper d'auth des functions
- `api/login.js` — entrée du login
- `api/enrich.js` — coût Anthropic (maxDuration 30s)
- `src/App.jsx` — état et filtres
- `src/utils/pubmedParser.js` — parsing PubMed
- Variables Vercel : `FIREBASE_*`, `ANTHROPIC_API_KEY`, `AUTH_SECRET`

## 14. Commandes utiles

```bash
# Dev local (Vite + functions Vercel via vercel dev)
npm run dev
# OU pour avoir aussi les functions
vercel dev

# Build
npm run build

# Lint
npm run lint
```

## 15. Historique des décisions importantes

- **Vercel Functions au lieu de Railway backend** : décision de tout regrouper dans Vercel pour ce module particulier (volume faible, peu de routes). Différent du reste de l'écosystème mais cohérent avec son usage.
- **Firestore au lieu de PostgreSQL Railway** : NoSQL est suffisant pour des articles bibliographiques, et le coût est nul tant qu'on reste sous le quota gratuit.
- **Classification IA automatique** : remplace une catégorisation manuelle qui aurait été chronophage.
- **NewsletterPanel placeholder** : préparation pour une future intégration newsletter (mentionnée dans le doc de session du 11/04 §9.3).

## 16. TODO et points d'attention

- **Aucun commentaire `TODO/FIXME`** dans `App.jsx`.
- **`README.md` est encore le template Vite par défaut** — à remplacer par une vraie présentation du module.
- **`NewsletterPanel.jsx` est un placeholder** (18 lignes) — à développer quand la newsletter sera relancée.
- **`AUTH_SECRET` défaut `dev-secret`** : à CONFIRMER que la valeur Vercel n'est pas restée à la valeur par défaut
- **Pas de tests automatisés**
- **Quota Firestore** à surveiller si le volume d'articles explose

---

**Dernière mise à jour** : 2026-04-11
**Mis à jour par** : Claude Code (session naissance du workspace, Alfred)
