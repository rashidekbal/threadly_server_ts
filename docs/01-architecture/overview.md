# 01-Architecture — System Overview & Technology Stack

## 1. Product Vision & Backend Goals

The **Threadly TypeScript Backend (`threadly_server_ts`)** is the centralized API gateway, real-time message exchange, and persistence engine for the Threadly ecosystem. It serves native mobile clients (Android), web client interfaces, and dedicated administrative moderation panels.

### Core Architectural Goals
- **High-Throughput Real-Time Messaging**: Handle thousands of concurrent WebSocket connections via Socket.IO, maintaining sub-50ms message forwarding between active peers.
- **Relational Integrity & Complex Social Graph**: Model bidirectional user relationships (follows, mutuals, private approvals), hierarchical comment trees, dynamic like metrics, and 24-hour ephemeral stories on MySQL.
- **Asynchronous Media Offloading**: Process image and video uploads through Cloudinary, maintaining local temporary staging (`multer`) while streaming bytes to cloud CDNs.
- **Zero Message Loss Guarantee**: Seamlessly bridge online socket delivery with background FCM push notifications when recipient devices are asleep or disconnected.
- **Comprehensive Administrative Telemetry**: Expose dedicated moderation APIs (`/api/admin/v1/*`) to inspect system anomalies, audit user reports, track platform analytics, and enact account restrictions.

---

## 2. System Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Client Layer                                  │
│   Native Android Client (Java/Kotlin)   │   Admin Portal (React/Vite)  │
└───────────────────▲────────────────────────────────▲───────────────────┘
                    │                                │
            WSS / HTTPS                      HTTPS (Admin JWT)
                    │                                │
┌───────────────────▼────────────────────────────────▼───────────────────┐
│              Threadly TypeScript Backend (Express 5 + Socket.IO 4)    │
│                                                                        │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │ Express 5 HTTP Gateway                                       │     │
│   │   ├── Public APIs: /api/auth, /api/posts, /api/messages...  │     │
│   │   └── Admin APIs:  /api/admin/v1/users, /api/admin/stats...  │     │
│   └──────────────────────────────────────────────────────────────┘     │
│                                                                        │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │ Socket.IO 4 Realtime Gateway                                 │     │
│   │   ├── In-Memory User Registry (ConnectedUsers.ts)            │     │
│   │   └── Event Multiplexing (CToS, StoC, Delivery Acks)         │     │
│   └──────────────────────────────────────────────────────────────┘     │
│                                                                        │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │ Domain Service & Repository Layer                            │     │
│   │   ├── AuthService, PostService, MessageService, UserService  │     │
│   │   └── Raw Parameterized SQL Queries (fetchDb / MySQL2)       │     │
│   └──────────────────────────────────────────────────────────────┘     │
└───────────────┬──────────────────────┬──────────────────────┬──────────┘
                │                      │                      │
        mysql2 Connection Pool     ioredis Socket          HTTPS REST
                │                      │                      │
┌───────────────▼────────┐  ┌──────────▼──────────┐  ┌────────▼──────────┐
│ MySQL Database         │  │ Redis Cache         │  │ Cloudinary CDN    │
│ (Relational Storage)   │  │ (Session / Cache)   │  │ (Media Storage)   │
└────────────────────────┘  └─────────────────────┘  └───────────────────┘
```

---

## 3. Technology Stack & Key Dependencies

| Component / Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Runtime Environment** | Node.js | `>=20.x` | Modern ECMAScript runtime with native test runner (`node --test`). |
| **Language & Transpiler** | TypeScript | `^5.9.3` | Type safety, ES module resolution (`NodeNext`), compiled to `dist/`. |
| **Web Framework** | Express.js | `^5.2.1` | HTTP routing, middleware pipelining, JSON parsing, error boundaries. |
| **Real-Time Engine** | Socket.IO | `^4.8.3` | WebSocket and long-polling real-time transport with room management. |
| **Database Driver** | MySQL2 | `^3.22.2` | High-performance MySQL client supporting connection pools and prepared statements. |
| **In-Memory Cache** | ioredis | `^5.10.1` | Redis client for OTP verification caching and session state. |
| **Media Pipeline** | Multer & Cloudinary | `multer@2.1.1`, `cloudinary@2.9.0` | Temporary file handling and cloud storage for images/reels. |
| **Push Notifications** | Firebase Admin SDK | `^13.8.0` | Google Cloud FCM dispatcher for background message push. |
| **Security & Auth** | JSON Web Tokens & Bcrypt | `jsonwebtoken@9.0.3`, `bcrypt@6.0.0` | Secure password hashing (salt rounds: 10) and stateless JWT auth. |
| **Structured Logging** | Pino | `^10.3.1` | Ultra-fast structured JSON logging for request tracing and anomalies. |

---

## 4. Operational Constraints & Hosting Environment

- **ES Modules (ESM)**: The project is configured with `"type": "module"`. All relative imports must end with `.js` extension (e.g. `import server from "./app.js";`), conforming to modern Node.js standards.
- **Execution Port**: Defaults to port `8001` or read dynamically from `process.env.PORT` via `getPort()` in `src/utils/envValuesAccessInterface.ts`.
- **Database Connection Pool**: Configured with automatic reconnection and query timeouts in `src/db/connection.ts`.
- **Cloud Hosting**: Containerized via multi-stage `Dockerfile` and configured for zero-downtime deployment on Render (`render.yaml`).
