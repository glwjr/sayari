# Sayari

Sayari is a full-stack social media application built for learning and experimentation, featuring a [NestJS](https://nestjs.com/) backend and a [Next.js](https://nextjs.org/) frontend. It supports user authentication, posts, comments, and an admin panel.

## Table of Contents

- [Features](#features)
- [Repo Structure](#repo-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Running the Apps](#running-the-apps)
- [Development](#development)
  - [Backend (NestJS)](#backend-nestjs)
  - [Frontend (Next.js)](#frontend-nextjs)
  - [Shared Types](#shared-types)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [API Overview](#api-overview)
- [License](#license)

## Features

- User registration, login, and JWT authentication
- Role-based access control (admin/user)
- Create, edit, and delete posts
- Comment on posts
- Admin panel for user management
- Responsive UI with Tailwind CSS
- Shared TypeScript types across packages
- Monorepo managed with Turborepo

## Repo Structure

```
.
├── packages/
│   ├── server/   # NestJS backend API
│   ├── types/    # Shared TypeScript types (@sayari/types)
│   └── web/      # Next.js frontend app
├── package.json  # Root workspace
├── turbo.json
├── tsconfig.base.json
├── LICENSE
└── .gitignore
```

## Tech Stack

- **Backend:** [NestJS](https://nestjs.com/), [TypeORM](https://typeorm.io/), [PostgreSQL](https://www.postgresql.org/)
- **Frontend:** [Next.js](https://nextjs.org/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Shared:** TypeScript, [`@sayari/types`](packages/types)
- **Auth:** JWT, bcrypt
- **Testing:** Jest, Supertest
- **Monorepo:** [Turborepo](https://turbo.build/)
- **Dev Tools:** ESLint, Prettier, TypeScript

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm v11+
- PostgreSQL database

### Environment Variables

Copy the example files and fill in your values:

```sh
cp packages/server/.env.example packages/server/.env
cp packages/web/.env.example packages/web/.env
```

#### `packages/server/.env`

```
DATABASE_URL=postgres://user:password@localhost:5432/sayari
JWT_SECRET=change-me
FRONTEND_URL=http://localhost:3000
PORT=8000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

#### `packages/server/.env.test`

For e2e tests, create a separate `.env.test` pointing at a test database (e.g. `sayari_test`):

```
DATABASE_URL=postgres://user:password@localhost:5432/sayari_test
JWT_SECRET=test-secret
FRONTEND_URL=http://localhost:3000
PORT=8001
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

#### `packages/web/.env`

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Installation

From the repo root (installs all packages via npm workspaces):

```sh
npm install
```

### Running the Apps

#### Run everything at once (recommended)

```sh
npm run dev
```

This starts both the backend and frontend in parallel via Turborepo.

#### Or start each individually

```sh
# Backend
cd packages/server && npm run start:dev

# Frontend
cd packages/web && npm run dev
```

- Backend: [http://localhost:8000](http://localhost:8000)
- Frontend: [http://localhost:3000](http://localhost:3000)

## Development

### Backend (NestJS)

- Source: [`packages/server`](packages/server)
- Main entry: [`src/main.ts`](packages/server/src/main.ts)
- API endpoints: `/auth`, `/users`, `/posts`, `/comments`
- Uses TypeORM with PostgreSQL (see [`src/app.module.ts`](packages/server/src/app.module.ts))
- Global authentication guard with role support
- Seed admin user on startup

### Frontend (Next.js)

- Source: [`packages/web`](packages/web)
- Main entry: [`src/app`](packages/web/src/app)
- Uses React Server Components and Client Components
- Auth context for JWT/session management
- API client in [`src/lib/api-client.ts`](packages/web/src/lib/api-client.ts)
- Tailwind CSS for styling

### Shared Types

- Source: [`packages/types`](packages/types)
- Package name: `@sayari/types`
- Imported by both `server` and `web` for type-safe API contracts

## Testing

### Backend

```sh
cd packages/server
npm run test         # Unit tests
npm run test:e2e     # End-to-end tests (requires .env.test and sayari_test DB)
```

Or from the root:

```sh
npm run test
npm run test:e2e
```

### Frontend

Frontend tests are not yet configured.

## Project Structure

- [`packages/server`](packages/server): NestJS backend
  - `src/`
    - `auth/`: Auth logic, guards, decorators
    - `users/`: User entity, controller, service
    - `posts/`: Post entity, controller, service
    - `comments/`: Comment entity, controller, service
    - `database/seeds/`: Seed admin user
- [`packages/types`](packages/types): Shared TypeScript types (`@sayari/types`)
- [`packages/web`](packages/web): Next.js frontend
  - `src/`
    - `app/`: App routes and pages
    - `components/`: UI components
    - `contexts/`: React context (auth)
    - `hooks/`: Custom hooks
    - `lib/`: API client
    - `types/`: Local type extensions

## API Overview

- **Auth:** `POST /auth/login`, `POST /auth/register`, `GET /auth/validate`
- **Users:** `GET /users`, `GET /users/:id`, `PATCH /users/:id`, `DELETE /users/:id`
- **Posts:** `GET /posts`, `GET /posts/hot`, `GET /posts/:id`, `POST /posts`, `PATCH /posts/:id`, `DELETE /posts/:id`
- **Comments:** `GET /posts/:postId/comments`, `POST /posts/:postId/comments`, `DELETE /posts/:postId/comments/:commentId`

See controller files for details.

## License

This project is for educational purposes and is [MIT licensed](LICENSE).
