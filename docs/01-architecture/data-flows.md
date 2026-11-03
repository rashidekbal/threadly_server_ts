# 01-Architecture — Server Data Flows & Sequence Diagrams

This document details the core data pipelines and request lifecycles executed by the Threadly TypeScript Server using GitHub-flavored Mermaid sequence diagrams.

---

## 1. User Authentication & JWT Issuance Pipeline

This sequence diagrams user login across credentials extraction, repository lookup, Bcrypt password comparison, and JWT token issuance.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Mobile Client / Browser
    participant Router as auth.route.ts
    participant Controller as auth.controller.ts
    participant Service as authService.ts
    participant Repo as userRepo.ts
    participant Bcrypt as bcryptUtil.ts
    participant DB as MySQL Database

    Client->>Router: POST /api/auth/login/mobile/ { userid, password }
    Router->>Controller: LoginMobileController(req, res)
    Controller->>Service: LoginMobile(userid, password)
    Service->>Repo: getUserByMobile(phone)
    Repo->>DB: SELECT * FROM users WHERE phone = ?
    DB-->>Repo: Return User Row (pass, uuid, userid, etc.)
    Repo-->>Service: UserRecord

    Service->>Bcrypt: comparePassword(password, userRecord.pass)
    Bcrypt-->>Service: Password Matches (true)

    Service->>Service: jwt.sign({ userid, uuid }, JWT_SECRET, { expiresIn: '30d' })
    Service-->>Controller: { token, data: { uuid, userid, username, profileUrl } }
    Controller-->>Client: 200 OK { token, data }
```

---

## 2. Real-Time Message Brokerage & FCM Push Fallback

This sequence diagrams how `SocketMainHandler.ts` routes real-time chat messages between peers, records delivery status in MySQL, and delegates to Firebase Cloud Messaging when the recipient is offline.

```mermaid
sequenceDiagram
    autonumber
    actor Alice as Alice (Client Socket)
    participant SocketGW as Socket.IO Server (SocketMainHandler)
    participant Registry as ConnectedUsers.ts
    participant MessageRepo as messageRepo.ts
    participant MySQL as MySQL Database
    participant FCM as fcmService.ts
    actor Bob as Bob (Client Socket / Device)

    Alice->>SocketGW: emit("CToS", { MsgUid, receiverUuid, msg, type, link, postId })
    SocketGW->>Registry: getSocketId(data.receiverUuid)

    alt Bob is Online via Socket (socketId != null)
        Registry-->>SocketGW: Return Bob's socketId
        SocketGW->>Bob: emit("StoC", { MsgUid, senderUuid, msg, ... })
        SocketGW->>Alice: emit("MsgStatusUpdate", { MsgUid, deliveryStatus: 1 })
        SocketGW->>MessageRepo: addMessageToDb({ messageUid, deliveryStatus: 1, ... })
        MessageRepo->>MySQL: INSERT INTO messages VALUES (...)
        
        Bob->>SocketGW: emit("notifyReceivedToSender", { senderUUid, msgUid })
        SocketGW->>Alice: emit("msg_status_changed_event", { MsgUid, deliveryStatus: 2 })
        SocketGW->>MessageRepo: updateMessageDeliveryStatus(msgUid, 2)
        MessageRepo->>MySQL: UPDATE messages SET deliveryStatus = 2 WHERE messageUid = ?
    else Bob is Offline (socketId == null)
        Registry-->>SocketGW: Return null
        SocketGW->>MessageRepo: addMessageToDb({ messageUid, deliveryStatus: 1, ... })
        MessageRepo->>MySQL: INSERT INTO messages VALUES (...)
        SocketGW->>FCM: sendMessageNotification(token, messageToSend)
        FCM->>Bob: Push Notification via Firebase Cloud Messaging
        SocketGW->>Alice: emit("MsgStatusUpdate", { MsgUid, deliveryStatus: 1 })
    end
```

---

## 3. Media Ingestion & Cloudinary Upload Pipeline

This sequence diagrams image/video upload handling from multipart parsing to Cloudinary storage and database persistence.

```mermaid
sequenceDiagram
    autonumber
    actor Creator as User Device
    participant Route as post.route.ts
    participant Multer as multer.ts
    participant Controller as post.controller.ts
    participant Service as postService.ts
    participant Cloudinary as cloudinary.ts
    participant CloudCDN as Cloudinary Cloud API
    participant Repo as postRepo.ts
    participant DB as MySQL Database

    Creator->>Route: POST /api/posts/addImagePost/ (Multipart Form: image, caption)
    Route->>Multer: upload.single("image")
    Multer->>Multer: Stage file to src/public/temp/tmp_xxx.jpg
    Multer->>Controller: addImagePostController(req, res)
    
    Controller->>Service: createPost(filePath, caption, userid, "image")
    Service->>Cloudinary: uploadImage(filePath)
    Cloudinary->>CloudCDN: Stream bytes over HTTPS
    CloudCDN-->>Cloudinary: Return Secure CDN URL (https://res.cloudinary.com/...)
    
    Service->>Repo: addPost(userid, secureUrl, caption, "image")
    Repo->>DB: INSERT INTO imagepost (userid, imageurl, caption, type) VALUES (...)
    DB-->>Repo: Return insertId
    
    Service->>Service: fs.unlinkSync(filePath) (Clean temporary scratch buffer)
    Service-->>Controller: { postid: insertId, imageurl: secureUrl }
    Controller-->>Creator: 200 OK { status: "success", data: { ... } }
```

---

## 4. Administrative Moderation & Anomaly Alerting

This sequence diagrams how runtime exceptions are captured, persisted into `system_anomalies`, and pushed live to connected admin dashboards.

```mermaid
sequenceDiagram
    autonumber
    participant App as Any Express Route / Controller
    participant AnomalySvc as anomalyRepo.ts
    participant DB as MySQL Database
    participant SocketGW as Socket.IO Server
    actor Admin as Admin Dashboard (admin_room)

    App->>App: Uncaught Runtime Exception or High Error Spike
    App->>AnomalySvc: logAnomaly(error_message, error_code, api_path, severity)
    AnomalySvc->>DB: INSERT INTO system_anomalies VALUES (...)
    DB-->>AnomalySvc: Anomaly ID 84 Created
    
    AnomalySvc->>SocketGW: io.to("admin_room").emit("system_anomaly", anomalyData)
    SocketGW->>Admin: Real-time Alert on Admin Dashboard
```

---

## 6. Comments & Nested Replies Data Flow

This sequence diagrams how the backend handles top-level comments, parent-child thread lookups (`replyToCommentId`), comment likes, and asynchronous push notification dispatch via FCM.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Mobile Client (Alice)
    participant Route as comment.route.ts
    participant Ctrl as comment.controller.ts
    participant Svc as commentService.ts
    participant Repo as commentRepo.ts
    participant DB as MySQL (post_comments & comment_likes)
    participant FCM as fcmService.ts
    actor Author as Post Author (Bob)

    Client->>Route: POST /api/comment/addComment { postid: 1042, comment: "Awesome capture!" }
    Route->>Ctrl: addComentController(req, res)
    Ctrl->>Svc: addComment(userid, postid, comment)
    Svc->>Repo: insertComment(userid, postid, comment)
    Repo->>DB: INSERT INTO post_comments (userid, postid, comment_text) VALUES (...)
    DB-->>Repo: Inserted ID 502
    Repo-->>Svc: Success commentid = 502
    
    par Asynchronous Push Notification
        Svc->>DB: SELECT userid FROM imagepost WHERE postid = 1042
        DB-->>Svc: Bob (bob_uuid)
        Svc->>FCM: notifyPostComment(bob_uuid, "Alice commented on your post", 1042)
        FCM-->>Author: FCM Data Push Delivered
    end

    Svc-->>Ctrl: Return comment object
    Ctrl-->>Client: 201 Created { commentid: 502, ... }

    actor Charlie as Mobile Client (Charlie)
    Charlie->>Route: POST /api/comment/replyTo/502 { postId: 1042, comment: "I agree with Alice" }
    Route->>Ctrl: replyToCommentController(req, res)
    Ctrl->>Svc: replyToComment(userid, commentId: 502, postId: 1042, text)
    Svc->>Repo: insertReply(userid, postid, text, replyToCommentId: 502)
    Repo->>DB: INSERT INTO post_comments (userid, postid, comment_text, replyToCommentId) VALUES (..., 502)
    DB-->>Repo: Inserted Reply ID 503
    Svc->>FCM: notifyCommentReply(alice_uuid, "Charlie replied to your comment", 502)
    Ctrl-->>Charlie: 201 Created { commentid: 503, replyToCommentId: 502 }

    Client->>Route: GET /api/comment/getCommentReplies/502
    Route->>Ctrl: getReplyOfCommentController(req, res)
    Ctrl->>Svc: getReplies(commentId: 502)
    Svc->>Repo: queryReplies(502)
    Repo->>DB: SELECT c.*, u.username, u.profilepic, COUNT(l.comment_like_id) as likes FROM post_comments c JOIN users u ON ... LEFT JOIN comment_likes l ON ... WHERE c.replyToCommentId = 502 GROUP BY c.commentid
    DB-->>Repo: Reply rows with like counts
    Repo-->>Ctrl: Array of child comments
    Ctrl-->>Client: 200 OK [ { commentid: 503, ... } ]
```

---

## 7. Story Publishing, Expiration & Realtime View Beacon Flow

This sequence diagrams ephemeral 24-hour stories: media upload to Cloudinary, database persistence with auto-expiration TTL, live Socket.IO view receipts, and viewer audits.

```mermaid
sequenceDiagram
    autonumber
    actor Alice as Story Creator
    participant Route as story.route.ts
    participant Multer as multer.ts
    participant Svc as storyService.ts
    participant Cloud as Cloudinary API
    participant Repo as storyRepo.ts
    participant DB as MySQL (story & story_views)
    actor Bob as Story Viewer
    participant Socket as SocketMainHandler.ts

    Alice->>Route: POST /api/story/addStory (Multipart Form Data)
    Route->>Multer: Process media buffer
    Multer->>Svc: addStory(userid, file, type)
    Svc->>Cloud: uploadToCloudinary(file.path)
    Cloud-->>Svc: Secure HTTPS Media URL
    Svc->>Repo: createStory(userid, mediaUrl, expiresAt: NOW() + 24 HOURS)
    Repo->>DB: INSERT INTO story (userid, mediaUrl, expiresAt) VALUES (...)
    DB-->>Repo: storyId: 77
    Svc-->>Alice: 201 Created { storyId: 77, mediaUrl: "..." }

    Bob->>Socket: emit("StoryViewed", { storyId: 77, viewerUserId: "bob" })
    Socket->>DB: INSERT IGNORE INTO story_views (storyid, userid, viewedAt) VALUES (77, "bob", NOW())
    
    Alice->>Route: GET /api/story/viewers/77
    Route->>Svc: getStoryViewers(77)
    Svc->>Repo: queryViewers(77)
    Repo->>DB: SELECT u.username, u.profilepic, sv.viewedAt FROM story_views sv JOIN users u ON sv.userid = u.userid WHERE sv.storyid = 77
    DB-->>Repo: Viewer list records
    Repo-->>Alice: 200 OK [ { username: "bob", profilepic: "..." } ]

    Note over DB: Query filtration: WHERE expiresAt > NOW() hides stories older than 24 hours
```

---

## 8. Social Graph & Private Profile Approval Pipeline

This sequence diagrams relationship state transitions: following public accounts vs. requesting to follow private accounts, follow request cancellation, approval, rejection, and FCM status notifications.

```mermaid
sequenceDiagram
    autonumber
    actor Alice as Requester (Alice)
    participant Route as follow.route.ts
    participant Svc as followService.ts
    participant Repo as followRepo.ts
    participant DB as MySQL (followers & users)
    participant FCM as fcmService.ts
    actor Bob as Target User (Bob)

    Alice->>Route: POST /api/follow/follow/V2/ { followingid: "bob" }
    Route->>Svc: followUser(aliceId, bobId)
    Svc->>Repo: getUserPrivacy("bob")
    Repo->>DB: SELECT isPrivate FROM users WHERE userid = "bob"
    
    alt Bob is a Private Account (isPrivate = 1)
        DB-->>Svc: isPrivate = true
        Svc->>Repo: createFollowRequest(aliceId, bobId, status: "pending")
        Repo->>DB: INSERT INTO followers (follower_userid, following_userid, status) VALUES (alice, bob, 'pending')
        Svc->>FCM: dispatchNotification(bob_uuid, "newFollowRequest", { follower: aliceId })
        FCM-->>Bob: FCM Alert: Alice requested to follow you
        Svc-->>Alice: 200 OK { "response": "PENDING", "status": "success" }
        
        Bob->>Route: POST /api/follow/acceptFollowRequest/ { followerId: "alice" }
        Route->>Svc: acceptFollowRequest(bobId, aliceId)
        Svc->>Repo: updateFollowStatus(aliceId, bobId, 'accepted')
        Repo->>DB: UPDATE followers SET status = 'accepted' WHERE follower_userid = alice AND following_userid = bob
        Svc->>FCM: dispatchNotification(alice_uuid, "followAccepted", { user: bobId })
        FCM-->>Alice: FCM Alert: Bob accepted your follow request
    else Bob is a Public Account (isPrivate = 0)
        DB-->>Svc: isPrivate = false
        Svc->>Repo: createFollow(aliceId, bobId, status: "accepted")
        Repo->>DB: INSERT INTO followers (follower_userid, following_userid, status) VALUES (alice, bob, 'accepted')
        Svc->>FCM: dispatchNotification(bob_uuid, "newFollower", { follower: aliceId })
        FCM-->>Bob: FCM Alert: Alice started following you
        Svc-->>Alice: 200 OK { "response": "SUCCESS", "status": "success" }
    end
```

