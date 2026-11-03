# Threadly Server (TypeScript)

A fully typed, layered-architecture REST API server for the **Threadly** social media platform. Migrated from JavaScript to TypeScript with strict Controller → Service → Repository separation.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **TypeScript** | Language (strict mode) |
| **Express 5** | HTTP framework |
| **Socket.IO** | Real-time messaging |
| **MySQL 2** | Primary database |
| **Redis (ioredis)** | Session caching |
| **Cloudinary** | Media storage (images/videos) |
| **Firebase Admin** | Push notifications (FCM) |
| **JWT** | Authentication |
| **bcrypt** | Password hashing |
| **eazyotp** | Email OTP verification |
| **Pino** | Structured logging |
| **Multer** | File upload handling |

## 📚 Engineering Documentation

The project includes an end-to-end, industry-grade **Docs-as-Code** documentation suite designed for AI-assisted pair programming and architectural governance:

- **[Documentation Hub (`docs/README.md`)](docs/README.md)** — Architecture index and navigation hub.
- **[Exhaustive Codebase Inventory (`docs/CODEBASE_INDEX.md`)](docs/CODEBASE_INDEX.md)** — File-by-file catalog of all 119 source modules.
- **01. System Architecture**:
  - [System Overview & Tech Stack](docs/01-architecture/overview.md)
  - [Component Architecture & Layering](docs/01-architecture/component-architecture.md)
  - [Process Isolation & Security Model](docs/01-architecture/process-isolation.md)
  - [Server Data Flows & Sequence Diagrams](docs/01-architecture/data-flows.md)
- **02. Contracts & Protocols**:
  - [REST & Admin API Contracts](docs/02-contracts-and-apis/api-contracts.md)
  - [Realtime Socket.IO & Push Protocol](docs/02-contracts-and-apis/realtime-protocol.md)
  - [Persistence, MySQL Schemas & Storage](docs/02-contracts-and-apis/persistence-and-storage.md)
- **03. Developer Playbooks**:
  - [Local Setup & Environment](docs/03-developer-playbook/local-setup.md)
  - [Debugging, Diagnostics & Testing](docs/03-developer-playbook/debugging-and-inspection.md)
  - [Build, Packaging & Cloud Deployment](docs/03-developer-playbook/build-and-packaging.md)
- **04. Change Playbooks**:
  - [How-To Add a Feature Recipes](docs/04-change-playbooks/how-to-add-a-feature.md)
  - [Troubleshooting & Common Failure Modes](docs/04-change-playbooks/troubleshooting.md)
- **05. Architecture Decision Records (ADRs)**:
  - [ADR-001: Core Realtime Engine & Transport Choice](docs/05-adrs/ADR-001-core-engine-choice.md)
  - [ADR-002: Layered Service-Repository Pattern vs Heavy ORMs](docs/05-adrs/ADR-002-state-and-framework.md)

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MySQL** database
- **Redis** instance
- **Cloudinary** account
- **Firebase** project (for FCM)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
PRODUCTION=false

# Database
DB_URL=mysql://user:password@host:3306/threadly

# Authentication
SECRET_KEY=your_jwt_secret

# Redis
RedisUrl=redis://localhost:6379

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET_KEY=your_secret_key

# Firebase (base64 encoded service account JSON)
FIREBASE_ADMIN=base64_encoded_firebase_admin_json

# OTP Service
EAZY_OTP_API_KEY=your_eazyotp_api_key

# Admin Panel
ADMIN_EMAIL=admin@threadly.com
ADMIN_PASSWORD=your_admin_password
```

> All environment variables are accessed through `src/utils/envValuesAccessInterface.ts` — never directly via `process.env` in application code.

### Running

```bash
# Development (hot reload via nodemon + tsx)
npm run dev

# Production build
npm run build

# Start production
npm start
```

## Architecture

The server follows a strict **Controller → Service → Repository** layered pattern:

```
Request → Route → Middleware → Controller → Service → Repository → Database
```

```
src/
├── app.ts                    # Express app, Socket.IO, route registration
├── server.ts                 # Entry point, DB connection, server start
│
├── routes/                   # Route definitions (HTTP verb + path → controller)
│   ├── admin/                # Admin panel routes
│   ├── auth.route.ts
│   ├── post.route.ts
│   ├── like.route.ts
│   ├── comment.route.ts
│   ├── follow.route.ts
│   ├── story.route.ts
│   ├── message.route.ts
│   ├── profile.route.ts
│   ├── search.route.ts
│   ├── user.route.ts
│   ├── privacy.route.ts
│   ├── fcm.route.ts
│   ├── otp.route.ts
│   └── forgetPassword.route.ts
│
├── controller/               # Request handling, validation, error mapping
│   ├── admin/
│   ├── auth.controller.ts
│   ├── post.controller.ts
│   ├── like.controller.ts
│   ├── comment.controller.ts
│   ├── follow.controller.ts
│   ├── story.controller.ts
│   ├── message.controller.ts
│   ├── profile.controller.ts
│   ├── search.controller.ts
│   ├── user.controller.ts
│   ├── privacy.controller.ts
│   ├── fcm.controller.ts
│   ├── otp.controller.ts
│   ├── forgetPassword.controller.ts
│   ├── postStats.controller.ts
│   └── postShare.controller.ts
│
├── services/                 # Business logic layer
│   ├── index.service.ts      # Dependency injection registry
│   ├── authService.ts
│   ├── postService.ts
│   ├── likeService.ts
│   ├── commentService.ts
│   ├── followService.ts
│   ├── storyService.ts
│   ├── messageService.ts
│   ├── profileService.ts
│   ├── searchService.ts
│   ├── postStatsService.ts
│   ├── postShareService.ts
│   ├── forgetPasswordService.ts
│   ├── UserServices.ts
│   ├── PrivacyService.ts
│   ├── AdminService.ts
│   ├── fcmService.ts
│   └── cloudinary.ts
│
├── repo/                     # Data access layer (SQL queries)
│   ├── userRepo.ts
│   ├── postRepo.ts
│   ├── likeRepo.ts
│   ├── commentRepo.ts
│   ├── followRepo.ts
│   ├── storyRepo.ts
│   ├── messageRepo.ts
│   ├── searchRepo.ts
│   ├── postStatsRepo.ts
│   ├── postShareRepo.ts
│   └── adminRepo.ts
│
├── middlewares/               # Express middlewares
│   ├── authorization.ts            # JWT verification
│   ├── accessCheckLayer.ts         # Account privacy check
│   ├── checkFollowExistance.ts     # Duplicate follow prevention
│   ├── multer.ts                   # File upload (RAM / disk)
│   ├── userExistanceCheck.ts       # Signup duplicate check
│   ├── userExistanceCheckForgetPassword.ts
│   ├── verifySignedOtpToken.ts
│   ├── adminAuthTokenValidator.ts
│   └── adminAccessCheck.middleware.ts
│
├── socketHandlers/            # Socket.IO event handlers
│   ├── SocketMainHandler.ts
│   └── ConnectedUsers.ts
│
├── constants/                 # Enums, error classes, response wrappers
│   ├── apiError.ts
│   ├── errorDetails.ts
│   ├── apiErrorTypesEnum.ts
│   ├── Response.ts
│   ├── serviceError.ts
│   └── ...
│
├── types/                     # TypeScript type definitions
├── db/                        # Database connection
├── redis/                     # Redis client + operations
└── utils/                     # Shared utilities
    ├── envValuesAccessInterface.ts  # Centralized env var access
    ├── pino.ts                      # Logger setup
    ├── dbQueryHelper.ts             # Promisified MySQL query wrapper
    ├── regex.ts                     # Validation patterns
    └── adminTokenAuthenticator.ts
```

## Layer Responsibilities

### Controller
- Extracts and validates request parameters
- Calls the appropriate service method
- Catches errors and returns standardized `ApiError` / `Response` objects
- **Never** accesses the database directly

### Service
- Contains business logic (e.g., Cloudinary uploads, JWT generation, FCM notifications)
- Receives repository instances via constructor injection
- Orchestrates multiple repository calls when needed
- Registered in `index.service.ts`

### Repository
- Executes SQL queries via `fetchDb` (promisified `mysql2` wrapper)
- One repo per domain (posts, likes, comments, etc.)
- Returns raw database results

## API Routes

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/posts/addImagePost` | Upload image post |
| POST | `/api/posts/addVideoPost` | Upload video post |
| DELETE | `/api/posts/removePost/:postid` | Delete a post |
| GET | `/api/posts/getImagePostsFeed` | Image feed |
| GET | `/api/posts/getVideoPostsFeed` | Video/reels feed |
| GET | `/api/posts/getUserPosts/:userid` | User's posts |
| GET | `/api/posts/getPost/:postid` | Single post info |
| POST | `/api/posts/postViewed/:postid` | Record post view |
| GET | `/api/posts/:postid/likedby` | Users who liked |
| GET | `/api/posts/:postid/sharedby` | Users who shared |
| POST | `/api/posts/share` | Share a post |

### Likes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/like/likePost/:postid` | Like post |
| DELETE | `/api/like/unlikePost/:postid` | Unlike post |
| POST | `/api/like/likeComment/:commentid` | Like comment |
| DELETE | `/api/like/unlikeComment/:commentid` | Unlike comment |
| POST | `/api/like/likeStory/:storyid` | Like story |
| DELETE | `/api/like/unlikeStory/:storyid` | Unlike story |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/comment/addComment` | Add comment |
| DELETE | `/api/comment/removeComment` | Remove comment |
| GET | `/api/comment/getComments/:postid` | Get comments |
| POST | `/api/comment/replyToComment/:commentId` | Reply to comment |
| GET | `/api/comment/getReplies/:commentId` | Get replies |

### Follow
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/follow/follow` | Follow user |
| POST | `/api/follow/follow/V2` | Follow (privacy-aware) |
| POST | `/api/follow/unfollow` | Unfollow user |
| POST | `/api/follow/cancelFollowRequest` | Cancel pending request |
| POST | `/api/follow/acceptFollowRequest` | Accept follow request |
| DELETE | `/api/follow/rejectFollowRequest/:followerId` | Reject request |
| GET | `/api/follow/getFollowers/:userid` | Get followers |
| GET | `/api/follow/getFollowings/:userid` | Get following |
| GET | `/api/follow/getAllFollowRequests` | Pending requests |

### Stories
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/story/addStory` | Add story |
| DELETE | `/api/story/removeStory/:storyid` | Remove story |
| GET | `/api/story/getStories` | All stories feed |
| GET | `/api/story/getMyStories` | Own stories |
| GET | `/api/story/getStories/:userid` | User's stories |
| POST | `/api/story/storyViewed/:storyid` | Record view |
| GET | `/api/story/:storyid/viewedby` | Story viewers |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/checkPendingMessages` | Pending history |
| POST | `/api/messages/getPendingMessages` | Get pending msgs |
| POST | `/api/messages/sendMessage` | Send message |
| POST | `/api/messages/updateMessageDeliveryStatus` | Mark as seen |
| POST | `/api/messages/uploadMedia` | Upload media |
| GET | `/api/messages/getAllChats` | All conversations |
| PATCH | `/api/messages/deleteMessageForMe` | Delete for self |
| PATCH | `/api/messages/unSendMessage` | Unsend message |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/api/profile/edit/username` | Edit display name |
| PATCH | `/api/profile/edit/userid` | Change user ID |
| PATCH | `/api/profile/edit/bio` | Edit bio |
| POST | `/api/profile/edit/Profile` | Change profile pic |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search?target=` | Search accounts & reels |
| POST | `/api/fcm/updateToken` | Update FCM token |
| PATCH | `/api/privacy/updateAccountStatus` | Toggle private account |
| POST | `/api/ForgetPassword/resetPasswordEmail` | Reset via email |
| POST | `/api/otp/generateOtpEmail` | Send email OTP |
| POST | `/api/otp/verifyOtpEmail` | Verify email OTP |

## Error Handling

All API errors follow a consistent format:

```json
{
  "status": 500,
  "error_type": "API_ERROR",
  "error": {
    "message": "description or null"
  }
}
```

Successful responses:

```json
{
  "status": 200,
  "data": { }
}
```

## Dependency Injection

All services are instantiated in `src/services/index.service.ts` with their repository dependencies:

```typescript
const postService = new PostService(new PostRepo());
const likeService = new LikeService(new LikeRepo());
// ... etc

export { postService, likeService, ... }
```

Controllers import services from this single registry:

```typescript
import { postService } from "../services/index.service.js";
```

## Environment Variable Access

All environment variables are accessed through typed getter functions in `src/utils/envValuesAccessInterface.ts`:

```typescript
import { isProductionMode, getJWT_secretToken } from "../utils/envValuesAccessInterface.js";
```

**No file in the codebase accesses `process.env` directly** except `envValuesAccessInterface.ts`.

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Development server with hot reload |
| `build` | `npm run build` | Compile TypeScript to `dist/` |
| `start` | `npm start` | Run compiled production build |
| `prod` | `npm run prod` | Production with nodemon |
| `test` | `npm test` | Run tests |

## License

ISC

## Author

Rasid Ekbal