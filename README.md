# Next.js Full-Stack Lab

A sandbox project for learning and practicing production-oriented Next.js, React, TypeScript, and full-stack development concepts.

This repository serves as a learning environment for exploring application architecture, data flow, testing, authentication, authorization, database integration, API development, and caching before applying these concepts in a separate portfolio project.

There is intentionally no CSS or visual styling in this repository. The focus is on architecture, application logic, security fundamentals, and full-stack engineering rather than UI polish.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- PostgreSQL
- Prisma ORM
- Auth.js / NextAuth.js
- Google and GitHub OAuth
- Zod
- Vitest
- React Testing Library
- pnpm

## Current Learning Scope

### Implemented

**Next.js and React**

- App Router
- Server and Client Components
- Dynamic routes
- Search with URL state
- Filtering and sorting
- Pagination
- Suspense and streaming
- Error handling
- Forms and Server Actions
- Advanced Server Actions
- React transitions and Optimistic UI

**Database and Architecture**

- PostgreSQL integration
- Prisma ORM
- Database migrations and seeding
- Prisma Studio
- Data Layer / Repository pattern
- Service layer for shared business logic
- Prisma transactions
- CRUD operations
- Soft deletion and restoration

**Authentication and Authorization**

- Auth.js with Prisma Adapter
- Google and GitHub OAuth
- Database-backed sessions
- Session-based protected routes
- Role-Based Access Control (RBAC)
- USER / ADMIN authorization
- Account activation and deactivation
- Session revocation

**User Management**

- User listing, search, and filtering
- User role management
- User activation and deactivation
- Soft delete and restore
- Invitation creation and renewal
- Invitation listing and revocation
- Invitation expiration validation
- Invitation-only OAuth registration
- First-login onboarding
- Automatic role assignment from invitations
- Login error handling

**Route Handlers and API**

- HTTP GET, POST, PATCH, and DELETE methods
- Dynamic API routes
- Route and query parameters
- JSON request and response handling
- Zod request validation
- HTTP status codes
- Authentication and authorization for API endpoints
- Shared service logic between Server Actions and Route Handlers

**Caching and Revalidation**

- Next.js Cache Components
- `use cache`
- `cacheLife()`
- `cacheTag()`
- `updateTag()`
- `revalidatePath()`
- Cache invalidation for product lists and individual products
- `revalidateTag()` and stale-while-revalidate concepts

**Testing**

- Vitest
- React Testing Library
- jsdom
- jest-dom
- user-event

### Upcoming

- Parallel data fetching and waterfall optimization
- Advanced Suspense and streaming architecture
- Portfolio Admin Dashboard
- Advanced testing
- Performance optimization
- Security hardening
- Deployment and production architecture

## Project Purpose

This repository is a learning sandbox used to practice and understand modern Next.js and full-stack development.

It intentionally contains:

- Learning exercises
- Refactors
- Testing practice
- Experimental branches
- Implementation iterations
- Architecture exercises
- Git and pull request practice

After completing the initial learning roadmap, the concepts and patterns practiced here will be applied in a separate portfolio project: a production-oriented Admin Dashboard built from scratch in a clean repository.

## Requirements

Before running the project locally, install:

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

Never commit real credentials or secrets.

Make sure `.env` is included in `.gitignore`.

## PostgreSQL

The project uses PostgreSQL as its relational database.

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

Then open: http://localhost:3000

## Testing

Run tests in watch mode:

```bash
pnpm test
```

Run tests once:

```bash
pnpm test:run
```

The project uses Vitest and React Testing Library for testing application logic and React components.

## Authentication

The project uses Auth.js / NextAuth.js with Google and GitHub OAuth providers and the Prisma Adapter.

The authentication setup includes:

- Central `auth.ts` configuration
- Auth.js Route Handler
- Prisma Adapter
- PostgreSQL-backed sessions
- Session-based route protection
- USER and ADMIN roles
- Server-side authorization checks

### Auth.js Database Models

- User
- Account
- Session
- VerificationToken

### User Lifecycle

User management supports:

- Active and inactive accounts
- Role updates
- Session revocation
- Soft deletion
- Restoration of archived users

Deactivating or deleting a user revokes their active sessions.

Restoring an archived user does not automatically reactivate the account.

### Invitation-Only Registration

New users cannot register through OAuth unless they have a valid invitation.

The invitation lifecycle is:

```text
Admin creates invitation
        ↓
Invitation = PENDING
        ↓
User signs in with Google or GitHub
        ↓
Auth.js validates invitation
        ↓
Auth.js creates User
        ↓
First-login onboarding
        ↓
User.role = Invitation.role
        ↓
Invitation = ACCEPTED
```

Invitations support:

- USER / ADMIN role assignment
- Expiration
- Renewal
- Revocation
- Acceptance tracking

The onboarding logic uses a Prisma transaction to update the user's role and mark the invitation as accepted.

Existing users are authenticated using their account status without requiring a new invitation.

## Application Architecture

The project separates HTTP/UI entry points, business logic, and database access.

### Read Operations

```text
Server Component / Route Handler
                ↓
        Data Layer / Repository
                ↓
            Prisma Client
                ↓
             PostgreSQL
```

### Mutation Operations

```text
Client Form / HTTP Request
              ↓
Server Action / Route Handler
              ↓
Authentication + Authorization
              ↓
         Zod Validation
              ↓
          Service Layer
              ↓
           Repository
              ↓
          Prisma Client
              ↓
           PostgreSQL
```

Not every operation requires a service layer. Simple database operations can use repository functions directly.

### Repository Layer

The repository layer handles database access through Prisma.

Examples:

- `getUsers()`
- `getUserById()`
- `getUserByEmail()`
- `updateUserRoleRecord()`
- `softDeleteUserRecord()`
- `getInvitationByEmail()`
- `createInvitationRecord()`

### Service Layer

The service layer handles business rules and coordinates repository operations.

For example:

```ts
createOrRenewInvitation(email, role, invitedById)
```

This service is shared by:

- The invitation Server Action
- The invitation HTTP API

Both entry points perform their own authentication and authorization checks, then call the shared business logic.

Prisma access remains server-side.

## API — Route Handlers

The application includes custom HTTP endpoints using Next.js App Router Route Handlers.

### User API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List users with optional filters |
| GET | `/api/users/[id]` | Retrieve a user by ID |
| PATCH | `/api/users/[id]` | Update a user's role |
| DELETE | `/api/users/[id]` | Soft-delete a user |

### Invitation API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/invitations` | Create or renew an invitation |

The endpoints use session-based authentication and ADMIN authorization.

Supported response statuses include:

- `200 OK`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`

### User Filtering

The users API supports optional query parameters:

```http
GET /api/users?query=john&role=USER&status=active
```

Supported parameters:

- `query` — search by name or email
- `role` — USER or ADMIN
- `status` — active or inactive

## Caching and Revalidation

The project uses Next.js 16 Cache Components.

Caching is enabled in `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  cacheComponents: true,
};
```

### Cached Product Queries

Product list data is cached using:

```ts
"use cache";

cacheLife("hours");
cacheTag("products");
```

Query parameters and pagination inputs are part of the cache key.

Individual product queries use dynamic tags:

```ts
"use cache";

cacheLife("hours");
cacheTag(`product-${id}`);
```

### Cache Invalidation

Product mutations can invalidate related cache entries:

```ts
updateTag("products");
updateTag(`product-${id}`);
```

The project also explores these Next.js caching APIs:

| API | Purpose |
|---|---|
| `use cache` | Cache function or component results |
| `cacheLife()` | Configure cache lifetime |
| `cacheTag()` | Associate cache entries with tags |
| `updateTag()` | Expire tagged cache after a Server Action |
| `revalidateTag()` | Mark tagged cache stale for revalidation |
| `revalidatePath()` | Invalidate a specific route path |

Authentication, authorization decisions, and other security-sensitive data are kept separate from general-purpose cached application data.

## Product Data Layer

The product feature supports:

- Fetching product lists
- Fetching individual products
- Search
- Category filtering
- Sorting
- Pagination
- Create
- Update
- Delete
- Cache tagging and invalidation

## Project Structure

Simplified structure:

```text
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── invitations/
│   │   │   └── route.ts
│   │   └── users/
│   │       ├── route.ts
│   │       └── [id]/
│   │           └── route.ts
│   └── dashboard/
│       ├── products/
│       └── users/
│           ├── invitations/
│           └── archived/
├── components/
│   └── ui/
├── generated/
│   └── prisma/
├── lib/
│   ├── prisma.ts
│   ├── products/
│   │   ├── constants.ts
│   │   ├── getProduct.ts
│   │   ├── getProducts.ts
│   │   ├── pagination.ts
│   │   ├── productRepository.ts
│   │   └── types.ts
│   ├── users/
│   │   └── userRepository.ts
│   └── invitations/
│       ├── invitationRepository.ts
│       └── invitationService.ts
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
feature / refactor branch
  ↓
implementation
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
delete completed branch
```

Each learning feature is developed on a dedicated branch.

### Conventional Commits

Prefixes used in this project:

```text
feat:
fix:
refactor:
test:
chore:
docs:
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
✅ 17. Session + Protected Routes
✅ 18. RBAC — USER / ADMIN
✅ 19. User Management + Invitation Onboarding
✅ 20. Route Handlers + Own API
✅ 21. Caching + Revalidation + use cache
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

Its purpose is to provide a safe environment for experimenting with Next.js, PostgreSQL, Prisma, Auth.js, testing, architecture, API development, and caching strategies.

The next major milestone is a separate, production-oriented Admin Dashboard portfolio project, where these concepts will be applied to a coherent application with a dedicated UI design, real domain models, testing, and deployment.
