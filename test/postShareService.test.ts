import { describe, it, mock } from "node:test";
import assert from "assert";
import PostShareService from "../src/services/postShareService.ts";

function createMockPostShareRepo(overrides: Record<string, any> = {}) {
  return {
    addShareRecord: mock.fn(async () => ({ insertId: 1 })),
    ...overrides,
  } as any;
}

describe("PostShareService", () => {
  describe("sharePost", () => {
    it("should delegate to postShareRepo.addShareRecord with correct args", async () => {
      const repo = createMockPostShareRepo();
      const service = new PostShareService(repo);
      await service.sharePost("sender1", "receiver1", "postXYZ");
      assert.strictEqual(repo.addShareRecord.mock.callCount(), 1);
      assert.deepStrictEqual(repo.addShareRecord.mock.calls[0].arguments, ["sender1", "receiver1", "postXYZ"]);
    });

    it("should return the repo response", async () => {
      const repo = createMockPostShareRepo({
        addShareRecord: mock.fn(async () => ({ insertId: 7 })),
      });
      const service = new PostShareService(repo);
      const result = await service.sharePost("s1", "r1", "p1");
      assert.deepStrictEqual(result, { insertId: 7 });
    });
  });
});
