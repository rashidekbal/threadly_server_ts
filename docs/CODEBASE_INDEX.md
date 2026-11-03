# Threadly TypeScript Backend — Exhaustive Codebase Index

This document provides an exhaustive, file-by-file inventory of every source module in the Threadly TypeScript Server (`threadly_server_ts`). Total source files cataloged: **119**.

This index serves as the contract-bound architectural inventory for AI pair programmers and human lead architects.

---

## 01. Server Entry & Application Bootstrap (2 files)

| File Path | Exported Symbols | Core Responsibility | Upstream / Downstream Dependencies |
| :--- | :--- | :--- | :--- |
| `src/app.ts` | `socketIo`, `server` | Express application factory; mounts CORS, JSON parsers, public static directory, Socket.IO instance, and all HTTP route modules. | `http`, `cors`, `socket.io`, `express` *(+23 more)* |
| `src/server.ts` | `server` | Server startup entrypoint; connects to MySQL database pool, initializes FCM push worker, and binds HTTP/WebSocket port. | `app`, `connection`, `mysql2`, `index.service` *(+2 more)* |


## 02. Admin HTTP Routes (8 files)

| File Path | Exported Symbols | Core Responsibility | Upstream / Downstream Dependencies |
| :--- | :--- | :--- | :--- |
| `src/routes/admin/adminAuth.route.ts` | `router` | Express router defining authenticated administrator management endpoints for adminAuth. | `express`, `adminAuth.controller` |
| `src/routes/admin/adminCommentsRoute.ts` | `router` | Express router defining authenticated administrator management endpoints for adminCommentsRoute. | `express`, `postComments.controller`, `adminAccessCheck.middleware`, `adminAuthTokenValidator` |
| `src/routes/admin/anomaly.route.ts` | `router` | Express router defining authenticated administrator management endpoints for anomaly. | `express`, `adminAuthTokenValidator`, `adminAccessCheck.middleware`, `anomaly.controller` |
| `src/routes/admin/post.route.ts` | `router` | Express router defining authenticated administrator management endpoints for post. | `express`, `post.controller`, `adminAccessCheck.middleware`, `adminAuthTokenValidator` |
| `src/routes/admin/reports.route.ts` | `router` | Express router defining authenticated administrator management endpoints for reports. | `express`, `adminAuthTokenValidator`, `adminAccessCheck.middleware`, `reports.controller` |
| `src/routes/admin/stats.route.ts` | `router` | Express router defining authenticated administrator management endpoints for stats. | `express`, `adminAccessCheck.middleware`, `stats.controller`, `adminAuthTokenValidator` *(+1 more)* |
| `src/routes/admin/story.route.ts` | `router` | Express router defining authenticated administrator management endpoints for story. | `express`, `user.story.controller`, `adminAccessCheck.middleware`, `adminAuthTokenValidator` |
| `src/routes/admin/user.route.ts` | `router` | Express router defining authenticated administrator management endpoints for user. | `express`, `user.controller`, `adminAccessCheck.middleware`, `multer` *(+2 more)* |


## 03. Public Client HTTP Routes (14 files)

| File Path | Exported Symbols | Core Responsibility | Upstream / Downstream Dependencies |
| :--- | :--- | :--- | :--- |
| `src/routes/auth.route.ts` | `router` | Express router mounting public and authenticated client endpoints for auth operations. | `express`, `auth.controller`, `authorization`, `verifySignedOtpToken` |
| `src/routes/comment.route.ts` | `router` | Express router mounting public and authenticated client endpoints for comment operations. | `express`, `authorization`, `comment.controller` |
| `src/routes/fcm.route.ts` | `router` | Express router mounting public and authenticated client endpoints for fcm operations. | `express`, `authorization`, `fcm.controller` |
| `src/routes/follow.route.ts` | `router` | Express router mounting public and authenticated client endpoints for follow operations. | `express`, `authorization`, `follow.controller`, `checkFollowExistance` *(+1 more)* |
| `src/routes/forgetPassword.route.ts` | `router` | Express router mounting public and authenticated client endpoints for forgetPassword operations. | `express`, `forgetPassword.controller`, `verifySignedOtpToken` |
| `src/routes/like.route.ts` | `router` | Express router mounting public and authenticated client endpoints for like operations. | `express`, `authorization`, `like.controller` |
| `src/routes/message.route.ts` | `router` | Express router mounting public and authenticated client endpoints for message operations. | `express`, `authorization`, `message.controller`, `multer` *(+1 more)* |
| `src/routes/otp.route.ts` | `router` | Express router mounting public and authenticated client endpoints for otp operations. | `express`, `otp.controller`, `userExistanceCheck`, `userExistanceCheckForgetPassword` |
| `src/routes/post.route.ts` | `Router` | Express router mounting public and authenticated client endpoints for post operations. | `express`, `multer`, `authorization`, `envValuesAccessInterface` *(+4 more)* |
| `src/routes/privacy.route.ts` | `router` | Express router mounting public and authenticated client endpoints for privacy operations. | `express`, `authorization`, `privacy.controller` |
| `src/routes/profile.route.ts` | `router` | Express router mounting public and authenticated client endpoints for profile operations. | `express`, `authorization`, `profile.controller`, `multer` *(+1 more)* |
| `src/routes/search.route.ts` | `router` | Express router mounting public and authenticated client endpoints for search operations. | `express`, `authorization`, `search.controller` |
| `src/routes/story.route.ts` | `router` | Express router mounting public and authenticated client endpoints for story operations. | `express`, `authorization`, `story.controller`, `envValuesAccessInterface` *(+3 more)* |
| `src/routes/user.route.ts` | `usersRouter` | Express router mounting public and authenticated client endpoints for user operations. | `express`, `authorization`, `user.controller` |


## 04. Admin Route Controllers (9 files)

| File Path | Exported Symbols | Core Responsibility | Upstream / Downstream Dependencies |
| :--- | :--- | :--- | :--- |
| `src/controller/admin/activityLog.controller.ts` | `activityLog` | Admin controller handling request validation, permission checks, and response formatting for activityLog. | `express`, `Response`, `apiError`, `apiErrorTypesEnum` *(+3 more)* |
| `src/controller/admin/adminAuth.controller.ts` | `adminAuth` | Admin controller handling request validation, permission checks, and response formatting for adminAuth. | `pino`, `jsonwebtoken`, `express`, `adminTokenAuthenticator` *(+6 more)* |
| `src/controller/admin/anomaly.controller.ts` | `anomaly` | Admin controller handling request validation, permission checks, and response formatting for anomaly. | `express`, `Response`, `apiError`, `apiErrorTypesEnum` *(+3 more)* |
| `src/controller/admin/post.controller.ts` | `post` | Admin controller handling request validation, permission checks, and response formatting for post. | `Response`, `apiError`, `apiErrorTypesEnum`, `pino` *(+3 more)* |
| `src/controller/admin/postComments.controller.ts` | `postComments` | Admin controller handling request validation, permission checks, and response formatting for postComments. | `pino`, `Response`, `apiError`, `apiErrorTypesEnum` *(+3 more)* |
| `src/controller/admin/reports.controller.ts` | `reports` | Admin controller handling request validation, permission checks, and response formatting for reports. | `express`, `Response`, `apiError`, `apiErrorTypesEnum` *(+3 more)* |
| `src/controller/admin/stats.controller.ts` | `stats` | Admin controller handling request validation, permission checks, and response formatting for stats. | `Response`, `apiError`, `apiErrorTypesEnum`, `errorDetails` *(+3 more)* |
| `src/controller/admin/user.controller.ts` | `user` | Admin controller handling request validation, permission checks, and response formatting for user. | `pino`, `Response`, `apiError`, `cloudinary` *(+9 more)* |
| `src/controller/admin/user.story.controller.ts` | `user` | Admin controller handling request validation, permission checks, and response formatting for user.story. | `Response`, `apiError`, `apiErrorTypesEnum`, `pino` *(+3 more)* |


## 05. Public Route Controllers (16 files)

| File Path | Exported Symbols | Core Responsibility | Upstream / Downstream Dependencies |
| :--- | :--- | :--- | :--- |
| `src/controller/auth.controller.ts` | `auth` | Controller layer orchestrating HTTP input extraction, service invocation, and status code delivery for auth. | `apiError`, `Response`, `apiErrorTypesEnum`, `accountRestrictionBody` *(+11 more)* |
| `src/controller/comment.controller.ts` | `comment` | Controller layer orchestrating HTTP input extraction, service invocation, and status code delivery for comment. | `pino`, `apiError`, `Response`, `apiErrorTypesEnum` *(+3 more)* |
| `src/controller/fcm.controller.ts` | `fcm` | Controller layer orchestrating HTTP input extraction, service invocation, and status code delivery for fcm. | `pino`, `Response`, `apiError`, `apiErrorTypesEnum` *(+4 more)* |
| `src/controller/follow.controller.ts` | `follow` | Controller layer orchestrating HTTP input extraction, service invocation, and status code delivery for follow. | `pino`, `apiError`, `Response`, `apiErrorTypesEnum` *(+3 more)* |
| `src/controller/forgetPassword.controller.ts` | `forgetPassword` | Controller layer orchestrating HTTP input extraction, service invocation, and status code delivery for forgetPassword. | `pino`, `apiError`, `Response`, `apiErrorTypesEnum` *(+3 more)* |
| `src/controller/like.controller.ts` | `like` | Controller layer orchestrating HTTP input extraction, service invocation, and status code delivery for like. | `pino`, `apiError`, `Response`, `apiErrorTypesEnum` *(+3 more)* |
| `src/controller/message.controller.ts` | `message` | Controller layer orchestrating HTTP input extraction, service invocation, and status code delivery for message. | `pino`, `Response`, `apiError`, `apiErrorTypesEnum` *(+5 more)* |
| `src/controller/otp.controller.ts` | `otp` | Controller layer orchestrating HTTP input extraction, service invocation, and status code delivery for otp. | `jsonwebtoken`, `regex`, `Response`, `apiError` *(+7 more)* |
| `src/controller/post.controller.ts` | `post` | Controller layer orchestrating HTTP input extraction, service invocation, and status code delivery for post. | `pino`, `apiError`, `Response`, `apiErrorTypesEnum` *(+4 more)* |
| `src/controller/postShare.controller.ts` | `postShare` | Controller layer orchestrating HTTP input extraction, service invocation, and status code delivery for postShare. | `apiError`, `errorDetails`, `apiErrorTypesEnum`, `Response` *(+3 more)* |
| `src/controller/postStats.controller.ts` | `postStats` | Controller layer orchestrating HTTP input extraction, service invocation, and status code delivery for postStats. | `apiError`, `errorDetails`, `apiErrorTypesEnum`, `Response` *(+3 more)* |
| `src/controller/privacy.controller.ts` | `privacy` | Controller layer orchestrating HTTP input extraction, service invocation, and status code delivery for privacy. | `pino`, `Response`, `apiError`, `apiErrorTypesEnum` *(+3 more)* |
| `src/controller/profile.controller.ts` | `profile` | Controller layer orchestrating HTTP input extraction, service invocation, and status code delivery for profile. | `pino`, `Response`, `apiError`, `apiErrorTypesEnum` *(+4 more)* |
| `src/controller/search.controller.ts` | `searchController` | Controller layer orchestrating HTTP input extraction, service invocation, and status code delivery for search. | `pino`, `Response`, `apiError`, `apiErrorTypesEnum` *(+3 more)* |
| `src/controller/story.controller.ts` | `story` | Controller layer orchestrating HTTP input extraction, service invocation, and status code delivery for story. | `envValuesAccessInterface`, `pino`, `Response`, `apiError` *(+4 more)* |
| `src/controller/user.controller.ts` | `user` | Controller layer orchestrating HTTP input extraction, service invocation, and status code delivery for user. | `pino`, `apiError`, `apiErrorTypesEnum`, `express` *(+2 more)* |


## 06. Business Logic Services (18 files)

| File Path | Exported Symbols | Core Responsibility | Upstream / Downstream Dependencies |
| :--- | :--- | :--- | :--- |
| `src/services/AdminService.ts` | `AdminService`, `class` | Domain business service encapsulating validation, transactional logic, and third-party orchestration for Admin. | `adminDashBoardStats`, `dbQueryHelper`, `pino` |
| `src/services/PrivacyService.ts` | `PrivacyService`, `class` | Domain business service encapsulating validation, transactional logic, and third-party orchestration for Privacy. | `userRepo`, `pino` |
| `src/services/UserServices.ts` | `UserService`, `class` | Domain business service encapsulating validation, transactional logic, and third-party orchestration for UserServices.ts. | `userRepo` |
| `src/services/authService.ts` | `AuthService`, `class` | Domain business service encapsulating validation, transactional logic, and third-party orchestration for auth. | `uuid`, `errorsEnum`, `userRepo`, `bcryptUtil` *(+9 more)* |
| `src/services/cloudinary.ts` | `cloudinary` | Domain business service encapsulating validation, transactional logic, and third-party orchestration for cloudinary.ts. | `pino`, `cloudinary`, `envValuesAccessInterface`, `fs` |
| `src/services/commentService.ts` | `CommentService`, `class` | Domain business service encapsulating validation, transactional logic, and third-party orchestration for comment. | `commentRepo` |
| `src/services/fcmService.ts` | `FcmService`, `class` | Domain business service encapsulating validation, transactional logic, and third-party orchestration for fcm. | `firebase-admin`, `Response`, `messaging`, `envValuesAccessInterface` |
| `src/services/followService.ts` | `class`, `FollowService` | Domain business service encapsulating validation, transactional logic, and third-party orchestration for follow. | `followRepo`, `pino`, `index.service` |
| `src/services/forgetPasswordService.ts` | `class`, `ForgetPasswordService` | Domain business service encapsulating validation, transactional logic, and third-party orchestration for forgetPassword. | `userRepo`, `bcrypt`, `uuid` |
| `src/services/index.service.ts` | `index` | Domain business service encapsulating validation, transactional logic, and third-party orchestration for index. | `followRepo`, `userRepo`, `postRepo`, `likeRepo` *(+22 more)* |
| `src/services/likeService.ts` | `LikeService`, `class` | Domain business service encapsulating validation, transactional logic, and third-party orchestration for like. | `likeRepo`, `pino`, `fcmService` |
| `src/services/messageService.ts` | `MessageService`, `class` | Domain business service encapsulating validation, transactional logic, and third-party orchestration for message. | `messageRepo`, `userRepo`, `SocketMainHandler`, `ConnectedUsers` *(+6 more)* |
| `src/services/postService.ts` | `PostService`, `class` | Domain business service encapsulating validation, transactional logic, and third-party orchestration for post. | `postRepo`, `pino`, `cloudinary` |
| `src/services/postShareService.ts` | `class`, `PostShareService` | Domain business service encapsulating validation, transactional logic, and third-party orchestration for postShare. | `postShareRepo` |
| `src/services/postStatsService.ts` | `class`, `PostStatsService` | Domain business service encapsulating validation, transactional logic, and third-party orchestration for postStats. | `postStatsRepo` |
| `src/services/profileService.ts` | `class`, `ProfileService` | Domain business service encapsulating validation, transactional logic, and third-party orchestration for profile. | `userRepo`, `cloudinary`, `jsonwebtoken`, `uuid` *(+2 more)* |
| `src/services/searchService.ts` | `SearchService`, `class` | Domain business service encapsulating validation, transactional logic, and third-party orchestration for search. | `searchRepo` |
| `src/services/storyService.ts` | `StoryService`, `class` | Domain business service encapsulating validation, transactional logic, and third-party orchestration for story. | `storyRepo`, `pino`, `cloudinary` |


## 07. Database Repositories (Data Access Layer) (12 files)

| File Path | Exported Symbols | Core Responsibility | Upstream / Downstream Dependencies |
| :--- | :--- | :--- | :--- |
| `src/repo/adminRepo.ts` | `adminRepo` | Data access repository executing parameterized SQL queries against MySQL connection pool for admin entity. | `bcryptUtil`, `dbQueryHelper` |
| `src/repo/anomalyRepo.ts` | `anomalyRepo` | Data access repository executing parameterized SQL queries against MySQL connection pool for anomaly entity. | `dbQueryHelper` |
| `src/repo/commentRepo.ts` | `CommentRepo`, `class` | Data access repository executing parameterized SQL queries against MySQL connection pool for comment entity. | `dbQueryHelper` |
| `src/repo/followRepo.ts` | `FollowRepo`, `class` | Data access repository executing parameterized SQL queries against MySQL connection pool for follow entity. | `dbQueryHelper` |
| `src/repo/likeRepo.ts` | `LikeRepo`, `class` | Data access repository executing parameterized SQL queries against MySQL connection pool for like entity. | `dbQueryHelper` |
| `src/repo/messageRepo.ts` | `class`, `MessageRepo` | Data access repository executing parameterized SQL queries against MySQL connection pool for message entity. | `Response`, `message.type`, `dbQueryHelper`, `pino` |
| `src/repo/postRepo.ts` | `class`, `PostRepo` | Data access repository executing parameterized SQL queries against MySQL connection pool for post entity. | `dbQueryHelper` |
| `src/repo/postShareRepo.ts` | `class`, `PostShareRepo` | Data access repository executing parameterized SQL queries against MySQL connection pool for postShare entity. | `dbQueryHelper` |
| `src/repo/postStatsRepo.ts` | `PostStatsRepo`, `class` | Data access repository executing parameterized SQL queries against MySQL connection pool for postStats entity. | `dbQueryHelper` |
| `src/repo/searchRepo.ts` | `class`, `SearchRepo` | Data access repository executing parameterized SQL queries against MySQL connection pool for search entity. | `dbQueryHelper` |
| `src/repo/storyRepo.ts` | `class`, `StoryRepo` | Data access repository executing parameterized SQL queries against MySQL connection pool for story entity. | `dbQueryHelper` |
| `src/repo/userRepo.ts` | `UserRepo`, `class` | Data access repository executing parameterized SQL queries against MySQL connection pool for user entity. | `user`, `dbQueryHelper`, `pino` |


## 08. Realtime Socket.IO Handlers (2 files)

| File Path | Exported Symbols | Core Responsibility | Upstream / Downstream Dependencies |
| :--- | :--- | :--- | :--- |
| `src/socketHandlers/ConnectedUsers.ts` | `ConnectedUsers` | In-memory registry mapping authenticated user UUIDs to active Socket.IO connection IDs. | *None (Leaf)* |
| `src/socketHandlers/SocketMainHandler.ts` | `SocketMainHandler` | Master Socket.IO event router handling CToS dispatches, StoC routing, delivery status updates, and user disconnects. | `pino`, `app`, `dbQueryHelper`, `userRepo` *(+4 more)* |


## 09. HTTP Middlewares & Guards (9 files)

| File Path | Exported Symbols | Core Responsibility | Upstream / Downstream Dependencies |
| :--- | :--- | :--- | :--- |
| `src/middlewares/accessCheckLayer.ts` | `accessCheckLayer` | Express middleware guarding request execution (accessCheckLayer) via JWT token validation or parameter checks. | `pino`, `apiError`, `dbQueryHelper`, `apiErrorTypesEnum` *(+3 more)* |
| `src/middlewares/adminAccessCheck.middleware.ts` | `checkAdminAccess` | Express middleware guarding request execution (adminAccessCheck.middleware) via JWT token validation or parameter checks. | `apiError`, `apiErrorTypesEnum`, `express`, `authErrorBody` |
| `src/middlewares/adminAuthTokenValidator.ts` | `adminAuthorizationVerification` | Express middleware guarding request execution (adminAuthTokenValidator) via JWT token validation or parameter checks. | `pino`, `jsonwebtoken`, `apiError`, `apiErrorTypesEnum` *(+4 more)* |
| `src/middlewares/authorization.ts` | `verifyToken` | Express middleware guarding request execution (authorization) via JWT token validation or parameter checks. | `pino`, `jsonwebtoken`, `apiError`, `operation` *(+5 more)* |
| `src/middlewares/checkFollowExistance.ts` | `async` | Express middleware guarding request execution (checkFollowExistance) via JWT token validation or parameter checks. | `pino`, `Response`, `apiError`, `apiErrorTypesEnum` *(+3 more)* |
| `src/middlewares/multer.ts` | `multer` | Express middleware guarding request execution (multer) via JWT token validation or parameter checks. | `path`, `multer` |
| `src/middlewares/userExistanceCheck.ts` | `userExistanceCheck` | Express middleware guarding request execution (userExistanceCheck) via JWT token validation or parameter checks. | `connection`, `apiError`, `regex`, `dbQueryHelper` *(+5 more)* |
| `src/middlewares/userExistanceCheckForgetPassword.ts` | `userExistanceCheckForgetPassword` | Express middleware guarding request execution (userExistanceCheckForgetPassword) via JWT token validation or parameter checks. | `regex`, `apiError`, `connection`, `dbQueryHelper` *(+6 more)* |
| `src/middlewares/verifySignedOtpToken.ts` | `verifyOtpSignedToken` | Express middleware guarding request execution (verifySignedOtpToken) via JWT token validation or parameter checks. | `pino`, `jsonwebtoken`, `apiError`, `apiErrorTypesEnum` *(+3 more)* |


## 10. Database Connection & Redis Cache (3 files)

| File Path | Exported Symbols | Core Responsibility | Upstream / Downstream Dependencies |
| :--- | :--- | :--- | :--- |
| `src/db/connection.ts` | `connection` | MySQL database connection pool instance configured with connection limits and credentials. | `mysql2`, `envValuesAccessInterface` |
| `src/redis/operation.ts` | `class`, `RedisHelper` | Redis client instance and cache operations helper for operation. | `redisConstants`, `redis` |
| `src/redis/redis.ts` | `redisClient` | Redis client instance and cache operations helper for redis. | `ioredis`, `envValuesAccessInterface` |


## 11. System Constants & Error Definitions (13 files)

| File Path | Exported Symbols | Core Responsibility | Upstream / Downstream Dependencies |
| :--- | :--- | :--- | :--- |
| `src/constants/Response.ts` | `Response`, `class` | System constants, standardized error response envelopes, or enums for Response. | *None (Leaf)* |
| `src/constants/accountRestrictionBody.ts` | `class`, `AccountRestriction_body` | System constants, standardized error response envelopes, or enums for accountRestrictionBody. | `banTypeEnum` |
| `src/constants/apiError.ts` | `class`, `ApiError` | System constants, standardized error response envelopes, or enums for apiError. | `apiErrorTypesEnum` |
| `src/constants/apiErrorTypesEnum.ts` | `apiErrorType` | System constants, standardized error response envelopes, or enums for apiErrorTypesEnum. | *None (Leaf)* |
| `src/constants/appNameConstant.ts` | `APP_NAME` | System constants, standardized error response envelopes, or enums for appNameConstant. | *None (Leaf)* |
| `src/constants/authErrorBody.ts` | `AuthError_body`, `class` | System constants, standardized error response envelopes, or enums for authErrorBody. | *None (Leaf)* |
| `src/constants/banTypeEnum.ts` | `BanType` | System constants, standardized error response envelopes, or enums for banTypeEnum. | *None (Leaf)* |
| `src/constants/errorDetails.ts` | `ErrorDetails` | System constants, standardized error response envelopes, or enums for errorDetails. | *None (Leaf)* |
| `src/constants/errorsEnum.ts` | `ErrorEnum` | System constants, standardized error response envelopes, or enums for errorsEnum. | *None (Leaf)* |
| `src/constants/loginTypeEnum.ts` | `LoginType` | System constants, standardized error response envelopes, or enums for loginTypeEnum. | *None (Leaf)* |
| `src/constants/messageTypeEnum.ts` | `messageType` | System constants, standardized error response envelopes, or enums for messageTypeEnum. | *None (Leaf)* |
| `src/constants/redisConstants.ts` | `redisConstants` | System constants, standardized error response envelopes, or enums for redisConstants. | *None (Leaf)* |
| `src/constants/serviceError.ts` | `ServiceError`, `class` | System constants, standardized error response envelopes, or enums for serviceError. | `errorDetails`, `errorsEnum` |


## 12. TypeScript Type Definitions (6 files)

| File Path | Exported Symbols | Core Responsibility | Upstream / Downstream Dependencies |
| :--- | :--- | :--- | :--- |
| `src/types/adminDashBoardStats.ts` | `adminDashBoardStats` | TypeScript interfaces and type declarations defining contract shapes for adminDashBoardStats. | *None (Leaf)* |
| `src/types/adminTokenPayload.ts` | `adminPayload` | TypeScript interfaces and type declarations defining contract shapes for adminTokenPayload. | *None (Leaf)* |
| `src/types/express.d.ts` | `express` | TypeScript interfaces and type declarations defining contract shapes for express.d. | *None (Leaf)* |
| `src/types/message.type.ts` | `message` | TypeScript interfaces and type declarations defining contract shapes for message.type. | `messageTypeEnum` |
| `src/types/registerUserType.ts` | `registerUserType` | TypeScript interfaces and type declarations defining contract shapes for registerUserType. | `user` |
| `src/types/user.ts` | `interface`, `user` | TypeScript interfaces and type declarations defining contract shapes for user. | *None (Leaf)* |


## 13. Utility Functions & Logging (7 files)

| File Path | Exported Symbols | Core Responsibility | Upstream / Downstream Dependencies |
| :--- | :--- | :--- | :--- |
| `src/utils/adminTokenAuthenticator.ts` | `validateAdminCreds`, `function` | Shared utility helper providing adminTokenAuthenticator logic (e.g. hashing, logging, regex). | `envValuesAccessInterface` |
| `src/utils/bcryptUtil.ts` | `bcryptUtil` | Shared utility helper providing bcryptUtil logic (e.g. hashing, logging, regex). | `bcrypt` |
| `src/utils/dbQueryHelper.ts` | `fetchDb` | Shared utility helper providing dbQueryHelper logic (e.g. hashing, logging, regex). | `connection` |
| `src/utils/envValuesAccessInterface.ts` | `envValuesAccessInterface` | Shared utility helper providing envValuesAccessInterface logic (e.g. hashing, logging, regex). | *None (Leaf)* |
| `src/utils/helperFunctions.ts` | `helperFunctions` | Shared utility helper providing helperFunctions logic (e.g. hashing, logging, regex). | `Response`, `message.type`, `pino`, `dbQueryHelper` |
| `src/utils/pino.ts` | `logger`, `formErrorBody` | Shared utility helper providing pino logic (e.g. hashing, logging, regex). | `pino`, `express`, `anomalyRepo`, `app` |
| `src/utils/regex.ts` | `regex` | Shared utility helper providing regex logic (e.g. hashing, logging, regex). | *None (Leaf)* |

