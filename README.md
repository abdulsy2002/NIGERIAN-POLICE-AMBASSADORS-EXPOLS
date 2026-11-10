# Nigerian Police Ambassadors EX-POLS Portal

The EX-POLS portal is a centralized web application for Nigerian Police Ambassadors EX-POLS (NPAE). It provides member registration and profiles, chapter administration, payments, reunion registration, support, gallery management, and national administration.

The platform is organized around state chapters. Chapters maintain their own operational records and settings, while national administrators can manage chapter activity and national-level data.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Repository structure](#repository-structure)
- [Requirements](#requirements)
- [Configuration](#configuration)
- [Local development](#local-development)
- [Database and migrations](#database-and-migrations)
- [Chapters and administrator access](#chapters-and-administrator-access)
- [Payments and receipts](#payments-and-receipts)
- [API and health checks](#api-and-health-checks)
- [Validation](#validation)
- [Backups](#backups)
- [Production checklist](#production-checklist)

## Features

### Members

- Alumni and Ambassador registration and sign-in.
- Member profiles, dashboards, and digital ID card support.
- Profile-change requests that administrators can review and approve or reject.
- Account approval workflows and member communications.
- Support-ticket submission and responses.

### Administration

- Super Admin, National Admin, and State Admin roles.
- Chapter-aware member and administrative workflows.
- Review of member registrations and profile-change requests.
- Board and leadership management.
- Chapter-specific payment and reunion settings.
- Chapter-scoped reunion registrations, payments, support tickets, gallery images, and contact messages.
- Broadcasts to members, including targeting by chapter.
- Audit logging for key administrative and payment actions.

### Public pages and chapter features

- Public contact, gallery, payment, and reunion pages.
- Anonymous visitors can choose a chapter where the page supports chapter selection.
- Signed-in members are associated with their assigned chapter; public chapter selection cannot override the member's assigned chapter.
- National (`NAT`) data remains separate from state-chapter data.

## Technology

| Area | Technology |
|---|---|
| Web application | Next.js 16 App Router, React 18, TypeScript |
| API | NestJS 11, TypeScript |
| Database access | Prisma ORM |
| Database | PostgreSQL |
| Authentication | JWT access and refresh sessions |
| Payments | Paystack |
| Image storage | S3-compatible object storage |
| Background jobs | BullMQ and Redis |
| Email | Nodemailer / SMTP |

The frontend calls the NestJS API through Next.js server actions. The backend exposes Swagger API documentation at `/docs`.

## Repository structure

```text
.
├── backend-nest/             # NestJS API and Prisma schema/migrations
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   └── src/
│       ├── admin/             # Admin workflows, roles, and audit logs
│       ├── alumni/            # Alumni registration
│       ├── ambassadors/       # Ambassador registration
│       ├── auth/              # Login, registration, sessions, profile
│       ├── common/            # Chapter codes and scope validation
│       ├── contact/
│       ├── gallery/
│       ├── mail/
│       ├── payments/
│       ├── reunion/
│       ├── storage/
│       └── support/
└── frontend/                  # Next.js web application
    ├── scripts/               # Backup and restore utilities
    └── src/
        ├── app/                # Public pages, member pages, and admin panel
        ├── components/
        └── lib/
```

## Requirements

- Node.js 20.9 or later and npm (required by the Next.js 16 frontend).
- PostgreSQL database.
- Redis for distributed request rate limits in staging/production; development and test may use the bounded in-process fallback.
- S3-compatible storage credentials for gallery/file storage.
- Paystack account credentials to process real payments.
- SMTP credentials to send email.

Install dependencies separately in each application directory; there is no root-level workspace install:

```powershell
cd backend-nest
npm install

cd ..\frontend
npm install
```

## Configuration

### Backend

Create `backend-nest/.env`. Use `backend-nest/.env.example` as a reference and replace every placeholder with the appropriate local or deployment value:

```env
PORT=5100
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=replace_with_a_long_random_secret

REDIS_URL=redis://localhost:6379

AWS_ENDPOINT_URL_S3=https://your-s3-compatible-endpoint
AWS_ACCESS_KEY_ID=replace_with_access_key
AWS_SECRET_ACCESS_KEY=replace_with_secret_key
AWS_REGION=us-east-2
S3_BUCKET=expols-gallery

PAYSTACK_SECRET_KEY=replace_with_paystack_secret_key
RESEND_API_KEY=re_replace_with_resend_api_key
RESEND_FROM_EMAIL="NPAE <noreply@your-verified-domain.example>"

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_smtp_user
MAIL_PASS=your_smtp_password
APP_URL=http://localhost:3000
```

Keep secrets in environment configuration, not in source control. The storage service requires valid S3-compatible endpoint and credentials. When `RESEND_API_KEY` is configured, welcome and registration emails use the Resend API; `RESEND_FROM_EMAIL` must be a sender verified in the Resend account. `MAIL_USER` is the fallback sender and SMTP credentials are used only when no Resend key is configured. Redis is required outside development/test for distributed rate limits and is also used by background jobs. Set `TRUST_PROXY_HOPS` to the exact number of trusted reverse proxies in front of the API; keep it at `0` for direct local access. If setting `PRISMA_CONNECTION_LIMIT`, calculate the per-instance value from the database connection allocation and maximum API replica count, reserving connections for migrations and operations.

### Frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_NEST_API_URL=http://localhost:5100
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_replace_with_your_public_key
```

`NEXT_PUBLIC_NEST_API_URL` is the base URL of the NestJS API (without an `/api` suffix). If omitted, the frontend uses `http://localhost:5100`. The Paystack public key must belong to the same Paystack environment as the backend secret key.

## Local development

1. Configure the backend and frontend environment files.
2. Ensure PostgreSQL, Redis, and the S3-compatible storage configuration are available.
3. Generate the Prisma client and apply database migrations from `backend-nest`:

   ```powershell
   cd backend-nest
   npx prisma generate
   npx prisma migrate deploy
   ```

4. Start the API in a terminal:

   ```powershell
   cd backend-nest
   npm run dev
   ```

   By default, the API listens on `http://localhost:5100`.

5. Start the web application in a second terminal:

   ```powershell
   cd frontend
   npm run dev
   ```

   The web application is available at `http://localhost:3000`.

6. Open `http://localhost:5100/docs` to explore the API, or `http://localhost:5100/health` to check API/database health.

The frontend development script uses Next.js with Webpack (`next dev --webpack`).

## Database and migrations

The NestJS backend uses PostgreSQL through Prisma. Its schema is in `backend-nest/prisma/schema.prisma`, and committed migration files are in `backend-nest/prisma/migrations/`.

Useful commands, run from `backend-nest`:

```powershell
npx prisma generate          # Regenerate Prisma Client
npx prisma migrate deploy    # Apply committed migrations
npm run prisma:migrate       # Create/apply a development migration
npm run prisma:studio        # Open Prisma Studio
```

For production, back up the database before applying migrations. Do not edit an already-applied migration; create a new migration for schema changes.

Chapter ownership is stored on the relevant records. The chapter-feature migration assigns legacy payment settings and feature records without a chapter to the national scope (`NAT`); support-ticket ownership is backfilled from the ticket owner's chapter when available.

The migration `20261109010000_add_list_query_indexes` has been applied to the configured Neon database. It adds indexes used by the paginated member, support-ticket, support-response, gallery, and contact-message queries. The database was verified with `npx prisma migrate status` and reported up to date after deployment. For other environments, run `npx prisma migrate deploy` from `backend-nest` to apply this migration.

## Chapters and administrator access

The portal supports all 36 Nigerian states, the Federal Capital Territory (`ABJ`), Diaspora (`DIA`), and the separate national scope (`NAT`). The shared chapter-code definitions are maintained in the backend and frontend.

- **Super Admin**: platform-level administration, including administrator management.
- **National Admin**: national-level administration and the ability to manage/view chapter-scoped workflows across chapters.
- **State Admin**: restricted to the chapter assigned to that administrator.
- **Members**: access their own account and member workflows.

Chapter authorization is enforced by the backend, not just by hiding frontend controls. A State Admin cannot use a request parameter to access another chapter's data. National administrators can select a chapter for chapter-specific work; `ALL` is used for supported list views. Settings apply to one scope at a time. National settings and records remain separate from each state chapter's data.

State Admin accounts must be provisioned and assigned to their chapter by an authorized administrator before those chapters can be administered.

## Payments and receipts

- Payment purposes and fixed amounts are configured independently for each chapter and for the national scope.
- The backend validates the selected purpose and amount; changing the submitted amount in the browser does not bypass the configured amount.
- Payment records are stored against the resolved chapter.
- Payment verification is performed by the backend with Paystack before a payment is considered confirmed.
- The payment page displays a receipt for a verified payment, including its payment reference and transaction details, and supports printing/saving the receipt.
- Reunion registration requires a signed-in member and is associated with that member's assigned chapter.

Use Paystack test credentials for local testing. Never expose the Paystack secret key in frontend code or in a `NEXT_PUBLIC_` variable.

## API and health checks

The backend's API documentation is served at:

```text
http://localhost:5100/docs
```

The health endpoint is:

```text
GET http://localhost:5100/health
```

It reports API and database availability. A healthy response includes `status: "UP"` and `database: "UP"`; database connectivity problems are logged and return HTTP 503.

The API is organized into modules for authentication, alumni, ambassadors, admin, payments, reunion, support, contact, gallery, storage, and health. Controllers in each module define the available routes; consult Swagger for request and response schemas.

Large admin, support, reunion, payment, contact, and gallery lists accept `page` and `pageSize` query parameters. The default page size is 25, and the server caps page size at 100. Paginated responses include `data` and `pagination` metadata (`page`, `pageSize`, `total`, and `totalPages`). Chapter scope filters remain enforced server-side. Member list responses omit large image and document fields; those fields are returned by the scoped member-detail endpoints when needed.

Capacity work and the safe, read-only k6 load-test harness are documented in [SCALE_CAPACITY_IMPLEMENTATION_PLAN.md](./SCALE_CAPACITY_IMPLEMENTATION_PLAN.md) and `backend-nest/load-tests/capacity.js`. Run it only against an approved non-production target with synthetic data; production load testing is not authorized by these scripts.

## Validation

Run backend build and tests from `backend-nest`:

```powershell
npm run build
npm test -- --runInBand
npx prisma validate
```

Run frontend checks from `frontend`:

```powershell
npx tsc --noEmit
npm run build
```

## Backups

The frontend package provides scripts for local backup management:

```powershell
cd frontend
npm run backup
npm run backup:list
npm run restore
```

Review the backup and restore scripts and configure their required storage/paths for your environment before relying on them. Also maintain regular PostgreSQL backups; the application-level scripts are not a replacement for database backups.

## Production checklist

- Set strong, unique secrets and use production Paystack credentials only in the backend.
- Use HTTPS for the frontend and API; set `CORS_ORIGIN` to the exact deployed frontend origin.
- Set the frontend's `NEXT_PUBLIC_NEST_API_URL` to the deployed API base URL.
- Configure and verify PostgreSQL, Redis, SMTP, and S3-compatible storage access.
- Apply migrations deliberately and back up the database before schema changes.
- Provision administrator accounts with the correct role and chapter assignment.
- Confirm each State Admin can access only its chapter, and national administrators can manage the required scopes.
- Test successful and unsuccessful Paystack verification and receipt generation before accepting live payments.
- Monitor backend logs and audit logs, and regularly test database and file-storage backups.
