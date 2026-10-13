# Next.js Full-Stack Lab

A sandbox project for learning and practicing production-oriented Next.js, frontend and full-stack development concepts.

This repository is intentionally used as a learning environment. The goal is to explore architecture, data flow, testing, authentication, database integration and other production-oriented patterns before applying them in a separate portfolio project.

There is intentionally no CSS or visual styling in this repository, because the focus is on architecture, application logic and full-stack concepts rather than UI polish.

Authentication currently supports OAuth sign-in with Google and GitHub using Auth.js and the Prisma Adapter.

## Tech Stack

- Next.js
- React
- TypeScript
- PostgreSQL
- Prisma ORM
- Auth.js / NextAuth.js
- Zod
- Vitest
- React Testing Library
- pnpm

## Current Learning Scope

Implemented so far:

- App Router
- Server and Client Components
- Dynamic routes
- Search with URL state
- Filtering
- Sorting
- Pagination
- Suspense and streaming
- Error handling
- Forms and Server Actions
- Zod validation
- CRUD operations
- Advanced Server Actions
- Optimistic UI
- PostgreSQL
- Prisma ORM
- Database migrations
- Database seeding
- Prisma Studio
- Data Layer / Repository pattern
- Auth.js base setup
- Prisma Auth.js adapter
- Auth database models
- Google OAuth
- GitHub OAuth

In progress / upcoming:

- Sessions
- Protected routes
- Role-Based Access Control (RBAC)
- User management
- Route Handlers and custom API
- Caching and revalidation
- Parallel data fetching
- Advanced Suspense and streaming architecture

## Project Purpose

This repository is a learning sandbox used to practice and understand modern Next.js and full-stack development.

It intentionally contains:

- learning exercises
- refactors
- testing practice
- experimental branches
- implementation iterations
- architecture exercises
- Git and pull request practice

After completing the learning roadmap, the concepts and patterns practiced here will be applied in a separate portfolio project: a production-oriented Admin Dashboard built from scratch in a clean repository.

## Requirements

Before running the project locally, make sure the following are installed:

- Node.js
- pnpm
- PostgreSQL

## Install Dependencies

```bash
pnpm install
```

## Environment Variables

Create a local `.env` file in the project root.

Example:

```env
DATABASE_URL="postgresql://username@localhost:5432/database_name?schema=public"
AUTH_SECRET="your-generated-auth-secret"

AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"
```

Do not commit real credentials or secrets.

Make sure `.env` is included in `.gitignore`.

## PostgreSQL

The project uses PostgreSQL as the database.

For local development, create a PostgreSQL database and update `DATABASE_URL` in `.env`.

Example:

```text
postgresql://username@localhost:5432/database_name?schema=public
```

## Prisma

### Validate the Prisma schema

```bash
pnpm exec prisma validate
```

### Run migrations

```bash
pnpm exec prisma migrate dev
```

When creating a new migration:

```bash
pnpm exec prisma migrate dev --name migration-name
```

### Generate Prisma Client

```bash
pnpm exec prisma generate
```

### Seed the database

```bash
pnpm exec prisma db seed
```

### Open Prisma Studio

```bash
pnpm exec prisma studio
```

Prisma Studio can be used to inspect and edit local database records visually.

## Development Server

Start the application:

```bash
pnpm dev
```

Then open:

```text
http://localhost:3000
```

## Testing

Run tests in watch mode:

```bash
pnpm test
```

Run tests once:

```bash
pnpm test:run
```

The project uses:

- Vitest
- React Testing Library
- jsdom
- jest-dom
- user-event

## Authentication

The project uses Auth.js / NextAuth.js.

Current base setup includes:

- `AUTH_SECRET`
- central `auth.ts`
- Auth.js Route Handler
- Prisma Adapter
- PostgreSQL-backed Auth.js models

Current Auth.js database models:

- User
- Account
- Session
- VerificationToken

Configured OAuth providers:

- Google
- GitHub

## Database Architecture

High-level data flow:

```text
UI / Server Component
        ↓
Data Layer
        ↓
Prisma Client
        ↓
PostgreSQL
```

For mutations:

```text
Form
  ↓
Server Action
  ↓
Zod validation
  ↓
Data Layer / Repository
  ↓
Prisma
  ↓
PostgreSQL
  ↓
revalidatePath / redirect
```

Prisma access should stay on the server and preferably behind the Data Layer / Repository boundary.

## Product Data Layer

The product feature currently supports:

- fetching all products
- fetching a single product
- search
- category filtering
- sorting
- pagination
- create
- update
- delete

## Project Structure

A simplified structure:

```text
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   └── dashboard/
├── components/
│   └── ui/
├── generated/
│   └── prisma/
├── lib/
│   ├── prisma.ts
│   └── products/
│       ├── constants.ts
│       ├── getProduct.ts
│       ├── getProducts.ts
│       ├── pagination.ts
│       ├── productRepository.ts
│       └── types.ts
└── auth.ts

prisma/
├── migrations/
├── schema.prisma
└── seed.ts
```

## Git Workflow

The repository is also used to practice a work-like Git workflow:

```text
main
  ↓
feat/... or refactor/... branch
  ↓
commits
  ↓
push
  ↓
pull request
  ↓
review
  ↓
merge
  ↓
update local main
  ↓
delete local branch
```

Conventional Commit prefixes used in this project:

```text
feat:
fix:
refactor:
test:
chore:
```

## Learning Roadmap

Legend: ✅ Completed · 🚧 In progress · ⏳ Upcoming

```text
✅ 1. Project Structure + App Router Basics
✅ 2. Server vs Client Components
✅ 2.5. Testing Foundation — Vitest + React Testing Library
✅ 3. Data Fetching + Server Component Data Flow
✅ 4. Suspense + Streaming
✅ 5. Error Handling + error.tsx
✅ 6. Dynamic Routes + params + notFound()
✅ 7. Search + URL State + searchParams + Debounce
✅ 8. Pagination + Sorting
✅ 9. Forms + Server Actions
✅ 10. Zod Validation + Form Errors
✅ 11. CRUD — Edit, Update, Delete
✅ 12. Advanced Server Actions — bind(), Programmatic Actions, useTransition
✅ 13. Optimistic UI + useOptimistic
✅ 14. PostgreSQL + Prisma + Real Data Layer
✅ 15. Authentication with Auth.js / NextAuth.js
✅ 16. OAuth — Google + GitHub
🚧 17. Session + Protected Routes
⏳ 18. RBAC — USER / ADMIN
⏳ 19. User Management
⏳ 20. Route Handlers + Own API
⏳ 21. Caching + Revalidation + use cache
⏳ 22. Parallel Data Fetching + Waterfall Optimization
⏳ 23. Advanced Suspense + Streaming Architecture
⏳ 24. Start Portfolio Admin Dashboard — New Clean Repository
⏳ 25. Component / Integration Testing
⏳ 26. Mocking + API Testing
⏳ 27. Playwright E2E
⏳ 28. Performance + Bundle + Rendering Optimization
⏳ 29. Security + Authorization Hardening
⏳ 30. Production Error Handling + Logging
⏳ 31. Vercel Deployment + Environment Variables
⏳ 32. Final Architecture Review + Refactor
⏳ 33. Portfolio Polish + Release
```

## Notes

This repository is not intended to be a finished product.

Its purpose is to provide a safe environment for experimenting with Next.js, PostgreSQL, Prisma, Auth.js, testing, architecture and full-stack development patterns.

After completing the learning roadmap, a separate Admin Dashboard portfolio project will be built using the knowledge and patterns practiced here.
