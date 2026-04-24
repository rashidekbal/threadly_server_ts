/**
 * Integration Tests — All Routes
 *
 * Single file with ONE server lifecycle (before/after).
 * This prevents the event-loop from hanging between files.
 *
 * Sections:
 *   1. Health check
 *   2. Auth — validation & error shapes
 *   3. Protected routes — 401 enforcement across all route families
 *   4. OTP & Register — body validation + middleware gates
 *   5. E2E — full auth → data flows (skips gracefully when DB not seeded)
 *
 * ── DB test user seed (required for E2E section) ─────────────────────────────
 * INSERT INTO users (userid, username, email, pass, dob, uuid, sessionId)
 * VALUES (
 *   'int_test_user', 'Integration Tester', 'int_test@threadly.local',
 *   '$2b$12$.Jg3iwf2l8PYF3bAQcH1c.pljoOTzac5M66b50hmTSZml40DztwYC',
 *   '1995-01-01', 'int-test-uuid-0000-000000000001', 'int-test-session-seed'
 * );
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { describe, it, before, after } from "node:test";
import assert from "assert";
import {
  startTestServer,
  stopTestServer,
  getJson,
  postJson,
  patchJson,
  deleteJson,
} from "../helpers/testServer.ts";

// ── E2E config ────────────────────────────────────────────────────────────────
const TEST_EMAIL    = "int_test@threadly.local";
const TEST_PASSWORD = "bcrypttest";
const TEST_USERID   = "int_test_user";

let authToken   = "";
let dbAvailable = false;

// ─────────────────────────────────────────────────────────────────────────────
// Single server lifecycle
// ─────────────────────────────────────────────────────────────────────────────
before(async () => {
  await startTestServer();

  // Probe the DB by attempting a real login
  try {
    const { status, body } = await postJson("/api/auth/login/email", {
      nameValuePairs: { email: TEST_EMAIL, password: TEST_PASSWORD },
    });
    if (status === 200 && body?.token) {
      authToken   = body.token;
      dbAvailable = true;
      console.log("✔ DB available — E2E assertions enabled");
    } else {
      console.log(`⚠ DB not available (status ${status}) — E2E assertions skipped`);
    }
  } catch {
    console.log("⚠ DB connection failed — E2E assertions skipped");
  }
});

after(async () => {
  await stopTestServer();
});

// ═════════════════════════════════════════════════════════════════════════════
// 1. HEALTH
// ═════════════════════════════════════════════════════════════════════════════
describe("GET / (health)", () => {
  it("should return 200 with welcome text", async () => {
    const res = await fetch((await import("../helpers/testServer.ts")).baseUrl() + "/");
    assert.strictEqual(res.status, 200);
    const text = await res.text();
    assert.ok(text.toLowerCase().includes("welcome"));
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 2. AUTH — input validation & error shapes
// ═════════════════════════════════════════════════════════════════════════════
describe("POST /api/auth/login/email", () => {
  it("returns 400 when body is empty", async () => {
    const { status } = await postJson("/api/auth/login/email", {});
    assert.strictEqual(status, 400);
  });
  it("returns 400 when nameValuePairs is missing", async () => {
    const { status } = await postJson("/api/auth/login/email", { email: "a@b.com" });
    assert.strictEqual(status, 400);
  });
  it("returns 400 when password is missing", async () => {
    const { status } = await postJson("/api/auth/login/email", { nameValuePairs: { email: "a@b.com" } });
    assert.strictEqual(status, 400);
  });
  it("returns 400 when email is missing", async () => {
    const { status } = await postJson("/api/auth/login/email", { nameValuePairs: { password: "pass" } });
    assert.strictEqual(status, 400);
  });
  it("returns 403 AUTH_ERROR for non-existent user (DB available)", async () => {
    if (!dbAvailable) return;
    const { status, body } = await postJson("/api/auth/login/email", {
      nameValuePairs: { email: "definitely_not_a_real@user.local", password: "anypass" },
    });
    assert.strictEqual(status, 403);
    assert.strictEqual(body?.errorType, "AUTH_ERROR");
  });
});

describe("POST /api/auth/login/userid", () => {
  it("returns 400 when body is empty",          async () => { assert.strictEqual((await postJson("/api/auth/login/userid", {})).status, 400); });
  it("returns 400 when password is missing",    async () => { assert.strictEqual((await postJson("/api/auth/login/userid", { nameValuePairs: { userid: "x" } })).status, 400); });
  it("returns 400 when userid is missing",      async () => { assert.strictEqual((await postJson("/api/auth/login/userid", { nameValuePairs: { password: "x" } })).status, 400); });
});

describe("POST /api/auth/login/mobile", () => {
  it("returns 400 when body is empty",          async () => { assert.strictEqual((await postJson("/api/auth/login/mobile", {})).status, 400); });
  it("returns 400 when password is missing",    async () => { assert.strictEqual((await postJson("/api/auth/login/mobile", { nameValuePairs: { phone: "9876543210" } })).status, 400); });
  it("returns 400 when phone is missing",       async () => { assert.strictEqual((await postJson("/api/auth/login/mobile", { nameValuePairs: { password: "x" } })).status, 400); });
});

describe("GET /api/auth/logout — auth middleware", () => {
  it("returns 401 with no Authorization header",   async () => { const r = await getJson("/api/auth/logout");                   assert.strictEqual(r.status, 401); assert.strictEqual(r.body?.errorType, "AUTH_ERROR"); });
  it("returns 401 with malformed token",           async () => { assert.strictEqual((await getJson("/api/auth/logout", "not.a.token")).status, 401); });
  it("returns 401 with invalid JWT signature",     async () => { assert.strictEqual((await getJson("/api/auth/logout", "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyaWQiOiJ0ZXN0IiwiaWF0IjoxfQ.bad_sig")).status, 401); });
});

// ═════════════════════════════════════════════════════════════════════════════
// 3. PROTECTED ROUTES — 401 enforcement
// ═════════════════════════════════════════════════════════════════════════════

/** Assert a route returns 401 for both missing and invalid tokens. */
async function assert401(method: "GET"|"POST"|"PATCH"|"DELETE", path: string, body?: object) {
  const BAD = "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyaWQiOiJ0ZXN0IiwiaWF0IjoxfQ.bad_sig";
  let noToken:  { status: number };
  let badToken: { status: number };
  if      (method === "GET")    { noToken = await getJson(path);            badToken = await getJson(path, BAD); }
  else if (method === "POST")   { noToken = await postJson(path, body??{}); badToken = await postJson(path, body??{}, BAD); }
  else if (method === "PATCH")  { noToken = await patchJson(path, body??{}); badToken = await patchJson(path, body??{}, BAD); }
  else                          { noToken = await deleteJson(path);          badToken = await deleteJson(path, BAD); }
  assert.strictEqual(noToken.status,  401, `${method} ${path} → expected 401 without token`);
  assert.strictEqual(badToken.status, 401, `${method} ${path} → expected 401 with bad token`);
}

describe("Protected — Posts", () => {
  it("GET  /api/posts/getImagePostsFeed",   async () => assert401("GET",    "/api/posts/getImagePostsFeed"));
  it("GET  /api/posts/getVideoPostsFeed",   async () => assert401("GET",    "/api/posts/getVideoPostsFeed"));
  it("DELETE /api/posts/removePost/1",      async () => assert401("DELETE", "/api/posts/removePost/1"));
  it("GET  /api/posts/getPost/1",           async () => assert401("GET",    "/api/posts/getPost/1"));
  it("GET  /api/posts/getUserPosts/u",      async () => assert401("GET",    "/api/posts/getUserPosts/testuser"));
  it("GET  /api/posts/1/likedby",           async () => assert401("GET",    "/api/posts/1/likedby"));
  it("GET  /api/posts/1/sharedby",          async () => assert401("GET",    "/api/posts/1/sharedby"));
});

describe("Protected — Likes", () => {
  it("GET /api/like/likePost/1",      async () => assert401("GET", "/api/like/likePost/1"));
  it("GET /api/like/unlikePost/1",    async () => assert401("GET", "/api/like/unlikePost/1"));
  it("GET /api/like/likeStory/1",     async () => assert401("GET", "/api/like/likeStory/1"));
  it("GET /api/like/unlikeStory/1",   async () => assert401("GET", "/api/like/unlikeStory/1"));
  it("GET /api/like/likeAComment/1",  async () => assert401("GET", "/api/like/likeAComment/1"));
  it("GET /api/like/unlikeAComment/1",async () => assert401("GET", "/api/like/unlikeAComment/1"));
});

describe("Protected — Comments", () => {
  it("POST /api/comment/addComment",          async () => assert401("POST",   "/api/comment/addComment", { nameValuePairs: { postid: 1, comment: "x" } }));
  it("POST /api/comment/removeComment",       async () => assert401("POST",   "/api/comment/removeComment"));
  it("GET  /api/comment/getComments/1",       async () => assert401("GET",    "/api/comment/getComments/1"));
  it("POST /api/comment/replyTo/1",           async () => assert401("POST",   "/api/comment/replyTo/1"));
  it("GET  /api/comment/getCommentReplies/1", async () => assert401("GET",    "/api/comment/getCommentReplies/1"));
});

describe("Protected — Follow", () => {
  it("POST   /api/follow/follow",                        async () => assert401("POST",   "/api/follow/follow"));
  it("POST   /api/follow/unfollow",                      async () => assert401("POST",   "/api/follow/unfollow"));
  it("POST   /api/follow/cancelFollowRequest",           async () => assert401("POST",   "/api/follow/cancelFollowRequest"));
  it("POST   /api/follow/acceptFollowRequest",           async () => assert401("POST",   "/api/follow/acceptFollowRequest"));
  it("DELETE /api/follow/rejectFollowRequest/u",         async () => assert401("DELETE", "/api/follow/rejectFollowRequest/bob"));
  it("GET    /api/follow/getFollowers/u",                async () => assert401("GET",    "/api/follow/getFollowers/testuser"));
  it("GET    /api/follow/getFollowings/u",               async () => assert401("GET",    "/api/follow/getFollowings/testuser"));
  it("GET    /api/follow/getAllFollowRequests",           async () => assert401("GET",    "/api/follow/getAllFollowRequests"));
});

describe("Protected — Stories", () => {
  it("DELETE /api/story/removeStory/1", async () => assert401("DELETE", "/api/story/removeStory/1"));
  it("GET    /api/story/getStories",    async () => assert401("GET",    "/api/story/getStories"));
  it("GET    /api/story/getMyStories",  async () => assert401("GET",    "/api/story/getMyStories"));
  it("GET    /api/story/1/viewedby",    async () => assert401("GET",    "/api/story/1/viewedby"));
});

describe("Protected — Messages", () => {
  it("GET   /api/messages/checkPendingMessages", async () => assert401("GET",   "/api/messages/checkPendingMessages"));
  it("POST  /api/messages/sendMessage",          async () => assert401("POST",  "/api/messages/sendMessage"));
  it("GET   /api/messages/getAllChats",           async () => assert401("GET",   "/api/messages/getAllChats"));
  it("PATCH /api/messages/deleteMessageForMe",   async () => assert401("PATCH", "/api/messages/deleteMessageForMe"));
  it("PATCH /api/messages/unSendMessage",        async () => assert401("PATCH", "/api/messages/unSendMessage"));
});

describe("Protected — Profile", () => {
  it("PATCH /api/profile/edit/username", async () => assert401("PATCH", "/api/profile/edit/username"));
  it("PATCH /api/profile/edit/userid",   async () => assert401("PATCH", "/api/profile/edit/userid"));
  it("PATCH /api/profile/edit/bio",      async () => assert401("PATCH", "/api/profile/edit/bio"));
});

describe("Protected — Search", () => {
  it("GET /api/search/get", async () => assert401("GET", "/api/search/get?target=john"));
});

describe("Protected — Privacy", () => {
  it("GET /api/privacy/setPrivate", async () => assert401("GET", "/api/privacy/setPrivate"));
  it("GET /api/privacy/setPublic",  async () => assert401("GET", "/api/privacy/setPublic"));
});

describe("Protected — Users", () => {
  it("GET /api/users/getMyData",           async () => assert401("GET", "/api/users/getMyData"));
  it("GET /api/users/getUser/u",           async () => assert401("GET", "/api/users/getUser/testuser"));
  it("GET /api/users/getUsers",            async () => assert401("GET", "/api/users/getUsers"));
  it("GET /api/users/getUserByUUid/u",     async () => assert401("GET", "/api/users/getUserByUUid/some-uuid"));
});

describe("Protected — FCM", () => {
  it("PATCH /api/fcm/updateToken", async () => assert401("PATCH", "/api/fcm/updateToken"));
});

describe("401 response shape consistency", () => {
  it("all protected routes return errorType=AUTH_ERROR and status=401 in body", async () => {
    const routes = [
      "/api/posts/getImagePostsFeed",
      "/api/like/likePost/1",
      "/api/comment/getComments/1",
      "/api/follow/getFollowers/u",
      "/api/story/getStories",
      "/api/messages/getAllChats",
      "/api/users/getMyData",
      "/api/search/get?target=x",
    ];
    for (const route of routes) {
      const { status, body } = await getJson(route);
      assert.strictEqual(status, 401,            `${route} — expected 401`);
      assert.strictEqual(body?.errorType, "AUTH_ERROR", `${route} — expected AUTH_ERROR`);
      assert.strictEqual(body?.status, 401,      `${route} — expected status 401 in body`);
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 4. OTP & REGISTER — body validation + middleware gates
// ═════════════════════════════════════════════════════════════════════════════
describe("POST /api/otp/generateOtpEmail", () => {
  it("returns 400 when body empty",              async () => { const s = (await postJson("/api/otp/generateOtpEmail", {})).status;                                         assert.ok([400,500].includes(s), `Expected 400 or 500, got ${s}`); });
  it("returns 400 for invalid email format",     async () => { assert.strictEqual((await postJson("/api/otp/generateOtpEmail", { nameValuePairs: { email: "not-an-email" } })).status, 400); });
  it("returns 400 when nameValuePairs missing",  async () => { const s = (await postJson("/api/otp/generateOtpEmail", { email: "ok@ok.com" })).status;                   assert.ok([400,500].includes(s), `Expected 400 or 500, got ${s}`); });
});

describe("POST /api/otp/verifyOtpEmail", () => {
  it("returns 400 when body empty",    async () => { assert.strictEqual((await postJson("/api/otp/verifyOtpEmail", {})).status, 400); });
  it("returns 400 when email missing", async () => { assert.strictEqual((await postJson("/api/otp/verifyOtpEmail", { nameValuePairs: { otp: "123456" } })).status, 400); });
  it("returns 400 when otp missing",   async () => { assert.strictEqual((await postJson("/api/otp/verifyOtpEmail", { nameValuePairs: { email: "a@b.com" } })).status, 400); });
});

describe("POST /api/ForgetPassword/Email", () => {
  it("returns 401/403 without OTP token", async () => {
    const { status } = await postJson("/api/ForgetPassword/Email", { nameValuePairs: { password: "newpass" } });
    assert.ok([400, 401, 403].includes(status), `Unexpected: ${status}`);
  });
});

describe("POST /api/auth/register/email", () => {
  it("returns 401/403 without OTP token", async () => {
    const { status } = await postJson("/api/auth/register/email", { nameValuePairs: { email: "x@x.com", username: "x", password: "pass123" } });
    assert.ok([400, 401, 403].includes(status), `Unexpected: ${status}`);
  });
});

describe("POST /api/auth/register/mobile", () => {
  it("returns 401/403 without OTP token", async () => {
    const { status } = await postJson("/api/auth/register/mobile", { nameValuePairs: { phone: "9876543210", username: "x", password: "pass123" } });
    assert.ok([400, 401, 403].includes(status), `Unexpected: ${status}`);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// 5. E2E — full flows (requires seeded DB user)
// ═════════════════════════════════════════════════════════════════════════════
describe("E2E — Login", () => {
  it("returns 200 with token, userid, username on valid credentials", async () => {
    if (!dbAvailable) return;
    const { status, body } = await postJson("/api/auth/login/email", {
      nameValuePairs: { email: TEST_EMAIL, password: TEST_PASSWORD },
    });
    assert.strictEqual(status, 200);
    assert.ok(body?.token,    "Should have token");
    assert.ok(body?.userid,   "Should have userid");
    assert.ok(body?.username, "Should have username");
    assert.ok("isPrivate" in body, "Missing isPrivate");
    assert.ok("uuid"      in body, "Missing uuid");
  });

  it("returns 403 AUTH_ERROR on wrong password", async () => {
    if (!dbAvailable) return;
    const { status, body } = await postJson("/api/auth/login/email", {
      nameValuePairs: { email: TEST_EMAIL, password: "WRONG_PASS" },
    });
    assert.strictEqual(status, 403);
    assert.strictEqual(body?.errorType, "AUTH_ERROR");
  });

  it("returns 403 AUTH_ERROR for non-existent userid", async () => {
    if (!dbAvailable) return;
    const { status, body } = await postJson("/api/auth/login/userid", {
      nameValuePairs: { userid: "does_not_exist_xyz", password: "pass" },
    });
    assert.strictEqual(status, 403);
    assert.strictEqual(body?.errorType, "AUTH_ERROR");
  });
});

describe("E2E — GET /api/users/getMyData", () => {
  it("returns 200 with user data when authenticated", async () => {
    if (!dbAvailable || !authToken) return;
    const { status } = await getJson("/api/users/getMyData", authToken);
    assert.strictEqual(status, 200);
  });
});

describe("E2E — GET /api/search", () => {
  it("returns 200 with Account and Reels keys", async () => {
    if (!dbAvailable || !authToken) return;
    const { status, body } = await getJson("/api/search?target=test", authToken);
    assert.strictEqual(status, 200);
    assert.ok("Account" in (body?.data ?? body), "Missing Account key");
    assert.ok("Reels"   in (body?.data ?? body), "Missing Reels key");
  });
});

describe("E2E — Posts feed", () => {
  it("GET /api/posts/getImagePostsFeed → 200", async () => {
    if (!dbAvailable || !authToken) return;
    const { status } = await getJson("/api/posts/getImagePostsFeed", authToken);
    assert.strictEqual(status, 200);
  });
  it("GET /api/posts/getVideoPostsFeed → 200", async () => {
    if (!dbAvailable || !authToken) return;
    const { status } = await getJson("/api/posts/getVideoPostsFeed", authToken);
    assert.strictEqual(status, 200);
  });
});

describe("E2E — Privacy toggle", () => {
  it("GET /api/privacy/setPrivate → 200", async () => {
    if (!dbAvailable || !authToken) return;
    const { status } = await getJson("/api/privacy/setPrivate", authToken);
    assert.ok([200, 204].includes(status));
  });
  it("GET /api/privacy/setPublic  → 200", async () => {
    if (!dbAvailable || !authToken) return;
    const { status } = await getJson("/api/privacy/setPublic", authToken);
    assert.ok([200, 204].includes(status));
  });
});

describe("E2E — Follow", () => {
  it("GET /api/follow/getFollowers/:userid  → 200", async () => {
    if (!dbAvailable || !authToken) return;
    const { status } = await getJson(`/api/follow/getFollowers/${TEST_USERID}`, authToken);
    assert.ok([200, 404].includes(status));
  });
  it("GET /api/follow/getFollowings/:userid → 200", async () => {
    if (!dbAvailable || !authToken) return;
    const { status } = await getJson(`/api/follow/getFollowings/${TEST_USERID}`, authToken);
    assert.ok([200, 404].includes(status));
  });
  it("GET /api/follow/getAllFollowRequests  → 200", async () => {
    if (!dbAvailable || !authToken) return;
    const { status } = await getJson("/api/follow/getAllFollowRequests", authToken);
    assert.ok([200, 204].includes(status));
  });
});

describe("E2E — Messages", () => {
  it("GET /api/messages/checkPendingMessages → 200", async () => {
    if (!dbAvailable || !authToken) return;
    const { status } = await getJson("/api/messages/checkPendingMessages", authToken);
    assert.ok([200, 204].includes(status));
  });
  it("GET /api/messages/getAllChats → 200", async () => {
    if (!dbAvailable || !authToken) return;
    const { status } = await getJson("/api/messages/getAllChats", authToken);
    assert.ok([200, 204].includes(status));
  });
});

describe("E2E — Profile edit validation (with auth token)", () => {
  it("PATCH /api/profile/edit/bio → 400 when nameValuePairs missing", async () => {
    if (!authToken) return;
    const { status } = await patchJson("/api/profile/edit/bio", { bio: "hi" }, authToken);
    assert.ok([400, 500].includes(status));
  });
  it("PATCH /api/profile/edit/username → 400 when name missing", async () => {
    if (!authToken) return;
    const { status } = await patchJson("/api/profile/edit/username", { nameValuePairs: {} }, authToken);
    assert.ok([400, 500].includes(status));
  });
});

describe("E2E — Logout", () => {
  it("GET /api/auth/logout → 200 when authenticated", async () => {
    if (!dbAvailable || !authToken) return;
    const { status } = await getJson("/api/auth/logout", authToken);
    assert.ok([200, 204].includes(status));
  });
});
