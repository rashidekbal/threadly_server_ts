# 01-Architecture — Component Architecture & Layered Design

## 1. Architectural Pattern: Layered Service-Repository

The Threadly TypeScript Backend follows a strict **Layered Architecture** adhering to the **Single Responsibility Principle**. Every incoming request flows through dedicated tiers:

```
[ Inbound HTTP Request / WebSocket Event ]
                  │
                  ▼
┌────────────────────────────────────────────────────────┐
│ 1. Routing & Middleware Layer                          │
│    - Route definitions (routes/*.ts, routes/admin/*.ts)│
│    - Auth guards (authorization.ts, adminAuth.ts)      │
│    - File upload handling (multer.ts)                  │
└─────────────────┬──────────────────────────────────────┘
                  │ Validated Request Context
                  ▼
┌────────────────────────────────────────────────────────┐
│ 2. Controller Layer                                    │
│    - Request input parsing & parameter extraction      │
│    - Invokes domain service methods                    │
│    - Formats Response body and HTTP status codes       │
└─────────────────┬──────────────────────────────────────┘
                  │ Domain Command / Query
                  ▼
┌────────────────────────────────────────────────────────┐
│ 3. Service Layer (Business Logic)                      │
│    - Core business rules, validation, hash computation │
│    - Coordinates Repositories, Redis, Cloudinary & FCM │
│    - Emits structured anomalies on error               │
└─────────────────┬──────────────────────────────────────┘
                  │ Raw Data Requests
                  ▼
┌────────────────────────────────────────────────────────┐
│ 4. Repository Layer (Data Access)                      │
│    - Parameterized SQL execution via fetchDb()         │
│    - MySQL result mapping to typed records             │
│    - Zero business logic                               │
└────────────────────────────────────────────────────────┘
```

---

## 2. Layer Deep-Dive

### A. Routing & Middleware Layer
- **Routers**: Map URI patterns to controller methods. Public routes reside in `src/routes/*.route.ts`; administrative routes reside in `src/routes/admin/*.route.ts`.
- **Middlewares**:
  - `authorization.ts`: Extracts `Authorization: Bearer <token>`, verifies JWT signature, and attaches authenticated user payload (`req.user = { userid, uuid }`).
  - `adminAuthTokenValidator.ts`: Verifies admin JWT token signature and checks role authorization before granting access to moderation endpoints.
  - `multer.ts`: Intercepts multipart uploads (`image`, `video`) and stages files temporarily in `src/public/temp/`.
  - `userExistanceCheck.ts` & `checkFollowExistance.ts`: Fast database existence guards executed prior to complex transactional logic.

### B. Controller Layer
- Pure request coordinators. Controllers never execute raw SQL statements directly.
- Standard pattern:
  ```typescript
  export async function getPostByIdController(req: Request, res: Response) {
      const postId = Number(req.params.id);
      try {
          const result = await postService.getPostById(postId, req.user.userid);
          return res.status(200).json({ status: "success", data: result });
      } catch (err: any) {
          logger.error(formErrorBody(err.message, 500, req.originalUrl));
          return res.status(500).json({ status: "error", message: err.message });
      }
  }
  ```

### C. Service Layer
- Encapsulates domain logic, external integrations, and orchestrations:
  - `AuthService`: Password hashing via `bcryptUtil.ts`, JWT signing, login authentication.
  - `MessageService`: Message validation, conversation thread collation, unsend routing, and FCM fallback dispatch.
  - `PostService`: Interacts with `Cloudinary` to stream uploaded media, stores post metadata, and manages feed ranking.
  - `FollowService`: Handles public follows vs. private account follow requests (`isApproved: false`).
  - `StoryService`: Ephemeral 24-hour story lifecycles and viewers recording.
  - `AdminService`: Dashboard metrics aggregation, user ban enforcement, anomaly logging.

### D. Repository Layer
- Executes parameterized MySQL queries using `fetchDb()` in `src/utils/dbQueryHelper.ts`.
- Repositories are organized by database domain: `userRepo.ts`, `postRepo.ts`, `commentRepo.ts`, `likeRepo.ts`, `followRepo.ts`, `messageRepo.ts`, `storyRepo.ts`, `searchRepo.ts`, `adminRepo.ts`, `anomalyRepo.ts`.

---

## 3. Real-Time Socket Architecture (`src/socketHandlers/`)

### A. In-Memory Socket Registry (`ConnectedUsers.ts`)
Manages bidirectional mapping between user UUIDs and active Socket.IO connection IDs:
```typescript
const connectedUsers = new Map<string, string>(); // uuid -> socketId
const socketToUser = new Map<string, string>();   // socketId -> uuid
```
- `addUser(uuid, socketId)`: Binds a newly connected socket to the user UUID.
- `removeUser(socketId)`: Cleans up mapping when socket disconnects.
- `getSocketId(uuid)`: Resolves an active socket ID for point-to-point message routing.

### B. Socket Handler Router (`SocketMainHandler.ts`)
Registers all event listeners when a socket connects:
1. `onConnect`: User registers their UUID.
2. `admin_auth`: Admin joins the `"admin_room"` to receive real-time anomaly alerts.
3. `CToS`: Routes chat message to recipient. If recipient is connected, emits `StoC` and emits `MsgStatusUpdate` back to sender. If disconnected, invokes `fcmService.sendMessageNotification()`.
4. `notifyReceivedToSender`: Forwards delivery confirmation to sender.
5. `update_seen_msg_status`: Dispatches read receipts to all relevant chat partners.
6. `postViewed` & `StoryViewed`: Asynchronously updates view count counters in MySQL.

---

## 4. State Models & Domain Lifecycles

### A. Message Delivery State Machine
```
[ 0: Pending ] ──► [ 1: Sent to Server ] ──► [ 2: Delivered to Device ] ──► [ 3: Seen by User ]
```
- Handled in `messageRepo.ts` and `SocketMainHandler.ts`.
- Delivery status transitions are saved in MySQL table `messages` under column `deliveryStatus`.

### B. Account Ban State (`banDuration` & `blocked`)
- Managed in `src/constants/banTypeEnum.ts`:
  - `none`: Normal active user.
  - `24hr`: Temporarily restricted; automatically restored after 24 hours.
  - `permanent`: Account blocked from authentication; `accessCheckLayer.ts` rejects all requests with HTTP 403 `ACCOUNT_RESTRICTION_ERROR`.
