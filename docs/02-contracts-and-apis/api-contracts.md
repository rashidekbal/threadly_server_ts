# 02-Contracts & APIs — REST & Admin API Specifications

This document defines every HTTP endpoint exposed by the Threadly TypeScript Server. Contracts are extracted directly from `src/routes/*.route.ts`, `src/routes/admin/*.route.ts`, and their corresponding controllers.

---

## 1. Global Request & Response Conventions

- **Headers**:
  ```http
  Content-Type: application/json
  Authorization: Bearer <JWT_TOKEN>
  ```
- **Standard Success Envelope**:
  ```json
  {
    "status": "success",
    "data": { ... } // Or array of objects
  }
  ```
- **Standard Error Envelope**:
  ```json
  {
    "status": "error",
    "message": "Descriptive error message",
    "errorCode": 400
  }
  ```

---

## 2. Authentication & Onboarding APIs (`src/routes/auth.route.ts` & `otp.route.ts`)

| Method | Path | Auth | Payload / Parameters | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login/mobile/` | None | `{"userid": "string", "password": "string"}` | Login with mobile number. |
| `POST` | `/api/auth/login/email/` | None | `{"userid": "string", "password": "string"}` | Login with email address. |
| `POST` | `/api/auth/login/userid/` | None | `{"userid": "string", "password": "string"}` | Login with unique username handle. |
| `GET` | `/api/auth/logout/` | Bearer | None | Invalidate session. |
| `POST` | `/api/auth/resetPassword/`| Bearer | `{"oldPassword": "string", "newPassword": "string"}` | Update account password in settings. |
| `POST` | `/api/otp/generateOtpMobile/` | None | `{"phone": "string"}` | Generate and send SMS OTP via EazyOTP. |
| `POST` | `/api/otp/verifyOtpMobile/` | None | `{"phone": "string", "otp": "string"}` | Verify mobile OTP code. |
| `POST` | `/api/otp/generateOtpEmail/` | None | `{"email": "string"}` | Send email verification code. |
| `POST` | `/api/otp/verifyOtpEmail/` | None | `{"email": "string", "otp": "string"}` | Verify email code. |
| `POST` | `/api/ForgetPassword/Mobile/` | None | `{"password": "new_password"}` (with reset token header) | Reset password after mobile OTP. |
| `POST` | `/api/ForgetPassword/Email/` | None | `{"password": "new_password"}` (with reset token header) | Reset password after email OTP. |

---

## 3. Feed & Posts APIs (`src/routes/post.route.ts`)

### A. Get Image Feed V2 (Deterministic Seeded Pagination)
- **Route**: `POST /api/posts/getImagePostsFeedV2/?page={page}`
- **Auth**: `Bearer <token>`
- **Request Body**: `{"seed": 123456}`
- **Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": [
      {
        "postid": 1042,
        "userid": "jane_doe",
        "username": "Jane Doe",
        "profilepic": "https://res.cloudinary.com/.../avatar.jpg",
        "imageurl": "https://res.cloudinary.com/.../post.jpg",
        "caption": "Morning coffee",
        "created_at": "2026-11-03T09:00:00Z",
        "likedBy": "alice, bob",
        "likeCount": 24,
        "commentCount": 3,
        "shareCount": 1,
        "isLiked": 1,
        "type": "image",
        "isFollowed": 1,
        "viewCount": 115
      }
    ]
  }
  ```

### B. Video Feed (Reels V2)
- **Route**: `POST /api/posts/getVideoPostsFeedV2/?page={page}`
- **Auth**: `Bearer <token>`
- **Request Body**: `{"seed": 123456}`
- **Response**: Array of video post objects formatted for full-screen ExoPlayer playback.

### C. Create Post (Multipart)
- **Route**: `POST /api/posts/addImagePost/` or `POST /api/posts/addVideoPost/`
- **Auth**: `Bearer <token>`
- **Multipart Form**:
  - `image` or `video`: Binary file stream
  - `caption`: Text caption string

### D. Post Metrics & Views
- `GET /api/posts/getPost/{id}`: Fetch single post metadata.
- `GET /api/posts/getUserPosts/{userId}?page={page}`: Paginate user profile posts.
- `DELETE /api/posts/removePost/{id}`: Soft delete post (`isDeleted = true`).
- `POST /api/posts/postViewed/{id}`: Increment post view count.
- `GET /api/posts/{postId}/likedby/`: Return list of users who liked post.
- `GET /api/posts/{postId}/sharedby/`: Return list of users who shared post.

---

## 4. Real-Time Messages APIs (`src/routes/message.route.ts`)

| Method | Path | Auth | Payload / Parameters | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/messages/sendMessage/` | Bearer | Full Message JSON Packet (see realtime-protocol.md) | Asynchronous HTTP fallback for offline socket. |
| `GET` | `/api/messages/getAllChats/` | Bearer | None | Hydrates initial user chat history upon login. |
| `GET` | `/api/messages/checkPendingMessages/` | Bearer | None | Returns count of pending offline messages. |
| `POST` | `/api/messages/getPendingMessages/` | Bearer | `{"senderUuid": "string"}` | Retrieves pending messages for specific sender. |
| `POST` | `/api/messages/updateMessageDeliveryStatus/` | Bearer | `{"senderUUid": "...", "receiverUUid": "...", "uids": [...]}` | Acknowledges message seen delivery status. |
| `POST` | `/api/messages/uploadMedia/` | Bearer | Multipart file (`media`) | Uploads chat attachment to Cloudinary. |
| `PATCH`| `/api/messages/deleteMessageForMe/` | Bearer | `{"MsgUid": "...", "Role": "sender"\|"receiver"}` | Soft-deletes message for one participant. |
| `PATCH`| `/api/messages/unSendMessage/` | Bearer | `{"MsgUid": "...", "receiverUUid": "..."}` | Un-sends message for both participants. |

---

## 5. Comments, Likes, Follow & Stories APIs

- **Comments (`src/routes/comment.route.ts`)**:
  - `GET /api/comment/getComments/{postId}`
  - `POST /api/comment/addComment/` (`{"postid": 1042, "comment": "text"}`)
  - `POST /api/comment/replyTo/{commentId}` (`{"postId": 1042, "comment": "text"}`)
  - `GET /api/comment/getCommentReplies/{commentId}`
- **Likes (`src/routes/like.route.ts`)**:
  - `GET /api/like/likePost/{postId}` & `/api/like/unlikePost/{postId}`
  - `GET /api/like/likeAComment/{commentId}` & `/api/like/unlikeAComment/{commentId}`
  - `GET /api/like/likeStory/{storyId}` & `/api/like/unlikeStory/{storyId}`
- **Follows (`src/routes/follow.route.ts`)**:
  - `POST /api/follow/follow/V2/` (`{"followingid": "userid"}`) -> Returns `{ "response": "SUCCESS" | "PENDING" }`
  - `POST /api/follow/unfollow/` (`{"followingid": "userid"}`)
  - `GET /api/follow/getAllFollowRequests/`
  - `POST /api/follow/acceptFollowRequest/` (`{"followerId": "userid"}`)
  - `DELETE /api/follow/rejectFollowRequest/{followerId}`
- **Stories (`src/routes/story.route.ts`)**:
  - `POST /api/story/addStory/` (Multipart upload: `media`, `Type`)
  - `GET /api/story/getStories/` (Aggregates active 24h stories)
  - `GET /api/story/getMyStories/` & `DELETE /api/story/removeStory/{storyId}`

---

## 6. Administrative Portal APIs (`src/routes/admin/*.route.ts`)

All admin routes require `Authorization: Bearer <ADMIN_JWT_TOKEN>` validated by `adminAuthTokenValidator.ts`:

| Method | Path | Description |
| :--- | :--- | :--- |
| `POST` | `/api/admin/v1/auth/login` | Administrator authentication. |
| `GET` | `/api/admin/v1/stats/dashboard` | Overall platform telemetry (total users, daily posts, active messages). |
| `GET` | `/api/admin/v1/users` | Paginated user management table. |
| `PATCH`| `/api/admin/v1/users/{id}/ban` | Update user ban status (`banDuration`: `24hr` \| `permanent` \| `none`). |
| `GET` | `/api/admin/v1/reports` | List flagged user reports on posts and comments. |
| `PATCH`| `/api/admin/v1/reports/{id}/resolve`| Mark user report as reviewed or dismissed. |
| `GET` | `/api/admin/v1/anomalies` | Query captured system runtime anomalies. |
| `PATCH`| `/api/admin/v1/anomalies/{id}/resolve`| Mark anomaly as resolved. |
