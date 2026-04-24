import { describe, it, mock } from "node:test";
import assert from "assert";
import PostStatsService from "../src/services/postStatsService.ts";

function createMockPostStatsRepo(overrides: Record<string, any> = {}) {
  return {
    getLikedByUsers: mock.fn(async () => []),
    getStoryViewedByUsers: mock.fn(async () => []),
    getSharedByUsers: mock.fn(async () => []),
    ...overrides,
  } as any;
}

describe("PostStatsService", () => {
  describe("getLikedByUsers", () => {
    it("should pass offset=0 for page=1", async () => {
      const repo = createMockPostStatsRepo({ getLikedByUsers: mock.fn(async () => [{ userid: "u1" }]) });
      const service = new PostStatsService(repo);
      await service.getLikedByUsers("42", "1");
      // offset = (1-1)*100 = 0
      assert.deepStrictEqual(repo.getLikedByUsers.mock.calls[0].arguments, ["42", 0]);
    });

    it("should pass offset=100 for page=2", async () => {
      const repo = createMockPostStatsRepo();
      const service = new PostStatsService(repo);
      await service.getLikedByUsers("42", "2");
      // offset = (2-1)*100 = 100
      assert.deepStrictEqual(repo.getLikedByUsers.mock.calls[0].arguments, ["42", 100]);
    });

    it("should pass offset=0 for undefined page", async () => {
      const repo = createMockPostStatsRepo();
      const service = new PostStatsService(repo);
      await service.getLikedByUsers("42", undefined);
      assert.deepStrictEqual(repo.getLikedByUsers.mock.calls[0].arguments, ["42", 0]);
    });

    it("should return data from repo", async () => {
      const mockData = [{ userid: "a" }];
      const repo = createMockPostStatsRepo({ getLikedByUsers: mock.fn(async () => mockData) });
      const service = new PostStatsService(repo);
      const result = await service.getLikedByUsers("1", "1");
      assert.deepStrictEqual(result, mockData);
    });
  });

  describe("getStoryViewedByUsers", () => {
    it("should pass correct args with offset=0 for page=1", async () => {
      const repo = createMockPostStatsRepo();
      const service = new PostStatsService(repo);
      await service.getStoryViewedByUsers("user1", "storyA", "1");
      assert.deepStrictEqual(repo.getStoryViewedByUsers.mock.calls[0].arguments, ["user1", "storyA", 0]);
    });

    it("should pass offset=200 for page=3", async () => {
      const repo = createMockPostStatsRepo();
      const service = new PostStatsService(repo);
      await service.getStoryViewedByUsers("user1", "storyA", "3");
      assert.deepStrictEqual(repo.getStoryViewedByUsers.mock.calls[0].arguments, ["user1", "storyA", 200]);
    });
  });

  describe("getSharedByUsers", () => {
    it("should delegate with correct offset", async () => {
      const repo = createMockPostStatsRepo();
      const service = new PostStatsService(repo);
      await service.getSharedByUsers("post1", "1");
      assert.deepStrictEqual(repo.getSharedByUsers.mock.calls[0].arguments, ["post1", 0]);
    });
  });
});
