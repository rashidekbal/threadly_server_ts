# ADR-001: Core Backend Engine & Transport Choice (Express 5, Socket.IO 4 & MySQL2)

- **Status**: Accepted
- **Deciders**: Staff Software Architect & Lead Backend Engineering
- **Date**: 2026-11-03
- **Tags**: Node.js, Express, Socket.IO, MySQL2, Realtime

---

## 1. Context & Problem Statement

Threadly required a backend platform capable of satisfying dual workloads:
1. **High-Frequency Real-Time Messaging**: Bidirectional WebSocket sessions with sub-50ms message forwarding, typing status, and delivery acknowledgments.
2. **Relational Social Graph & Rich Feeds**: Complex relational modeling for follows, mutual approval workflows, threaded comments, and feed queries.
3. **Rapid Developer Velocity & TypeScript Migration**: Transitioning from a legacy untyped JavaScript prototype to an enterprise-grade type-safe codebase.

---

## 2. Options Considered

### Option 1: Go (Golang) Microservices with gRPC & PostgreSQL
- *Pros*: Extreme execution speed, minimal memory usage, strongly typed protobuf contracts.
- *Cons*: High development overhead for rapid social media iteration; requires separate gateway layers for mobile WebSocket/JSON support; split codebase skill requirements.

### Option 2: Python / Django with Channels
- *Pros*: Built-in admin dashboard, mature ORM.
- *Cons*: Python async/await overhead under high WebSocket concurrency; slower JSON serialization compared to Node.js V8; higher memory consumption per active socket connection.

### Option 3: Node.js (TypeScript) + Express 5 + Socket.IO 4 + MySQL2
- *Pros*:
  - **Single Shared Language**: TypeScript across frontend tooling, admin portal, and server interfaces.
  - **V8 Asynchronous I/O**: Excellent concurrency characteristics for I/O-heavy social platforms and socket pools.
  - **Socket.IO Ecosystem**: Production-tested WebSocket transport with automatic fallback to HTTP Long-Polling and built-in room clustering.
  - **Relational MySQL Power**: ACID transactional guarantees for follower graphs, unread counters, and message IDs.
- *Cons*: Single-threaded event loop requires disciplined handling to prevent blocking operations.

---

## 3. Decision Outcome

**Chosen Option**: **Option 3 (Node.js + Express 5 + Socket.IO 4 + MySQL2)**.

### Architectural Rationale
- Express 5 provides modern Promise-based routing without unhandled rejection crashes.
- Socket.IO 4 integrates directly into the Node HTTP server instance (`http.createServer(app)`), sharing port 8001 seamlessly.
- MySQL2 connection pooling delivers sub-10ms query execution with prepared statements.

---

## 4. Consequences & Trade-offs

### Positive Consequences
- Sub-50ms message exchange between mobile peers.
- Smooth transition from legacy JavaScript codebase to strict TypeScript type safety.
- Low cloud hosting footprint on Render.

### Negative Consequences / Trade-offs
- CPU-intensive tasks (e.g. video transcoding) cannot be performed in-process and must be offloaded to Cloudinary.
- Event loop blockage risk: developers must avoid synchronous file operations or long regex evaluations.
