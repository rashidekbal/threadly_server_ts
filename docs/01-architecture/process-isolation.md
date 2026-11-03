# 01-Architecture — Process Isolation, Security & Privilege Model

This document specifies the security boundaries, privilege enforcement, authentication models, and data protection mechanisms implemented in the Threadly TypeScript Server.

---

## 1. Runtime Isolation & Execution Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Container Sandbox                 │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Node.js 20+ Runtime Process (PID 1)                   │  │
│  │   ├── V8 Event Loop (Non-blocking I/O)                │  │
│  │   ├── Express HTTP Server (Port 8001)                 │  │
│  │   ├── Socket.IO WSS Engine                            │  │
│  │   └── libuv ThreadPool (Bcrypt & DNS Resolution)      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Temporary Local Scratch Partition:                    │  │
│  │   /app/src/public/temp/ (Multer file staging)         │  │
│  │   - Short-lived buffer files deleted after Cloudinary │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Process Environment Guarantees
- **Non-Root Execution**: In production container environments, Node.js runs under a dedicated unprivileged user (`node`), preventing root privilege escalation in the event of arbitrary code execution vulnerabilities.
- **Ephemeral Media Staging**: Image and video uploads intercepted by `multer` are stored in `src/public/temp/`. Once `cloudinary.uploader.upload()` finishes or fails, the temporary file is unlinked immediately via `fs.unlinkSync()`.

---

## 2. Three-Tier Privilege Architecture

The server establishes three distinct privilege domains across its API routes:

| Tier | Access Level | Middleware Guard | Typical Endpoints |
| :--- | :--- | :--- | :--- |
| **Tier 0** | **Public (Unauthenticated)** | None | `/api/auth/login/*`, `/api/otp/*`, `/api/ForgetPassword/*` |
| **Tier 1** | **Authenticated Client** | `authorization.ts` | `/api/posts/*`, `/api/messages/*`, `/api/profile/*` |
| **Tier 2** | **Administrative Portal** | `adminAuthTokenValidator.ts` | `/api/admin/v1/*` |

### A. Authenticated Client Guard (`authorization.ts`)
Validates the client's Bearer JWT:
```typescript
const authHeader = req.headers.authorization;
if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ status: "error", message: "Unauthorized access" });
}
const token = authHeader.split(" ")[1];
const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
req.user = { userid: decoded.userid, uuid: decoded.uuid };
```
If the token is expired, tampered with, or malformed, the middleware returns HTTP 401 Unauthorized, triggering the mobile client's automatic session purge.

### B. Administrative Privilege Guard (`adminAuthTokenValidator.ts`)
Guards all `/api/admin/v1/*` routes:
- Verifies a dedicated administrative secret key (`ADMIN_JWT_SECRET`).
- Verifies the user record possesses active administrative privileges in `adminRepo.ts`.
- Blocks non-admin users from accessing system analytics, user ban toggles, or anomaly logs.

---

## 3. Cryptography & Credential Protection

### A. Password Hashing (`src/utils/bcryptUtil.ts`)
- Passwords submitted during registration or reset are never stored in plaintext.
- Passwords are hashed using **Bcrypt with a salt factor of 10**:
  ```typescript
  export async function hashPassword(plainText: string): Promise<string> {
      return await bcrypt.hash(plainText, 10);
  }
  export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
      return await bcrypt.compare(plainText, hash);
  }
  ```

### B. SQL Injection Immunity (`src/utils/dbQueryHelper.ts`)
- Raw string interpolation into SQL queries is strictly prohibited across all repositories.
- All database operations flow through `fetchDb()` utilizing MySQL2 prepared statements:
  ```typescript
  export default function fetchDb(query: string, values: any[] = []): Promise<any> {
      return new Promise((resolve, reject) => {
          connection.query(query, values, (err, results) => {
              if (err) return reject(err);
              resolve(results);
          });
      });
  }
  ```

---

## 4. Input Sanitization & Attack Mitigation

- **Body Size Limitation**: Request body parser enforces a strict `16kb` payload limit (`app.use(express.json({ limit: "16kb" }))`), preventing memory exhaustion denial-of-service (DoS) attacks.
- **Regular Expression Guarding (`src/utils/regex.ts`)**:
  - `emailRegex`: Validates RFC 5322 email formatting.
  - `phoneRegex`: Enforces strict 10-digit numerical mobile structure.
  - `usernameRegex`: Rejects illegal characters and SQL punctuation in user handles.
- **Error Sanitization & Anomaly Logging**:
  - Production error responses strip internal database stack traces and return generic error envelopes (`{ "status": "error", "message": "..." }`).
  - Critical runtime exceptions are recorded into MySQL table `system_anomalies` via `src/repo/anomalyRepo.ts` with severity tags (`low`, `medium`, `high`, `critical`) for admin audit.
