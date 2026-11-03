# 04-Change Playbooks — Troubleshooting & Common Failure Modes

This troubleshooting guide catalogs known failure modes, error codes, database connection issues, and mitigation procedures for the Threadly TypeScript Server.

---

## 1. Database & Persistence Failures

### A. MySQL `PROTOCOL_CONNECTION_LOST` or `ETIMEDOUT`
- **Symptom**: Server responds with HTTP 500 on all routes after being idle for several hours.
- **Root Cause**: The remote cloud MySQL instance (e.g., Render, Railway, AWS RDS) closed the idle TCP socket due to `wait_timeout`.
- **Mitigation / Fix**:
  Configure connection pool keep-alive in `src/db/connection.ts`:
  ```typescript
  const connection = mysql.createPool({
      host: getDbHost(),
      user: getDbUser(),
      password: getDbPassword(),
      database: getDbName(),
      port: getDbPort(),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000 // Send TCP keepalive every 10s
  });
  ```

### B. MySQL `ER_CON_COUNT_ERROR` (Too Many Connections)
- **Symptom**: Server logs `Error: Too many connections`.
- **Root Cause**: A rogue repository method opened standalone connections (`createConnection`) instead of acquiring and releasing pool connections.
- **Mitigation**:
  Always use `fetchDb()` in `src/utils/dbQueryHelper.ts`, which automatically manages connection reuse.

---

## 2. Real-Time Socket.IO Issues

### A. Unhandled Async Rejections Crashing Node Process
- **Symptom**: The entire Node.js server crashes and restarts when a user dispatches a socket message.
- **Root Cause**: An async error inside `socket.on("CToS", async ...)` or database write threw an uncaught promise rejection.
- **Mitigation / Fix**:
  Every asynchronous Socket.IO event handler must wrap its execution in a `try/catch` block:
  ```typescript
  socket.on("CToS", async (data: any) => {
      try {
          // Message processing & DB write
      } catch (error) {
          logger.error(formErrorBody(error as string, 500, "socket:CToS"));
      }
  });
  ```

### B. Memory Leak in `ConnectedUsers.ts`
- **Symptom**: Node process memory steadily climbs over days until hitting OOM (Out Of Memory).
- **Root Cause**: Sockets disconnecting abruptly without triggering `removeUser(socket.id)`, leaving stale UUID mappings in memory.
- **Mitigation**:
  Ensure `socket.on("disconnect")` calls `removeUser(socket.id)`:
  ```typescript
  socket.on("disconnect", () => {
      removeUser(socket.id);
  });
  ```

---

## 3. Third-Party API Integration Errors

### A. FCM `messaging/registration-token-not-registered`
- **Symptom**: `fcmService` logs `Requested entity was not found` or `registration-token-not-registered`.
- **Root Cause**: The user uninstalled the Android app, cleared app data, or the FCM token rotated.
- **Mitigation**:
  When `admin.messaging().send()` catches `messaging/registration-token-not-registered`, immediately nullify `fcmToken` in the `users` table to prevent future failed dispatch attempts.

### B. Cloudinary Upload Timeout (`ETIMEDOUT` / `499`)
- **Symptom**: Video reel uploads hang or fail with HTTP 500.
- **Root Cause**: Large video files exceed standard network timeout when streaming from server to Cloudinary.
- **Mitigation**:
  In `src/services/cloudinary.ts`, pass `resource_type: "auto"` and configure `timeout: 120000` (120 seconds).

---

## 4. TypeScript & ESM Compilation Errors

### A. `TS2307: Cannot find module './xyz.js' or its corresponding type declarations`
- **Symptom**: `npm run build` fails with missing module errors.
- **Root Cause**: In NodeNext ES Modules, relative imports must explicitly include the `.js` extension even when importing a `.ts` file:
  ```typescript
  // INCORRECT (Breaks in ESM NodeNext):
  import auth from "./middlewares/authorization";

  // CORRECT:
  import auth from "./middlewares/authorization.js";
  ```
