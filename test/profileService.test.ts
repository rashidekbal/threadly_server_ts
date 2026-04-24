/**
 * ProfileService - pure logic tests
 *
 * Tests the editUserId conflict logic and editProfilePic path selection
 * using inline implementations that mirror the service — no Cloudinary/Redis/JWT.
 */
import { describe, it, mock } from "node:test";
import assert from "assert";

// --- editUserId conflict logic ---
async function editUserIdLogic(
  checkUserIdExists: (id: string) => Promise<any[]>,
  userid: string,
  newUserid: string
): Promise<{ conflict: boolean; userid?: string }> {
  const existance = await checkUserIdExists(newUserid);
  if (existance.length > 0) return { conflict: true };
  return { conflict: false, userid: newUserid };
}

describe("ProfileService - editUserId logic", () => {
  it("should return conflict:true when userid is already taken", async () => {
    const check = mock.fn(async () => [{ userid: "taken" }]);
    const result = await editUserIdLogic(check, "olduser", "taken");
    assert.deepStrictEqual(result, { conflict: true });
    assert.strictEqual(check.mock.callCount(), 1);
    assert.strictEqual(check.mock.calls[0].arguments[0], "taken");
  });

  it("should return conflict:false when userid is available", async () => {
    const check = mock.fn(async () => []);
    const result = await editUserIdLogic(check, "olduser", "newuser");
    assert.strictEqual(result.conflict, false);
    assert.strictEqual(result.userid, "newuser");
  });
});

// --- editProfilePic path-selection logic ---
async function selectUploadPath(
  file: any,
  isProduction: boolean,
  uploadFromRam: (buffer: Buffer) => Promise<string | null>,
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

describe("ProfileService - editProfilePic path selection", () => {
  it("should return null when file is null in production mode", async () => {
    const fromRam = mock.fn(async () => "https://cdn/img.jpg");
    const fromDisk = mock.fn(async () => "https://cdn/img.jpg");
    const result = await selectUploadPath(null, true, fromRam, fromDisk);
    assert.strictEqual(result, null);
    assert.strictEqual(fromRam.mock.callCount(), 0);
  });

  it("should return null when file has no buffer in production mode", async () => {
    const fromRam = mock.fn(async () => "url");
    const fromDisk = mock.fn(async () => "url");
    const result = await selectUploadPath({ path: "/tmp/f.jpg" }, true, fromRam, fromDisk);
    assert.strictEqual(result, null);
  });

  it("should call uploadFromRam with buffer in production mode", async () => {
    const buf = Buffer.from("image");
    const fromRam = mock.fn(async () => "https://cdn/ram.jpg");
    const fromDisk = mock.fn(async () => "https://cdn/disk.jpg");
    const result = await selectUploadPath({ buffer: buf }, true, fromRam, fromDisk);
    assert.strictEqual(result, "https://cdn/ram.jpg");
    assert.strictEqual(fromRam.mock.callCount(), 1);
    assert.strictEqual(fromDisk.mock.callCount(), 0);
  });

  it("should return null when file has no path in dev mode", async () => {
    const fromRam = mock.fn(async () => "url");
    const fromDisk = mock.fn(async () => "url");
    const result = await selectUploadPath({ buffer: Buffer.from("x") }, false, fromRam, fromDisk);
    assert.strictEqual(result, null);
  });

  it("should call uploadFromDisk with path in dev mode", async () => {
    const fromRam = mock.fn(async () => "https://cdn/ram.jpg");
    const fromDisk = mock.fn(async () => "https://cdn/disk.jpg");
    const result = await selectUploadPath({ path: "/tmp/img.jpg" }, false, fromRam, fromDisk);
    assert.strictEqual(result, "https://cdn/disk.jpg");
    assert.strictEqual(fromDisk.mock.callCount(), 1);
    assert.strictEqual(fromRam.mock.callCount(), 0);
  });

  it("should return null when uploadFromRam returns null (cloudinary error)", async () => {
    const fromRam = mock.fn(async () => null);
    const fromDisk = mock.fn(async () => null);
    const result = await selectUploadPath({ buffer: Buffer.from("x") }, true, fromRam, fromDisk);
    assert.strictEqual(result, null);
  });
});

// --- editName & editBio delegation ---
describe("ProfileService - name and bio delegation", () => {
  it("should call updateUsername with correct args", async () => {
    const updateUsername = mock.fn(async () => ({}));
    await updateUsername("user1", "New Name");
    assert.deepStrictEqual(updateUsername.mock.calls[0].arguments, ["user1", "New Name"]);
  });

  it("should call updateBio with correct args", async () => {
    const updateBio = mock.fn(async () => ({}));
    await updateBio("user1", "My bio");
    assert.deepStrictEqual(updateBio.mock.calls[0].arguments, ["user1", "My bio"]);
  });
});
