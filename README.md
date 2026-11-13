# 📝 NestJS Todo & CV API – TP1 / TP2 RT4 (2026/2027)

API REST développée avec **NestJS**, **TypeORM** et **MySQL**, dans le cadre des TP1 (gestion de **Todos**) et TP2 (middleware d'authentification, gestionnaire de **CVs**, seed, authentification JWT) du cours NestJS (RT4).

> **Auteur :** Groupe 8 – RT4 – Année universitaire 2026/2027 \
> **Enseignant :** Aymen Sellaouti \
> **Membres :** - Lamouchi Seif - ElJenzri Yassine - Jmili Jed - Yahyaoui Baha Eddine - Khediri Oussama - Rahmouni Aziz - Amdouni Ghaith

---

## 📌 Sommaire

1. [Objectifs](#-objectifs)
2. [Stack technique](#-stack-technique)
3. [Prérequis](#-prérequis)
4. [Installation et lancement](#-installation-et-lancement)
5. [Variables d'environnement](#-variables-denvironnement)
6. [Architecture du projet](#-architecture-du-projet)
7. [Modèle de données](#-modèle-de-données)
8. [Endpoints de l'API](#-endpoints-de-lapi)
9. [Plan de travail (checklist TP1)](#-plan-de-travail-checklist-tp1)
10. [Plan de travail (checklist TP2)](#-plan-de-travail-checklist-tp2)
11. [Tests](#-tests)
12. [Règles et bonnes pratiques](#-règles-et-bonnes-pratiques)
13. [Ressources](#-ressources)

---

## 🎯 Objectifs

### TP1

- Modules, contrôleurs et providers (services, providers personnalisés)
- Injection de dépendances (IoC container)
- DTO, validation (`class-validator`, `class-transformer`) et `ValidationPipe`
- Mapped types (`PartialType`, `PickType`, `OmitType`…)
- Persistance avec **TypeORM** (entités, repository, QueryBuilder)
- Colonnes spéciales (`@CreateDateColumn`, `@UpdateDateColumn`, `@DeleteDateColumn`)
- Soft delete / restore
- Versioning d'API (URI versioning)
- Recherche, statistiques et pagination

### TP2

- Middlewares (authentification simulée via un JWT dans un header)
- Relations TypeORM (`ManyToOne`, `OneToMany`, `ManyToMany`)
- Factorisation du code (service CRUD générique, pagination réutilisable)
- Applications **standalone** Nest et seed de la base de données
- Authentification (inscription / login), **Passport JWT**, Guards
- Autorisation par rôles (RBAC) et décorateurs de paramètres personnalisés

---

## 🛠 Stack technique

| Technologie                                  | Rôle                                                             |
| -------------------------------------------- | ---------------------------------------------------------------- |
| [NestJS](https://nestjs.com/)                | Framework backend (Node.js / TypeScript)                         |
| [TypeORM](https://typeorm.io/)               | ORM                                                              |
| MySQL (`mysql2`)                             | Base de données                                                  |
| `class-validator` / `class-transformer`      | Validation et transformation des DTO                             |
| `@nestjs/mapped-types`                       | Dérivation des DTO                                               |
| `@nestjs/config`                             | Gestion des variables de configuration                           |
| [`uuid`](https://www.npmjs.com/package/uuid) | Génération d'identifiants uniques (via un provider personnalisé) |
| `jsonwebtoken`                               | Décodage / vérification des JWT (middleware TP2)                 |
| Vitest + Supertest + `sql.js`                | Tests unitaires et e2e (base SQLite en mémoire pour les CVs)     |

---

## ✅ Prérequis

- **Node.js** ≥ 20.19 (requis par TypeORM / Nest 12)
- **npm**
- **MySQL** (local ou Docker)
- **Nest CLI**

```bash
npm i -g @nestjs/cli
```

---

## 🚀 Installation et lancement

```bash
# 1. Cloner le dépôt
git clone https://github.com/<votre-username>/<nom-du-repo>.git
cd <nom-du-repo>

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# puis renseigner vos valeurs dans .env

# 4. Lancer en mode développement
npm run start:dev
```

L'application est accessible sur : `http://localhost:3000`

### Scripts utiles

| Commande             | Description                                  |
| -------------------- | -------------------------------------------- |
| `npm run start:dev`  | Lance l'app en mode watch                    |
| `npm run build`      | Compile le projet                            |
| `npm run start:prod` | Lance la version compilée                    |
| `npm run test`       | Lance les tests unitaires                    |
| `npm run test:e2e`   | Lance les tests e2e                          |
| `npm run test:cv`    | Lance uniquement les tests e2e CVs / Skills  |
| `npm run lint`       | Analyse statique du code (oxlint)            |

### Dépendances à installer lors du développement

```bash
npm i --save @nestjs/typeorm typeorm mysql2
npm i --save @nestjs/config
npm i --save class-validator class-transformer
npm i --save @nestjs/mapped-types
npm i --save uuid
# TP2
npm i --save jsonwebtoken
npm i --save-dev @types/jsonwebtoken sql.js
# TP2 – partie authentification (à venir)
npm i --save @nestjs/passport passport @nestjs/jwt passport-jwt bcrypt
npm i --save-dev @types/passport-jwt @types/bcrypt
```

---

## 🔐 Variables d'environnement

Créer un fichier `.env` à la racine (⚠️ **ne jamais le commiter**, il est dans le `.gitignore`) :

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=nest_todo

# Secret utilisé pour signer / vérifier les JWT
JWT_SECRET=replace-with-a-local-secret
```

Un fichier `.env.example` (sans valeurs sensibles) est fourni dans le dépôt.

---

## 🧱 Architecture du projet

```
src/
├── main.ts                         # Point d'entrée (ValidationPipe global, versioning)
├── app.module.ts                   # Module racine (ConfigModule, TypeOrmModule…)
│
├── common/                         # Module partagé (utilisé partout)
│   ├── common.module.ts
│   ├── providers/
│   │   └── uuid.provider.ts        # Provider personnalisé (token 'UUID')
│   ├── entities/
│   │   └── timestamp.entity.ts     # createdAt / updatedAt / deletedAt réutilisables
│   ├── dto/
│   │   └── pagination.dto.ts       # page / limit (réutilisé partout)
│   ├── services/
│   │   └── crud.service.ts         # Service CRUD générique (findAll, findOne, remove…)
│   └── utils/
│       └── paginate.ts             # Pagination générique via QueryBuilder
│
├── todo/                           # TP1 + middleware TP2
│   ├── todo.module.ts              # Applique AuthMiddleware sur TodoDbController
│   ├── todo.controller.ts          # Version 1 (en mémoire)
│   ├── todo-db.controller.ts       # Version 2 (base de données, protégée)
│   ├── todo.service.ts
│   ├── auth.middleware.ts          # Vérifie le JWT du header `auth-user`
│   ├── entities/todo.entity.ts
│   ├── dto/                        # add-todo, update-todo, search-todo
│   └── enums/todo-status.enum.ts
│
├── cv/                             # TP2 – gestionnaire de CVs
│   ├── cv.module.ts
│   ├── cv.controller.ts
│   ├── cv.service.ts               # Étend CrudService, résout user + skills
│   ├── entities/cv.entity.ts
│   └── dto/                        # create-cv, update-cv (PartialType)
│
├── skill/                          # TP2
│   ├── skill.module.ts
│   ├── skill.controller.ts
│   ├── skill.service.ts            # Étend CrudService
│   ├── entities/skill.entity.ts
│   └── dto/                        # create-skill, update-skill
│
├── user/                           # TP2
│   ├── user.module.ts
│   ├── user.service.ts
│   └── entities/user.entity.ts
│
├── test/                           # Module de test de l'injection (TP1)
│
└── shared/
    └── error-messages.ts           # Messages d'erreur centralisés

test/
├── app.e2e-spec.ts
└── cv-skills.e2e-spec.ts           # CRUD CV / Skills (HTTP + TypeORM, SQLite en mémoire)
```

---

## 🗄 Modèle de données

### `TodoEntity`

| Champ         | Type             | Description                                       |
| ------------- | ---------------- | ------------------------------------------------- |
| `id`          | `number`         | Clé primaire auto-incrémentée                     |
| `userId`      | `string`         | Identifiant du créateur (extrait du JWT)          |
| `name`        | `string`         | Nom du todo (3 à 10 caractères)                   |
| `description` | `string`         | Description (≥ 10 caractères)                     |
| `status`      | `TodoStatusEnum` | Statut du todo                                    |
| `createdAt`   | `Date`           | Date de création (non modifiable après insertion) |
| `updatedAt`   | `Date`           | Date de mise à jour (gérée par TypeORM)           |
| `deletedAt`   | `Date`           | Date de suppression soft (gérée par TypeORM)      |

### `TodoStatusEnum`

```ts
export enum TodoStatusEnum {
  actif = 'En cours',
  waiting = 'En attente',
  done = 'Finalisé',
}
```

Statut par défaut à la création : **En attente**.

### Gestionnaire de CVs (TP2)

```
User 1 ───── * Cv * ───── * Skill
```

| Entité        | Champs                                                              |
| ------------- | ------------------------------------------------------------------- |
| `CvEntity`    | `id`, `name`, `firstname`, `age`, `cin`, `job`, `path`, `userId` + timestamps |
| `SkillEntity` | `id`, `designation` + timestamps                                    |
| `UserEntity`  | `id`, `username` (unique), `email` (unique), `password` (`select: false`) |

- `Cv` **ManyToOne** `User` (un User possède plusieurs CVs)
- `Cv` **ManyToMany** `Skill` (table de jointure `cv_skills`)
- Supprimer un CV ou un Skill ne supprime ni le User ni les autres entités liées.

> Les champs `role` (User) et l'authentification complète seront ajoutés dans la branche `auth`.

---

## 🌐 Endpoints de l'API

### Todos

> L'ajout d'un todo existe en **deux versions** (v1 en mémoire, v2 en base de données) via l'**URI versioning**.
> ⚠️ Toutes les routes **v2** exigent le header `auth-user: <JWT>` contenant un `userId` (sinon `401`).

| Méthode  | Route                  | Description                                                   |
| -------- | ---------------------- | ------------------------------------------------------------- |
| `POST`   | `/v1/todo`             | Ajouter un todo (version initiale, en mémoire)                |
| `POST`   | `/v2/todo`             | Ajouter un todo en base de données                            |
| `GET`    | `/v2/todo`             | Récupérer les todos (avec recherche et pagination)            |
| `GET`    | `/v2/todo/:id`         | Récupérer un todo par son id (404 si inexistant)              |
| `PATCH`  | `/v2/todo/:id`         | Mettre à jour un todo                                         |
| `DELETE` | `/v2/todo/:id`         | Supprimer définitivement un todo (créateur uniquement)        |
| `DELETE` | `/v2/todo/:id/soft`    | Suppression soft d'un todo                                    |
| `PATCH`  | `/v2/todo/restore/:id` | Restaurer un todo supprimé (soft)                             |
| `GET`    | `/v2/todo/stats`       | Nombre de todos pour chacun des 3 statuts (une seule requête) |

#### Recherche et pagination (query params, tous optionnels)

```
GET /v2/todo?search=nest&status=En cours&page=1&limit=10
```

- `search` : chaîne recherchée dans le **name** OU la **description**
- `status` : statut recherché
- `page` (≥ 1, défaut `1`) et `limit` (1 à 100, défaut `10`)

Réponse paginée : `{ data, total, page, limit, totalPages }`.

### CVs (version neutre – sans préfixe `/vN`)

| Méthode  | Route      | Description                                        |
| -------- | ---------- | -------------------------------------------------- |
| `POST`   | `/cvs`     | Créer un CV (avec `userId` et `skillIds` optionnel) |
| `GET`    | `/cvs`     | Lister les CVs (paginé, avec leurs skills)         |
| `GET`    | `/cvs/:id` | Récupérer un CV (404 si inexistant)                |
| `PATCH`  | `/cvs/:id` | Mise à jour partielle (`skillIds` remplace la liste) |
| `DELETE` | `/cvs/:id` | Supprimer un CV (`204`)                            |

### Skills (version neutre)

| Méthode  | Route         | Description                         |
| -------- | ------------- | ----------------------------------- |
| `POST`   | `/skills`     | Créer un skill                      |
| `GET`    | `/skills`     | Lister les skills (paginé)          |
| `GET`    | `/skills/:id` | Récupérer un skill (404 si absent)  |
| `PATCH`  | `/skills/:id` | Modifier un skill                   |
| `DELETE` | `/skills/:id` | Supprimer un skill (`204`)          |

---

## 📋 Plan de travail (checklist TP1)

### 1. Mise en place

- [✅] Créer un nouveau projet Nest (`nest new`)
- [✅] Créer le `CommonModule` (module partagé, utilisé souvent)
- [✅] Provider personnalisé pour la bibliothèque `uuid` (choisir le bon type : `useValue` / `useFactory`)
- [✅] Créer un module + un service de test pour vérifier l'injection

### 2. Base de données

- [✅] Créer `TodoEntity` (id entier auto-incrémenté, name, description, createdAt, status)
- [✅] Configurer TypeORM (idéalement avec `forRootAsync` + `ConfigService`)

### 3. Validation et DTO

- [✅] DTO d'ajout : description obligatoire (≥ 10 car.), name obligatoire (3 à 10 car.)
- [✅] Messages d'erreur personnalisés **centralisés** dans un seul fichier
- [✅] DTO de mise à jour (aucun champ obligatoire, mêmes contraintes de taille, statut ∈ enum)
- [✅] Simplifier les DTO avec les mapped types (`PartialType`…)

### 4. Entités réutilisables

- [✅] Ajouter `updatedAt` et `deletedAt` gérés automatiquement par TypeORM
- [✅] Rendre `createdAt` non modifiable après création (`update: false`)
- [✅] Factoriser `createdAt` / `updatedAt` / `deletedAt` dans une classe réutilisable

### 5. CRUD

- [✅] `addTodo` en base de données (**garder les deux versions** du code)
- [✅] `updateTodo` via l'id
- [✅] `deleteTodo` via l'id
- [✅] `softDeleteTodo` + méthode de restauration

### 6. Consultation

- [✅] Endpoint de statistiques : nombre de todos pour chacun des 3 statuts en **une seule requête**
- [✅] Endpoint de récupération de tous les todos
- [✅] Endpoint de récupération par id (gérer le cas « todo inexistant »)
- [✅] Recherche par chaîne (name/description) et par statut, critères optionnels
- [✅] Pagination de la fonction `getAll` (fonction générique et réutilisable, via QueryBuilder)

---

## 📋 Plan de travail (checklist TP2)

### 1. Middleware d'authentification simulée

- [✅] Créer `AuthMiddleware` (classe implémentant `NestMiddleware`)
- [✅] Lire le header `auth-user` contenant un JWT
- [✅] Décoder / vérifier le token (`jsonwebtoken`) et extraire `userId`
- [✅] Injecter `userId` dans l'objet `request` (`AuthenticatedRequest`)
- [✅] Répondre `401` si le token est absent, invalide ou sans `userId`
- [✅] Appliquer le middleware au contrôleur de persistance (`TodoDbController`)
- [✅] Ajouter la colonne `userId` à `TodoEntity`
- [✅] Le contrôleur transmet `req.userId` à `add`, `update` et `delete`
- [✅] `deleteTodo` : seul le créateur peut supprimer (`403` sinon)
- [ ] `addTodo` : enregistrer le `userId` du créateur dans le service
- [ ] `updateTodo` : seul le créateur peut modifier (`403` sinon)

### 2. Gestionnaire de CVs (modules, contrôleurs, services, entités, relations)

- [✅] Entité `CvEntity` (name, firstname, age, cin, job, path)
- [✅] Entité `SkillEntity` (designation)
- [✅] Entité `UserEntity` (username, email, password)
- [✅] Relation `Cv` ManyToOne `User` / `User` OneToMany `Cv`
- [✅] Relation `Cv` ManyToMany `Skill` (`@JoinTable`)
- [✅] Modules `CvModule`, `SkillModule`, `UserModule`
- [✅] Contrôleurs `CvController` et `SkillController` (CRUD complet)
- [✅] DTO de création et de mise à jour (`PartialType`) avec validation
- [✅] Factorisation : `CrudService` générique + `paginate` + `PaginationDto` réutilisés
- [✅] Gestion des relations inexistantes (`404`) sans persistance partielle
- [✅] Tests e2e CRUD CV / Skills (HTTP + TypeORM)
- [ ] Contrôleur `User` (si nécessaire pour l'inscription)

### 3. Seed de la base de données

- [ ] Installer `@ngneat/falso` pour générer des données fictives
- [ ] Vérifier que tous les imports du projet sont **relatifs** (✅ déjà le cas, à revalider)
- [ ] Créer une application **standalone** (`NestFactory.createApplicationContext`)
- [ ] Seeder Users, Skills et CVs (avec leurs relations)
- [ ] Ajouter le script `seed:cvs` dans `package.json`

### 4. Authentification (branche `auth` à créer depuis `master`)

- [ ] Créer la branche `auth` à partir de `master`
- [ ] Désactiver le middleware d'authentification simulée
- [ ] Créer l'`AuthModule`
- [ ] Mettre à jour `UserEntity` : `username` (unique), `password`, `email` (unique), `role`
- [ ] Inscription (hachage du mot de passe avec `bcrypt` + salt) et DTO
- [ ] Login et DTO (`401` si identifiants invalides)
- [ ] Mettre en place **Passport** (`PassportModule`, `JwtModule`, `JwtStrategy`)
- [ ] Login : générer et renvoyer le JWT (vérification sur [jwt.io](https://jwt.io/))

### 5. Autorisation et propriété des CVs

- [ ] Affecter le user connecté comme propriétaire du CV (décorateur `@User()` via `createParamDecorator`)
- [ ] Un user ne voit / modifie / supprime que **ses** CVs
- [ ] Protéger les routes réservées aux utilisateurs connectés (`AuthGuard('jwt')`) et les tester
- [ ] Créer un **Guard Admin** (basé sur les rôles via `Reflector` / `@SetMetadata`, extensible : de nouveaux rôles peuvent être ajoutés à tout moment)
- [ ] Admin : récupère **tous** les CVs ; user : uniquement les siens

---

## 🧪 Tests

```bash
npm run test       # tests unitaires (paginate, validation des query params…)
npm run test:e2e   # tests e2e
npm run test:cv    # e2e CRUD CV / Skills uniquement
```

Les tests e2e des CVs utilisent une base **SQLite en mémoire** (`sql.js`) : aucune dépendance à MySQL ni aux données du TP1.

---

## 📐 Règles et bonnes pratiques

Rappel des règles du TP :

1. **Code personnel et compris** : chaque ligne doit pouvoir être expliquée lors de la validation.
2. **Réfléchir avant de coder** (ou de solliciter une IA).
3. **Architecture cohérente**, code propre, lisible et factorisé ; application des **design patterns** (IoC/DI, Repository, DTO…).
4. **La validation est un entretien** : bien maîtriser le sujet le jour J.

Conventions Git suggérées :

- Un commit par exercice, avec un message clair (ex. `feat(todo): add soft delete and restore`)
- Branche principale : `master` / `main` ; branche `auth` pour la partie authentification du TP2
- Ne jamais commiter `.env` ni `node_modules`
- Utiliser des **imports relatifs** (nécessaire au fonctionnement des seeds)

---

## 📚 Ressources

- [Documentation NestJS](https://docs.nestjs.com/)
- [Modules](https://docs.nestjs.com/modules) · [Custom providers](https://docs.nestjs.com/fundamentals/custom-providers) · [Validation](https://docs.nestjs.com/techniques/validation) · [Versioning](https://docs.nestjs.com/techniques/versioning) · [Configuration](https://docs.nestjs.com/techniques/configuration)
- [Middleware](https://docs.nestjs.com/middleware) · [Standalone applications](https://docs.nestjs.com/standalone-applications) · [Authentication](https://docs.nestjs.com/security/authentication) · [Authorization](https://docs.nestjs.com/security/authorization)
- [TypeORM – Repository API](https://github.com/typeorm/typeorm/blob/master/docs/repository-api.md)
- [TypeORM – Find options](https://github.com/typeorm/typeorm/blob/master/docs/find-options.md)
- [TypeORM – Select Query Builder](https://github.com/typeorm/typeorm/blob/master/docs/select-query-builder.md)
- [TypeORM – Relations](https://github.com/typeorm/typeorm/blob/master/docs/relations.md)
- [class-validator](https://github.com/typestack/class-validator)
- [uuid](https://www.npmjs.com/package/uuid) · [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) · [falso](https://ngneat.github.io/falso/docs/getting-started)

---

## 📄 Licence

Projet pédagogique – usage académique.
