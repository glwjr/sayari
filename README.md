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
- Type-safe API and shared types
- Isolated `server` and `web` packages

## Repo Structure

```
.
├── packages/
│   ├── server/   # NestJS backend API
│   └── web/      # Next.js frontend app
└── .gitignore
```

## Tech Stack

- **Backend:** [NestJS](https://nestjs.com/), [TypeORM](https://typeorm.io/), [PostgreSQL](https://www.postgresql.org/)
- **Frontend:** [Next.js](https://nextjs.org/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Auth:** JWT, bcrypt
- **Testing:** Jest, Supertest
- **Dev Tools:** ESLint, Prettier, TypeScript

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm, yarn, or pnpm
- PostgreSQL database

### Environment Variables

Create `.env` files in both `packages/server/` and `packages/web/`:

#### `packages/server/.env`

```
DATABASE_URL=<your-postgres-database-url>
JWT_SECRET=<your-jwt-secret>
ADMIN_USERNAME=<your-admin-username>
ADMIN_PASSWORD=<your-admin-password>
FRONTEND_URL=http://localhost:3000
PORT=8000
```

#### `packages/web/.env`

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Installation

From the repo root:

```sh
cd packages/server
npm install

cd ../web
npm install
```

### Running the Apps

#### Start the Backend

```sh
cd packages/server
npm run start:dev
```

#### Start the Frontend

```sh
cd packages/web
npm run dev
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

## Testing

### Backend

```sh
cd packages/server
npm run test         # Unit tests
npm run test:e2e     # End-to-end tests
```

### Frontend

- Use [Jest](https://jestjs.io/) or [React Testing Library](https://testing-library.com/) (not yet set up by default).

## Project Structure

- [`packages/server`](packages/server): NestJS backend
  - `src/`
    - `auth/`: Auth logic, guards, decorators
    - `users/`: User entity, controller, service
    - `posts/`: Post entity, controller, service
    - `comments/`: Comment entity, controller, service
    - `database/seeds/`: Seed admin user
- [`packages/web`](packages/web): Next.js frontend
  - `src/`
    - `app/`: App routes and pages
    - `components/`: UI components
    - `contexts/`: React context (auth)
    - `hooks/`: Custom hooks
    - `lib/`: API client
    - `types/`: Shared TypeScript types

## API Overview

- **Auth:** `POST /auth/login`, `POST /auth/register`, `GET /auth/validate`
- **Users:** `GET /users`, `GET /users/:id`, `PATCH /users/:id`, `DELETE /users/:id`
- **Posts:** `GET /posts`, `GET /posts/hot`, `GET /posts/:id`, `POST /posts`, `PATCH /posts/:id`, `DELETE /posts/:id`
- **Comments:** `GET /posts/:postId/comments`, `POST /posts/:postId/comments`, `DELETE /posts/:postId/comments/:commentId`

See controller files for details.

## License

This project is for educational purposes and is [MIT licensed](LICENSE).
