# Scale and Capacity Implementation Plan

## Purpose

Prepare the EX-POLS portal to support 10,000 registered members and establish, through testing, the amount of concurrent activity the deployed service can sustain without unacceptable errors or latency.

This plan does not assume that 10,000 registered members means 10,000 simultaneous requests. The target traffic profile and production service tiers must be agreed before capacity can be claimed.

## Current assessment

The project already has paginated list endpoints, chapter-oriented database indexes, a paginated gallery, and static rendering for most frontend routes. These are useful foundations, but they do not prove capacity under concurrent load.

The main work areas identified in the audit are:

- No repository load-test suite or defined API performance SLOs.
- Authentication, member validation, public registration, contact, reunion registration, payment initialization, support creation, and profile updates now have route-level rate limits. Production requires Redis; the in-process fallback is for development only.
- Profile, document, and gallery uploads now have field limits, decoded-size checks, and supported-format validation. The global 10 MB JSON limit remains as a request-wide ceiling.
- Prisma/database connection budgets need to be matched to the chosen Neon tier and the number of application replicas.
- Admin and member broadcast history plus pending profile-update requests now use bounded, paginated queries and admin pagination controls.
- Member validation includes case-insensitive substring name matching, which may become expensive as data grows.
- Redis/BullMQ infrastructure exists, but background workers are not yet established for workload that should be moved off the request path.

## Implementation status

**Completed in the repository:** distributed rate-limit guard and route policies, upload bounds and content checks, pagination for the identified growing admin/member lists, a database health check that returns HTTP 503 on database failure, Paystack request timeouts, an optional validated `PRISMA_CONNECTION_LIMIT` override, and a staged k6 read-load script with explicit non-production confirmation.

**Deployment-dependent and not yet verified:** production `REDIS_URL`, accurate `TRUST_PROXY_HOPS`, the value of `PRISMA_CONNECTION_LIMIT` and Neon pooler mode, and an isolated environment with a representative synthetic dataset. Set the per-instance limit so `API replicas × PRISMA_CONNECTION_LIMIT` stays below the application connection allocation, keeping separate headroom for migrations and operations. The k6 script has not been run; no concurrency or latency capacity has been demonstrated.

**Still required before a capacity claim:** connection-budget configuration, query-plan review with representative data, monitoring/alerts, agreed workload and SLOs, and staged/soak/stress results on production-like infrastructure. The k6 script currently exercises read paths only; write tests require isolated synthetic accounts and a cleanup strategy.

## Goals and non-goals

### Goals

1. Keep the application stable with at least 10,000 representative member records.
2. Measure response time, error rate, database health, and resource use under realistic concurrent traffic.
3. Control expensive, burstable, or large-payload requests.
4. Ensure database connection use remains inside the provisioned database tier's limits as API replicas scale.
5. Provide a repeatable, safe load-test process and clear go/no-go criteria.

### Non-goals

- Claim a specific concurrent-user limit before tests pass on production-like infrastructure.
- Run stress tests against the live production database without approval and a scheduled test window.
- Add caching or background queues without measuring the targeted bottleneck and defining invalidation/retry behavior.

## Proposed performance objectives

Confirm these values with the product owner and hosting provider before using them as release gates:

- **Dataset:** 10,000 members, plus realistic chapter distribution, payments, tickets, messages, gallery metadata, and historical records.
- **Load profile:** include ordinary browsing, logins, dashboard reads, form submissions, and a smaller admin workload; include user think time and realistic request mix.
- **Availability during the test:** at least 99.5% successful non-rate-limited test requests, excluding intentionally rejected rate-limited requests.
- **Latency starting objectives:** p95 under 1 second for ordinary read endpoints and under 2 seconds for writes; p99 under 3 seconds, excluding external payment-provider and email latency.
- **Stability:** no sustained memory growth, connection-pool exhaustion, elevated event-loop lag, repeated 5xx responses, or database saturation.

These are proposed starting objectives, not measured current performance. If the agreed deployment cannot meet them, document the measured limit and the infrastructure or code changes needed.

## Phased implementation

### Phase 0 — Define the capacity target and establish a baseline

**Work**

- Confirm whether the goal means 10,000 registered accounts, 10,000 active sessions, or a particular peak request rate.
- Record production topology: frontend/API hosting, API replica count, Neon plan and connection limits, storage, Redis availability, and regional placement.
- Define a representative request mix and expected busy-hour peak, including login bursts and registration campaigns.
- Capture baseline p50/p95/p99 latency, request rate, 4xx/5xx rate, CPU, memory, event-loop lag, database connections, slow queries, and external-service latency.

**Acceptance**

- A reviewed traffic profile, SLO, test environment, monitoring dashboard, and test-data plan are recorded.
- The baseline can be reproduced without accessing or modifying production member data.

**Dependencies:** product/operations decisions and access to a production-like deployment.

### Phase 1 — Protect the request path and bound input cost

**Work**

- Add distributed rate limits for login, admin login, registration, refresh, validation, contact, and other public write endpoints. Use Redis or a gateway-level limiter for multi-replica deployments; define clear behavior when the limiter store is unavailable.
- Add endpoint-specific payload limits instead of relying only on the global 10 MB JSON limit.
- Validate base64 content type, encoded size, decoded size, and allowed file types; reject malformed and oversized uploads before database writes.
- Move image/document uploads to direct, short-lived signed object-storage uploads where feasible, keeping application requests small.
- Review DTO string/array limits and use explicit field lengths.
- Verify authorization and chapter scope for new upload flows.

**Acceptance**

- Limits are tested at boundary values and return explicit 413/429 responses.
- Large or invalid requests do not create database rows or orphaned storage objects.
- Rate limits are consistent across API replicas and do not block normal member activity under the agreed profile.

**Dependencies:** Phase 0; storage ownership and upload UX decisions.

### Phase 2 — Bound database work and make connections predictable

**Work**

- Configure and document Prisma/PostgreSQL pool limits based on the Neon connection budget, API replica count, and any pooler mode. Include headroom for migrations and operations.
- Confirm every list endpoint has bounded page size and a stable order; paginate remaining broadcasts and profile-update requests, and identify any other user-facing unbounded lists.
- Review all read endpoints for unnecessary relation inclusion and large profile/document fields. Fetch details only when needed.
- Inspect representative `EXPLAIN (ANALYZE, BUFFERS)` plans for member lists, dashboards, validation, admin summaries, support, payment, contact, reunion, and gallery queries.
- Add or adjust indexes only when query plans demonstrate a need; ship each change through a migration and observe database index/storage costs.
- Evaluate the validation name search. Prefer exact identifiers/email/phone searches first; decide whether prefix search or PostgreSQL full-text/trigram indexing is needed for name discovery.
- Bound admin broadcast/profile-request reads and add pagination controls to their consuming UI.

**Acceptance**

- No high-traffic list endpoint returns an unlimited result set.
- Query plans for the agreed hot paths use appropriate indexes and remain stable on the 10,000-member dataset.
- Maximum API replica count multiplied by per-instance connection limits remains below the allocated database connection budget with operational headroom.

**Dependencies:** Phase 0; use Phase 1 results for payload and request-shape decisions.

### Phase 3 — Add observability and isolate slow external work

**Work**

- Add request metrics and correlation IDs for route, status, duration, and request size; do not log passwords, tokens, payment secrets, or member document contents.
- Capture database query latency and pool wait metrics, event-loop lag, heap/RSS, CPU, and queue depth.
- Add explicit timeouts and bounded retries for Paystack, object storage, and email integrations; avoid retrying non-idempotent operations without idempotency protection.
- Move suitable non-interactive work (email, image processing, report generation) to BullMQ only after defining retries, dead-letter handling, idempotency, and worker capacity.
- Alert on elevated 5xx rates, database saturation, connection exhaustion, memory growth, and queue backlog.

**Acceptance**

- An operator can identify whether a slow request is caused by application CPU, database wait/query time, or an external dependency.
- Failure of an external service is bounded and returns an explicit, appropriate response instead of tying up request workers indefinitely.

**Dependencies:** Phase 0; queue-based work also depends on operational Redis/worker provisioning.

### Phase 4 — Build and execute repeatable load tests

**Work**

- Add a load-testing tool and scripts in a separate test directory or CI workflow; do not run destructive tests in the normal deployment pipeline.
- Seed synthetic data covering 10,000 members and realistic records for each chapter and feature.
- Test progressively: smoke, baseline, 100 virtual users, 500, 1,000, then agreed higher levels up to the target concurrency. Increase request rate in controlled steps and record actual requests/second; virtual users alone are not a capacity measure.
- Include read-heavy browsing, login/refresh, admin list access, registrations, support writes, and gallery metadata. Keep payment-provider calls mocked or in an approved sandbox.
- Run a soak test at the agreed busy-hour level to detect memory/connection leaks and pool churn.
- Run a separate short stress test to discover the saturation point and verify graceful overload behavior.
- Record test environment, app/DB replica and tier configuration, dataset shape, exact scripts, and results.

**Acceptance**

- All agreed release SLOs pass at the target test profile for the agreed duration.
- No unhandled failures, persistent 5xx spikes, database connection exhaustion, runaway memory, or uncontrolled queue backlog.
- A tested overload threshold and recovery behavior are documented.

**Dependencies:** Phases 0–3; production-like isolated environment and explicit approval for any shared database.

### Phase 5 — Production rollout and capacity review

**Work**

- Deploy limits and database changes behind normal release controls, then ramp traffic gradually.
- Compare production metrics to the load-test baseline and keep a rollback path for application configuration and code.
- Re-test after material changes to Neon tier, API instance count, regions, database schema, upload strategy, or traffic mix.
- Schedule periodic capacity tests and re-evaluate SLOs as active-member usage grows.

**Acceptance**

- Production metrics remain within agreed SLOs through rollout and a representative busy period.
- On-call owners, dashboards, alerts, rollback steps, and the measured capacity limit are documented.

**Dependencies:** all previous phases and an approved deployment window.

## Rollout safeguards

- Use synthetic accounts and files for tests; avoid exporting personal data into test tools.
- Run load and stress tests only against an isolated environment or an explicitly approved test window.
- Keep database migrations additive where possible and test them against a copy of representative data.
- Introduce rate limits conservatively, monitor legitimate rejection rates, and tune based on observed member behavior.
- Use explicit timeouts and idempotency for any retried writes.
- Do not advertise a concurrency guarantee until the target profile passes on the intended deployment tiers.

## Suggested execution order

1. Agree on the target traffic profile and SLOs (Phase 0).
2. Add request limits and abuse protection (Phase 1).
3. Bound database work and review query plans (Phase 2).
4. Instrument the system and isolate slow external work (Phase 3).
5. Run staged load, soak, and stress tests (Phase 4).
6. Roll out gradually and verify actual production behavior (Phase 5).

## Final deliverable

At completion, publish a capacity report containing the tested deployment configuration, dataset size, request mix, maximum sustainable requests/second and concurrency, p95/p99 latency, error rate, saturation point, alerts/rollback steps, and any remaining bottlenecks. State the tested limit precisely; do not infer it from registered-user count alone.
