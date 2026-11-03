# 02-Contracts & APIs — Realtime Protocol & Push Specifications

This document defines the real-time event routing protocol and push notification subsystem implemented in the Threadly TypeScript Server.

---

## 1. Socket.IO Gateway Configuration

Managed in `src/app.ts` and `src/socketHandlers/SocketMainHandler.ts`:
- **Server Instance**: `new Server(httpServer, { cors: { origin: "*" }, transports: ["websocket", "polling"] })`
- **Session Registry**: `src/socketHandlers/ConnectedUsers.ts` maintains:
  - `connectedUsers: Map<string, string>` (Maps User UUID -> Socket ID)
  - `socketToUser: Map<string, string>` (Maps Socket ID -> User UUID)

---

## 2. Real-Time Event Specifications

### A. Connection Handshake (`onConnect`)
- **Direction**: Client -> Server
- **Payload**: `data: string` (User UUID)
- **Server Action**: Invokes `addUser(uuid, socket.id)`. Associates subsequent event routing with this authenticated client.

### B. Admin Room Authorization (`admin_auth`)
- **Direction**: Client (Admin Dashboard) -> Server
- **Server Action**: Invokes `socket.join("admin_room")`. The socket begins receiving live `system_anomaly` telemetry broadcasts.

### C. Chat Message Forwarding (`CToS` -> `StoC`)
- **Direction**: Client (Sender) -> Server -> Client (Receiver)
- **Input Event (`CToS`)**:
  ```json
  {
    "timestamp": "2026-11-03 19:42:00",
    "MsgUid": "8e3c79a4-1a2b-4c3d...",
    "senderUuid": "alice-uuid",
    "receiverUuid": "bob-uuid",
    "senderName": "Alice",
    "senderUserId": "alice_w",
    "senderProfilePic": "https://...",
    "msg": "Hello Bob!",
    "type": "text",
    "link": null,
    "postId": 0,
    "ReplyTOMsgUid": "null"
  }
  ```
- **Server Routing Logic**:
  1. Resolves `receiverSocketId = getSocketId(data.receiverUuid)`.
  2. If receiver is connected (`receiverSocketId != null`):
     - Emits `StoC` to receiver socket ID with identical chat envelope.
     - Emits `MsgStatusUpdate` back to sender socket:
       ```json
       { "MsgUid": "8e3c79a4-...", "deliveryStatus": 1 }
       ```
     - Persists record into MySQL `messages` table with `deliveryStatus = 1`.
  3. If receiver is disconnected:
     - Persists record into MySQL with `deliveryStatus = 1`.
     - Queries receiver's `fcmToken` from MySQL `users` table via `userRepo.getBasicUserDetailsFromUUid()`.
     - Dispatches background push notification through Firebase Admin SDK (`fcmService.sendMessageNotification()`).

### D. Delivery Acknowledgment (`notifyReceivedToSender`)
- **Direction**: Client (Receiver) -> Server -> Client (Sender)
- **Payload**: `{"senderUUid": "alice-uuid", "msgUid": "8e3c79a4-..."}`
- **Server Action**:
  - Updates MySQL `messages` record to `deliveryStatus = 2` (Delivered).
  - Resolves `senderSocketId = getSocketId(data.senderUUid)`.
  - If sender is connected, emits `msg_status_changed_event` to sender:
    ```json
    { "MsgUid": "8e3c79a4-...", "deliveryStatus": 2 }
    ```

### E. Read Receipts (`update_seen_msg_status`)
- **Direction**: Client (Reader) -> Server -> Client (Sender)
- **Payload**:
  ```json
  {
    "senderUUid": "alice-uuid",
    "myUserid": "bob_w",
    "uids": ["uid1", "uid2"]
  }
  ```
- **Server Action**:
  - Updates MySQL `messages` records to `deliveryStatus = 3` (Seen).
  - Forwards `msg_status_changed_event` with `deliveryStatus: 3` to sender's socket.

### F. Post & Story Impressions (`postViewed` & `StoryViewed`)
- **Direction**: Client -> Server
- **`postViewed` Payload**: `{"uuid": "...", "userid": "...", "postid": 1042}`
  - Inserts into table `postview (userid, uuid, postid)`.
- **`StoryViewed` Payload**: `{"uuid": "...", "userid": "...", "storyid": 204}`
  - Inserts into table `storyview (userid, uuid, storyid)`.

---

## 3. Firebase Cloud Messaging (FCM) Integration

Managed in `src/services/fcmService.ts` via Google `firebase-admin`:
- **Initialization**: Triggered on server boot via `fcmService.StartServiceFcm()`.
- **Credential**: Loads Firebase service account JSON from environment configuration.
- **Message Dispatch Pattern**:
  ```typescript
  const message = {
      token: fcmToken,
      data: {
          responseType: "chat",
          senderUuid: data.senderUuid,
          receiverUuid: data.receiverUuid,
          MsgUid: data.MsgUid,
          msg: data.msg,
          type: data.type,
          timestamp: data.timestamp
      }
  };
  await admin.messaging().send(message);
  ```
- **Push Payload Types**: All push messages are sent as high-priority data messages (`data` key), allowing the mobile device to process the record in background without forcing static UI notifications.
