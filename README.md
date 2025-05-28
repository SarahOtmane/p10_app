# 🏎️ F1 League Betting Platform
Une plateforme de pari en ligne dédiée à la Formule 1, développée avec GraphQL, Sequelize et PostgreSQL (hébergée sur Neon) et conteneurisée avec Docker.

## 📌 Objectif
Développer une API GraphQL robuste et évolutive accompagnée d’un front-end TypeScript pour permettre à des utilisateurs de :
- Gérer des ligues publiques et privées
- Placer des paris sur le pilote finissant 10e (P10) et le premier pilote DNF
- Visualiser les résultats en temps réel issus d’APIs externes Formule 1

## 🚀 Fonctionnalités

### 👤 Gestion des utilisateurs
- CRUD complet (création, lecture, mise à jour, suppression)
- Authentification sécurisée avec JWT
- Hachage de mots de passe

### 🏆 Gestion des ligues
- Création de ligues publiques ou privées
- Rôle d'administrateur ou de membre
- Assignation d'avatars aux ligues

### 🏁 Grands Prix & Circuits
- Intégration d'APIs externes (OpenF1, API-Sports)
- Gestion des circuits (pays, images, etc.)

### 🚗 Pilotes et Écuries
- Import automatique des pilotes et écuries via API
- Association annuelle pilote <-> écurie

### 🎯 Pari et Résultats
- Placer des paris sur le 10e pilote et le premier DNF
- Calcul des points selon exactitude des paris
- Classements mis à jour automatiquement via API


## 🛠️ Technologies
- ⚙️ Backend : Node.js, Express, GraphQL, Sequelize
- 🗃️ Base de données : PostgreSQL hébergée sur Neon.tech
- 🐳 Docker : Conteneurisation complète
- 🔐 Sécurité : JWT, validation, hashing
- 🧪 Tests : Jest, Supertest 

## 🧱 Structure du projet
```bash
    ├── api
    │   ├── dist/                 # Fichiers compilés (TypeScript → JS)
    │   ├── node_modules/
    │   ├── public/               # Assets publics
    │   └── src/
    │       ├── config/           # Connexions DB, env, etc.
    │       ├── docs/             # Documentation technique ou Swagger
    │       ├── graphql/
    │       │   ├── resolvers/    # Fonctions GraphQL
    │       │   └── schemas/      # Schémas GraphQL
    │       ├── models/           # Modèles Sequelize
    │       ├── types/            # Types TypeScript partagés
    │       ├── utils/            # Fonctions utilitaires (auth, helpers)
    │       └── app.ts            # Entrée principale de l'API
    ├── tests/                    # Tests unitaires et d’intégration
    ├── docker/                   # Dockerfiles spécifiques si nécessaires
    ├── .env                      # Variables d’environnement (non versionnées)
    ├── .env.sample               # Exemple de fichier .env
    ├── compose.yml               # Docker Compose (API + DB)
    ├── README.md
```

## 🧑‍💻 Lancer le projet en local
#### 📦 Prérequis
Docker & Docker Compose

#### ⚙️ Setup
1. Clonez le dépôt :
```bash
    git clone https://github.com/ton-repo/f1-league.git
    cd f1-league
```
2. Créer un fichier .env
```bash
    DATABASE_URL= "lien_de_la_db_postgresql_sur_neon"
    JWT_KEY="votre_cle_secrete_pour_jwt"
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER="votre_email@gmail.com"
    SMTP_PASS="votre_mot_de_passe_d_application"
```
3. Installer les dépendances:
```bash
    docker run -ti --rm -v $PWD:/app -w /app node:20.17-slim /bin/sh
    cd api
    npm install
    exit
```
4. Créer le network
```bash
    docker network create routing
```
3. Lancer les services avec Docker 
```bash
    docker compose up --build
```
4. Accéder à l'API GraphQL :
http://localhost:3000/graphql
5. Lancer les tests
```bash
    docker compose exec -it node sh
    npm run test
```

