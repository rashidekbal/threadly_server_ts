import { describe, it, mock } from "node:test";
import assert from "assert";
import LikeService from "../src/services/likeService.ts";

function createMockLikeRepo(overrides: Record<string, any> = {}) {
  return {
    likePost: mock.fn(async () => ({ insertId: 1 })),
    unlikePost: mock.fn(async () => ({ affectedRows: 1 })),
    likeComment: mock.fn(async () => ({})),
    unlikeComment: mock.fn(async () => ({})),
    likeStory: mock.fn(async () => ({})),
    unlikeStory: mock.fn(async () => ({})),
    getUserBasicDetails: mock.fn(async () => []),
    getPostOwnerDetailsWithLink: mock.fn(async () => []),
    getPostOwnerDetails: mock.fn(async () => []),
    getCommentOwnerDetails: mock.fn(async () => []),
    getCommentOwnerBasicDetails: mock.fn(async () => []),
    ...overrides,
  } as any;
}

describe("LikeService", () => {
  describe("likePost", () => {
    it("should call likeRepo.likePost and return response", async () => {
      const repo = createMockLikeRepo();
      const service = new LikeService(repo);
      const result = await service.likePost("user1", 10);
      assert.strictEqual(repo.likePost.mock.callCount(), 1);
      assert.deepStrictEqual(repo.likePost.mock.calls[0].arguments, ["user1", 10]);
      assert.deepStrictEqual(result, { insertId: 1 });
    });
  });

  describe("unlikePost", () => {
    it("should call likeRepo.unlikePost and return response", async () => {
      const repo = createMockLikeRepo();
      const service = new LikeService(repo);
      const result = await service.unlikePost("user1", 10);
      assert.strictEqual(repo.unlikePost.mock.callCount(), 1);
      assert.deepStrictEqual(result, { affectedRows: 1 });
    });
  });

  describe("likeComment", () => {
    it("should call likeRepo.likeComment", async () => {
      const repo = createMockLikeRepo();
      const service = new LikeService(repo);
      await service.likeComment("user1", "5");
      assert.strictEqual(repo.likeComment.mock.callCount(), 1);
      assert.deepStrictEqual(repo.likeComment.mock.calls[0].arguments, ["user1", "5"]);
    });
  });

  describe("unlikeComment", () => {
    it("should call likeRepo.unlikeComment", async () => {
      const repo = createMockLikeRepo();
      const service = new LikeService(repo);
      await service.unlikeComment("user1", "5");
      assert.strictEqual(repo.unlikeComment.mock.callCount(), 1);
    });
  });

  describe("likeStory", () => {
    it("should delegate to likeRepo.likeStory", () => {
      const repo = createMockLikeRepo();
      const service = new LikeService(repo);
      service.likeStory("user1", "3");
      assert.strictEqual(repo.likeStory.mock.callCount(), 1);
      assert.deepStrictEqual(repo.likeStory.mock.calls[0].arguments, ["user1", "3"]);
    });
  });

  describe("unlikeStory", () => {
    it("should delegate to likeRepo.unlikeStory", () => {
      const repo = createMockLikeRepo();
      const service = new LikeService(repo);
      service.unlikeStory("user1", "3");
      assert.strictEqual(repo.unlikeStory.mock.callCount(), 1);
    });
  });
});
