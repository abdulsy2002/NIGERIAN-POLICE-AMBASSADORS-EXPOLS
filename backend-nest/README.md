# EX-POLS NestJS Backend

This is the migrated backend running alongside the legacy Express/MongoDB API.

## Development

Create `.env` from `.env.example`, then set:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_long_random_secret
PORT=5100
CORS_ORIGIN=http://localhost:3000
```

Install and run:

```powershell
npm install
npx prisma generate
npm run dev
```

The API runs at `http://localhost:5100`.

- Health: `GET /health`
- Swagger: `http://localhost:5100/docs`

## Database

Apply committed migrations:

```powershell
npx prisma migrate deploy
```

Do not use `prisma migrate reset` against the Neon database.

## Tests

```powershell
npm run build
npm test -- --runInBand
```

## Docker

Local PostgreSQL and Redis services are defined in `docker-compose.yml`:

```powershell
docker compose up -d postgres redis
```

The application uses Redis for distributed request rate limits outside development/test; configure `REDIS_URL` before deploying to staging or production. Development/test may use the bounded in-process fallback. The queue service is optional until background workers are introduced.

Registration confirmations and approval welcome emails use Resend when `RESEND_API_KEY` is set. Configure `RESEND_FROM_EMAIL` to a sender verified by Resend. If no Resend key is set, the service uses SMTP only when `MAIL_USER` and `MAIL_PASS` are configured. Successful account creation is retained even if the provider is unavailable; the API reports `emailSent: false` and logs the delivery error so the registration can be handled without a duplicate retry.

Set `TRUST_PROXY_HOPS` to the exact number of trusted reverse proxies in front of the API (`0` for direct local access). `PRISMA_CONNECTION_LIMIT` is an optional positive integer that overrides Prisma's per-instance pool limit; calculate it from the database connection allocation, maximum API replicas, and reserved operational headroom before setting it.

The read-only k6 capacity harness is `load-tests/capacity.js`. Its explicit environment confirmation is required, and it must only be run against an approved isolated environment populated with synthetic data.

## Migration Strategy

The current frontend and legacy Express/MongoDB backend remain available during migration. Migrated frontend actions use `NEXT_PUBLIC_NEST_API_URL` where their NestJS module is ready. Keep both APIs running until all modules and E2E tests have been cut over.
