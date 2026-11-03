# 03-Developer Playbook — Debugging, Diagnostics & Testing

This playbook explains how to inspect runtime logs, execute automated test suites, use the bundled Postman collection, set IDE breakpoints, and simulate failure modes in the Threadly TypeScript Server.

---

## 1. Structured Logging with Pino

The server uses **Pino** (`src/utils/pino.ts`) for high-performance structured logging:
- **Console Output**: Formats machine-parsable JSON logs.
- **Log Formatting (`formErrorBody`)**:
  ```typescript
  export function formErrorBody(err: string, code: number | null, path: string | null) {
      return {
          timestamp: new Date().toISOString(),
          error: err,
          statusCode: code,
          path: path
      };
  }
  ```
- **Error Log File**: Uncaught critical exceptions append to `src/public/errorLogs/log.txt`.

### Streaming & Filtering Logs
```bash
# Pretty-print logs in real-time during local dev
npm run dev | npx pino-pretty

# Filter only error-level logs
npm run dev | npx pino-pretty -m error
```

---

## 2. Automated Test Suites (Node.js Native Test Runner)

The project leverages Node.js 20's native test runner (`node --test` with `--import tsx`) without requiring Jest or Mocha:

### Test Suite Structure
```
test/
├── authService.test.ts          # Authentication business logic & JWT verification
├── bcrypt.test.ts               # Password hashing & comparison tests
├── commentService.test.ts       # Comment insertion, reply threads, and deletions
├── followService.test.ts        # Public follows vs. private account approvals
├── likeService.test.ts          # Like/unlike idempotency
├── messageService.test.ts       # Message validation & chat history ordering
├── postShareService.test.ts     # Post share tracking
├── postStatsService.test.ts     # Impressions & engagement metrics
├── privacyService.test.ts       # Account privacy toggle tests
├── profileService.test.ts       # Profile editing validation
├── regex.test.ts                # Email, phone, and username regex matching
├── searchService.test.ts        # User handle prefix search tests
├── userService.test.ts          # User existence and metrics queries
├── helpers/testServer.ts        # Mock server setup for HTTP endpoint tests
└── integration/
    └── integration.test.ts      # End-to-end API pipeline integration tests
```

### Running Tests
```bash
# Execute all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests (with 10-second timeout)
npm run test:integration

# Run a single targeted test file
node --import tsx --test test/authService.test.ts
```

---

## 3. Postman API Collection

The repository includes a comprehensive, pre-configured Postman collection:
- **File**: `Threadly_API.postman_collection.json` (35 KB)
- **Import**: Open Postman -> **Import** -> Select `Threadly_API.postman_collection.json`.
- **Environment Setup**:
  - `baseUrl`: `http://localhost:8001/api`
  - `token`: Automatically extracted from login responses into collection variables.
  - Test scripts pre-assert status codes (`pm.response.to.have.status(200)`).

---

## 4. Setting IDE Breakpoints & Tracing Hot Paths

### A. Real-Time Chat Dispatch Hot Path
- **File**: `src/socketHandlers/SocketMainHandler.ts`
- **Line 21**: `socket.on("CToS", async (data: any) => { ... })`
- **Inspect**:
  - `data.receiverUuid`
  - `getSocketId(data.receiverUuid)` (Evaluates whether recipient is currently online)
  - Execution branch: Online `StoC` vs. Offline `fcmService.sendMessageNotification()`.

### B. JWT Authorization Middleware Hot Path
- **File**: `src/middlewares/authorization.ts`
- **Line 10**: Verify token extraction from `req.headers.authorization`.
- **Inspect**: `decoded` payload attaching `req.user = { userid, uuid }`.

---

## 5. Simulating Production Failure Modes

### A. Simulating Database Connection Pool Exhaustion
1. Edit `src/db/connection.ts` and set `connectionLimit: 1`.
2. Fire 10 concurrent requests to `/api/posts/getImagePostsFeedV2/`.
3. **Verify**: Subsequent requests queue or return structured 500 error envelopes without crashing the Node.js process.

### B. Simulating Redis Offline Degradation
1. Stop your local Redis server (`redis-cli shutdown` or stop container).
2. Attempt mobile OTP verification.
3. **Verify**: `ioredis` emits error logs to Pino; fallback logic gracefully reports temporary service unavailability.
