# 📝 NestJS Todo API – TP1 RT4 (2026/2027)

API REST de gestion de **Todos** développée avec **NestJS**, **TypeORM** et **MySQL**, dans le cadre du TP1 du cours NestJS (RT4).

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
10. [Règles et bonnes pratiques](#-règles-et-bonnes-pratiques)
11. [Ressources](#-ressources)

---

## 🎯 Objectifs

Ce TP a pour but de mettre en pratique les notions vues en cours :

- Modules, contrôleurs et providers (services, providers personnalisés)
- Injection de dépendances (IoC container)
- DTO, validation (`class-validator`, `class-transformer`) et `ValidationPipe`
- Mapped types (`PartialType`, `PickType`, `OmitType`…)
- Persistance avec **TypeORM** (entités, repository, QueryBuilder)
- Colonnes spéciales (`@CreateDateColumn`, `@UpdateDateColumn`, `@DeleteDateColumn`)
- Soft delete / restore
- Versioning d'API (URI versioning)
- Recherche, statistiques et pagination

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

---

## ✅ Prérequis

- **Node.js** ≥ 16.13
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

| Commande             | Description               |
| -------------------- | ------------------------- |
| `npm run start:dev`  | Lance l'app en mode watch |
| `npm run build`      | Compile le projet         |
| `npm run start:prod` | Lance la version compilée |
| `npm run test`       | Lance les tests unitaires |

### Dépendances à installer lors du développement

```bash
npm i --save @nestjs/typeorm typeorm mysql2
npm i --save @nestjs/config
npm i --save class-validator class-transformer
npm i --save @nestjs/mapped-types
npm i --save uuid
```

---

## 🔐 Variables d'environnement

Créer un fichier `.env` à la racine (⚠️ **ne jamais le commiter**, l'ajouter au `.gitignore`) :

```env
PROJECT_PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=nest_todo
```

Fournir également un fichier `.env.example` (sans valeurs sensibles) dans le dépôt.

---

## 🧱 Architecture du projet

Architecture cible (modulaire, une responsabilité par couche) :

```
src/
├── main.ts                      # Point d'entrée (ValidationPipe global, versioning)
├── app.module.ts                # Module racine (ConfigModule, TypeOrmModule…)
│
├── common/                      # Module partagé (utilisé partout)
│   ├── common.module.ts
│   ├── providers/
│   │   └── uuid.provider.ts     # Provider personnalisé (token 'UUID')
│   └── entities/
│       └── timestamp.entity.ts  # createdAt / updatedAt / deletedAt réutilisables
│
├── todo/
│   ├── todo.module.ts
│   ├── todo.controller.ts       # Version 1 (en mémoire)
│   ├── todo-db.controller.ts    # Version 2 (base de données)
│   ├── todo.service.ts
│   ├── entities/
│   │   └── todo.entity.ts
│   ├── dto/
│   │   ├── add-todo.dto.ts
│   │   ├── update-todo.dto.ts
│   │   ├── search-todo.dto.ts
│   │   └── pagination.dto.ts
│   ├── enums/
│   │   └── todo-status.enum.ts
│   └── models/
│       └── todo.model.ts
│
└── shared/
    └── error-messages.ts        # Messages d'erreur centralisés
```

> 💡 L'architecture ci-dessus est une base de réflexion : elle sera ajustée au fil du développement.

---

## 🗄 Modèle de données

### `TodoEntity`

| Champ         | Type             | Description                                       |
| ------------- | ---------------- | ------------------------------------------------- |
| `id`          | `number`         | Clé primaire auto-incrémentée                     |
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

---

## 🌐 Endpoints de l'API

> Les routes ci-dessous sont **prévisionnelles** et seront confirmées pendant l'implémentation.
> L'ajout d'un todo existe en **deux versions** (v1 en mémoire, v2 en base de données) via l'**URI versioning**.

| Méthode  | Route                  | Description                                                   |
| -------- | ---------------------- | ------------------------------------------------------------- |
| `POST`   | `/v1/todo`             | Ajouter un todo (version initiale, en mémoire)                |
| `POST`   | `/v2/todo`             | Ajouter un todo en base de données                            |
| `GET`    | `/v2/todo`             | Récupérer les todos (avec recherche et pagination)            |
| `GET`    | `/v2/todo/:id`         | Récupérer un todo par son id (404 si inexistant)              |
| `PATCH`  | `/v2/todo/:id`         | Mettre à jour un todo                                         |
| `DELETE` | `/v2/todo/:id`         | Supprimer définitivement un todo                              |
| `DELETE` | `/v2/todo/:id/soft`    | Suppression soft d'un todo                                    |
| `PATCH`  | `/v2/todo/restore/:id` | Restaurer un todo supprimé (soft)                             |
| `GET`    | `/v2/todo/stats`       | Nombre de todos pour chacun des 3 statuts (une seule requête) |

### Recherche (query params, tous optionnels)

```
GET /v2/todo?search=nest&status=En cours
```

- `search` : chaîne recherchée dans le **name** OU la **description**
- `status` : statut recherché
- Pagination : `page` et `limit` (valeurs par défaut à définir)

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
- [ ] Pagination de la fonction `getAll` (fonction générique et réutilisable, via QueryBuilder)

---

## 📐 Règles et bonnes pratiques

Rappel des règles du TP :

1. **Code personnel et compris** : chaque ligne doit pouvoir être expliquée lors de la validation.
2. **Réfléchir avant de coder** (ou de solliciter une IA).
3. **Architecture cohérente**, code propre, lisible et factorisé ; application des **design patterns** (IoC/DI, Repository, DTO…).
4. **La validation est un entretien** : bien maîtriser le sujet le jour J.

Conventions Git suggérées :

- Un commit par exercice, avec un message clair (ex. `feat(todo): add soft delete and restore`)
- Branche principale : `main` ; branches de fonctionnalité si nécessaire
- Ne jamais commiter `.env` ni `node_modules`

---

## 📚 Ressources

- [Documentation NestJS](https://docs.nestjs.com/)
- [Modules](https://docs.nestjs.com/modules) · [Custom providers](https://docs.nestjs.com/fundamentals/custom-providers) · [Validation](https://docs.nestjs.com/techniques/validation) · [Versioning](https://docs.nestjs.com/techniques/versioning) · [Configuration](https://docs.nestjs.com/techniques/configuration)
- [TypeORM – Repository API](https://github.com/typeorm/typeorm/blob/master/docs/repository-api.md)
- [TypeORM – Find options](https://github.com/typeorm/typeorm/blob/master/docs/find-options.md)
- [TypeORM – Select Query Builder](https://github.com/typeorm/typeorm/blob/master/docs/select-query-builder.md)
- [class-validator](https://github.com/typestack/class-validator)
- [uuid](https://www.npmjs.com/package/uuid)

---

## 📄 Licence

Projet pédagogique – usage académique.
