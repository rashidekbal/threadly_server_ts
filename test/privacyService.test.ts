import { describe, it, mock } from "node:test";
import assert from "assert";
import PrivacyService from "../src/services/PrivacyService.ts";

function createMockUserRepo(overrides: Record<string, any> = {}) {
  return {
    getUserPrivacyInfo: mock.fn(async () => [{ isPrivate: 0 }]),
    setUserAccountPrivacyStatus: mock.fn(async () => ({})),
    ...overrides,
  } as any;
}

describe("PrivacyService", () => {
  describe("isUserPrivate", () => {
    it("should return false when isPrivate=0", async () => {
      const repo = createMockUserRepo({ getUserPrivacyInfo: mock.fn(async () => [{ isPrivate: 0 }]) });
      const service = new PrivacyService(repo);
      const result = await service.isUserPrivate("user1");
      assert.strictEqual(result, false);
    });

    it("should return true when isPrivate=1", async () => {
      const repo = createMockUserRepo({ getUserPrivacyInfo: mock.fn(async () => [{ isPrivate: 1 }]) });
      const service = new PrivacyService(repo);
      const result = await service.isUserPrivate("user1");
      assert.strictEqual(result, true);
    });

    it("should reject (throw) when user not found (empty array)", async () => {
      const repo = createMockUserRepo({ getUserPrivacyInfo: mock.fn(async () => []) });
      const service = new PrivacyService(repo);
      await assert.rejects(() => service.isUserPrivate("nonexistent"));
    });
  });

  describe("setUserPrivacy", () => {
    it("should call setUserAccountPrivacyStatus with true (private)", () => {
      const repo = createMockUserRepo();
      const service = new PrivacyService(repo);
      service.setUserPrivacy("user1", true);
      assert.strictEqual(repo.setUserAccountPrivacyStatus.mock.callCount(), 1);
      assert.deepStrictEqual(repo.setUserAccountPrivacyStatus.mock.calls[0].arguments, ["user1", true]);
    });

    it("should call setUserAccountPrivacyStatus with false (public)", () => {
      const repo = createMockUserRepo();
      const service = new PrivacyService(repo);
      service.setUserPrivacy("user1", false);
      assert.deepStrictEqual(repo.setUserAccountPrivacyStatus.mock.calls[0].arguments, ["user1", false]);
    });
  });
});
