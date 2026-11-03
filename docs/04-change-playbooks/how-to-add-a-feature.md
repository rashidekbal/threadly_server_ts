# 04-Change Playbooks — How to Add a Feature (Server Recipes)

This playbook provides verified, step-by-step modification recipes for extending the Threadly TypeScript Server. Every recipe shows the exact sequence of files to touch across the layered architecture.

---

## Recipe 1: Adding a New REST API Endpoint (e.g., Bookmark / Save Post)

### Objective
Create an endpoint `POST /api/posts/savePost/:id` to allow an authenticated user to save/bookmark a post.

### Step 1: Add Repository Query
**File**: `src/repo/postRepo.ts`
```typescript
export async function savePostRepo(userid: string, postid: number): Promise<any> {
    const query = `
        INSERT INTO saved_posts (userid, postid, createdAt) 
        VALUES (?, ?, NOW())
        ON DUPLICATE KEY UPDATE createdAt = NOW();
    `;
    return await fetchDb(query, [userid, postid]);
}
```

### Step 2: Add Service Business Logic
**File**: `src/services/postService.ts`
```typescript
export async function savePostService(userid: string, postid: number) {
    if (!postid || isNaN(postid)) {
        throw new Error("Invalid post ID provided");
    }
    // Optional: check if post exists
    const post = await postRepo.getPostById(postid, userid);
    if (!post || post.length === 0) {
        throw new Error("Post not found");
    }
    await postRepo.savePostRepo(userid, postid);
    return { postid, saved: true };
}
```

### Step 3: Add Controller Handler
**File**: `src/controller/post.controller.ts`
```typescript
export async function savePostController(req: Request, res: Response) {
    const postId = Number(req.params.id);
    const userId = req.user.userid;
    try {
        const result = await postService.savePostService(userId, postId);
        return res.status(200).json({ status: "success", data: result });
    } catch (err: any) {
        logger.error(formErrorBody(err.message, 500, req.originalUrl));
        return res.status(400).json({ status: "error", message: err.message });
    }
}
```

### Step 4: Mount Route with Auth Middleware
**File**: `src/routes/post.route.ts`
```typescript
import { savePostController } from "../controller/post.controller.js";
import auth from "../middlewares/authorization.js";

// Mount endpoint:
postRoute.post("/savePost/:id", auth, savePostController);
```

### Step 5: Add Unit Test
**File**: `test/postService.test.ts`
```typescript
import test from "node:test";
import assert from "node:assert";
import { savePostService } from "../src/services/postService.js";

test("savePostService should reject invalid postid", async () => {
    await assert.rejects(
        async () => { await savePostService("user123", NaN); },
        /Invalid post ID/
    );
});
```

---

## Recipe 2: Adding a Real-Time Socket.IO Event (e.g., Typing Status)

### Objective
Receive `typing_event` from Alice and forward it to Bob if Bob is actively connected.

### Step 1: Update Socket Router
**File**: `src/socketHandlers/SocketMainHandler.ts`
```typescript
// Inside setSocketFunctions(socket, io):
socket.on("typing_event", (data: { senderUuid: string; receiverUuid: string; isTyping: boolean }) => {
    const receiverSocketId = getSocketId(data.receiverUuid);
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing_event", {
            senderUuid: data.senderUuid,
            isTyping: data.isTyping
        });
    }
});
```

---

## Recipe 3: Modifying Database Schema (Adding a Column)

### Step 1: Execute SQL DDL & Update `schema.txt`
**File**: `schema.txt`
```sql
ALTER TABLE users ADD COLUMN isVerified BOOLEAN DEFAULT FALSE;
```

### Step 2: Update TypeScript Interfaces
**File**: `src/types/user.ts`
```typescript
export interface UserRecord {
    userid: string;
    username: string;
    email: string;
    phone: string;
    // ...
    isVerified?: boolean;
}
```

### Step 3: Update Repository Queries
**File**: `src/repo/userRepo.ts`
Update `SELECT` and `INSERT` statements to map `isVerified`.

---

## Recipe 4: Adding an Admin Management API

### Step 1: Mount Route under `/api/admin/v1/`
**File**: `src/routes/admin/user.route.ts`
```typescript
import adminAuth from "../../middlewares/adminAuthTokenValidator.js";
AdminUsersRouter.get("/verified-creators", adminAuth, getVerifiedCreatorsController);
```

### Step 2: Implement Admin Controller & Service
Follow the standard Layered pattern, validating that the requesting user possesses administrative permissions.
