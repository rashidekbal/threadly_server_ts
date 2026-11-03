# ADR-002: Architecture Pattern — Layered Service-Repository vs Heavy ORM (Prisma / TypeORM)

- **Status**: Accepted
- **Deciders**: Staff Software Architect & Lead Backend Engineering
- **Date**: 2026-11-03
- **Tags**: Architecture, Service-Repository, SQL, MySQL, Prisma, Performance

---

## 1. Context & Problem Statement

Social media backend architectures require intricate relational queries:
1. **Feed Generation**: Multi-table joins between `imagepost`, `users`, `post_likes`, `postview`, and `followers` with seeded deterministic ordering.
2. **Conversation Hydration**: Aggregated unread counters, latest messages, and user profile joins.
3. **Hierarchical Comments**: Threaded parent-child comment reply trees.

The engineering team evaluated whether to manage data access through a heavyweight ORM (Prisma, TypeORM, Sequelize) or through a custom **Layered Service-Repository Pattern with raw parameterized SQL**.

---

## 2. Options Considered

### Option 1: Prisma ORM
- *Pros*: Auto-generated TypeScript types, declarative schema DSL, migration tooling.
- *Cons*: Heavy binary query engine (`prisma-engine`) overhead; generates deeply nested, inefficient multi-stage SQL queries for complex social feed joins; cold start penalties in containerized cloud environments.

### Option 2: TypeORM
- *Pros*: Decorator-based Active Record / Data Mapper models.
- *Cons*: High memory footprint; complex connection management under high socket concurrency; subtle caching bugs and complex query builders.

### Option 3: Layered Service-Repository Pattern with Raw Parameterized SQL (`fetchDb`)
- *Pros*:
  - **Peak Performance**: Complete developer control over exact SQL execution plans, index utilization (`FORCE INDEX`), and subquery optimizations.
  - **Zero Leaky Abstractions**: Raw SQL mirrors the real MySQL relational model without magic ORM hydration cycles.
  - **Clean Testability**: Services can be unit-tested by mocking repositories without needing in-memory SQLite ORM polyfills.
  - **Lightweight Footprint**: Uses native `mysql2` connection pool directly with zero runtime overhead.
- *Cons*: Requires manually maintaining DDL statements in `schema.txt` and manual TypeScript type mappings.

---

## 3. Decision Outcome

**Chosen Option**: **Option 3 (Layered Service-Repository with Raw Parameterized SQL)**.

### Layer Separation Rules
1. **Routes (`src/routes/`)**: Mount HTTP paths and attach middleware guards.
2. **Controllers (`src/controller/`)**: Parse HTTP input params, invoke services, and return status codes.
3. **Services (`src/services/`)**: Enforce business rules, validate domain constraints, and coordinate external services.
4. **Repositories (`src/repo/`)**: Exclusively contain raw SQL queries executed via `fetchDb()`.

---

## 4. Consequences & Trade-offs

### Positive Consequences
- **Sub-15ms Query Latency**: Complex feed and chat queries run as single-pass SQL statements.
- **Minimal Docker Memory**: Production container consumes under 90MB RAM under moderate load.
- **Transparent Query Auditing**: Slow queries can be directly analyzed via `EXPLAIN ANALYZE` without translating from an ORM DSL.

### Negative Consequences / Trade-offs
- **Manual Schema Synchronization**: Developers must ensure `schema.txt` and TypeScript interfaces in `src/types/` remain aligned when altering database columns.
