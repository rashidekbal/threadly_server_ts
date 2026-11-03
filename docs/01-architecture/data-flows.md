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
