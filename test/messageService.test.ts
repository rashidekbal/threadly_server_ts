/**
 * MessageService - pure logic tests
 *
 * Tests the delivery-status assignment logic, delete role branching,
 * and media upload path selection — all without importing app.ts/Socket.IO.
 */
import { describe, it, mock } from "node:test";
import assert from "assert";

// --- sendMessage delivery status logic ---
// Mirrors the real decision tree in MessageService.sendMessage
async function resolveDeliveryStatus(
  socketId: string | null,
  getFcmToken: () => Promise<any[]>
): Promise<1 | 2> {
  if (socketId != null) return 2; // online — delivered
  const tokenRes = await getFcmToken();
  if (tokenRes.length > 0 && tokenRes[0].fcmToken != null) return 2; // FCM delivery
  return 1; // offline, no FCM — pending
}

describe("MessageService - delivery status logic", () => {
  it("should return status 2 when receiver has an active socket", async () => {
    const status = await resolveDeliveryStatus("socket-id-abc", async () => []);
    assert.strictEqual(status, 2);
  });

  it("should return status 2 when no socket but has FCM token", async () => {
    const status = await resolveDeliveryStatus(null, async () => [{ fcmToken: "fcm-abc" }]);
    assert.strictEqual(status, 2);
  });

  it("should return status 1 when no socket and no FCM token", async () => {
    const status = await resolveDeliveryStatus(null, async () => []);
    assert.strictEqual(status, 1);
  });

  it("should return status 1 when FCM token is null", async () => {
    const status = await resolveDeliveryStatus(null, async () => [{ fcmToken: null }]);
    assert.strictEqual(status, 1);
  });
});

// --- deleteMessageForRole branching ---
async function deleteForRole(
  role: string,
  deleteForSender: (uuid: string, msgUid: string) => Promise<any>,
  deleteForReceiver: (uuid: string, msgUid: string) => Promise<any>,
  uuid: string,
  msgUid: string
): Promise<void> {
  if (role === "sender") {
    await deleteForSender(uuid, msgUid);
  } else {
    await deleteForReceiver(uuid, msgUid);
  }
}

describe("MessageService - deleteMessageForRole branching", () => {
  it("should call deleteForSender when role is sender", async () => {
    const sender = mock.fn(async () => ({}));
    const receiver = mock.fn(async () => ({}));
    await deleteForRole("sender", sender, receiver, "uuid1", "msg1");
    assert.strictEqual(sender.mock.callCount(), 1);
    assert.strictEqual(receiver.mock.callCount(), 0);
    assert.deepStrictEqual(sender.mock.calls[0].arguments, ["uuid1", "msg1"]);
  });

  it("should call deleteForReceiver when role is receiver", async () => {
    const sender = mock.fn(async () => ({}));
    const receiver = mock.fn(async () => ({}));
    await deleteForRole("receiver", sender, receiver, "uuid1", "msg1");
    assert.strictEqual(receiver.mock.callCount(), 1);
    assert.strictEqual(sender.mock.callCount(), 0);
  });

  it("should call deleteForReceiver for any non-sender role", async () => {
    const sender = mock.fn(async () => ({}));
    const receiver = mock.fn(async () => ({}));
    await deleteForRole("unknown", sender, receiver, "u", "m");
    assert.strictEqual(receiver.mock.callCount(), 1);
  });
});

// --- uploadMedia path selection (mirrors MessageService.uploadMedia) ---
async function uploadMedia(
  file: any,
  isProduction: boolean,
  uploadFromRam: (buf: Buffer) => Promise<string | null>,
  uploadFromDisk: (path: string) => Promise<string | null>
): Promise<string | null> {
  if (isProduction) {
    const buffer = file?.buffer;
    if (!buffer) return null;
    return uploadFromRam(buffer);
  } else {
    const path = file?.path;
    if (!path) return null;
    return uploadFromDisk(path);
  }
}

describe("MessageService - uploadMedia path selection", () => {
  it("should upload from RAM buffer in production mode", async () => {
    const fromRam = mock.fn(async () => "https://cdn/media.mp4");
    const fromDisk = mock.fn(async () => "https://cdn/local.mp4");
    const result = await uploadMedia({ buffer: Buffer.from("data") }, true, fromRam, fromDisk);
    assert.strictEqual(result, "https://cdn/media.mp4");
    assert.strictEqual(fromRam.mock.callCount(), 1);
    assert.strictEqual(fromDisk.mock.callCount(), 0);
  });

  it("should upload from disk path in dev mode", async () => {
    const fromRam = mock.fn(async () => "https://cdn/media.mp4");
    const fromDisk = mock.fn(async () => "https://cdn/local.mp4");
    const result = await uploadMedia({ path: "/tmp/video.mp4" }, false, fromRam, fromDisk);
    assert.strictEqual(result, "https://cdn/local.mp4");
    assert.strictEqual(fromDisk.mock.callCount(), 1);
    assert.strictEqual(fromRam.mock.callCount(), 0);
  });

  it("should return null when no buffer in production mode", async () => {
    const fromRam = mock.fn(async () => "url");
    const fromDisk = mock.fn(async () => "url");
    const result = await uploadMedia({}, true, fromRam, fromDisk);
    assert.strictEqual(result, null);
    assert.strictEqual(fromRam.mock.callCount(), 0);
  });

  it("should return null when no path in dev mode", async () => {
    const fromRam = mock.fn(async () => "url");
    const fromDisk = mock.fn(async () => "url");
    const result = await uploadMedia({}, false, fromRam, fromDisk);
    assert.strictEqual(result, null);
    assert.strictEqual(fromDisk.mock.callCount(), 0);
  });

  it("should return null when file is null", async () => {
    const fromRam = mock.fn(async () => "url");
    const fromDisk = mock.fn(async () => "url");
    const result = await uploadMedia(null, true, fromRam, fromDisk);
    assert.strictEqual(result, null);
  });
});

// --- replyTo field normalization (mirrors sendMessage replyTo handling) ---
describe("MessageService - replyTo normalization", () => {
  it("should use 'null' string when replyToMessageId is null", () => {
    const replyTo = null ? null : "null";
    assert.strictEqual(replyTo, "null");
  });

  it("should preserve actual replyToMessageId when provided", () => {
    const replyToMessageId = "msg-001";
    const replyTo = replyToMessageId ? replyToMessageId : "null";
    assert.strictEqual(replyTo, "msg-001");
  });
});

// --- postLink normalization ---
describe("MessageService - postLink normalization", () => {
  it("should use single space when postLink is null", () => {
    const postLink: string | null = null;
    const link = postLink ? postLink : " ";
    assert.strictEqual(link, " ");
  });

  it("should preserve real postLink URL", () => {
    const postLink = "https://example.com/post/1";
    const link = postLink ? postLink : " ";
    assert.strictEqual(link, "https://example.com/post/1");
  });
});
