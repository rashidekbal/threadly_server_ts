import { describe, it, mock } from "node:test";
import assert from "assert";
import CommentService from "../src/services/commentService.ts";

function createMockCommentRepo(overrides: Record<string, any> = {}) {
  return {
    addComment: mock.fn(async () => ({ insertId: 1 })),
    removeComment: mock.fn(async () => ({ affectedRows: 1 })),
    getComments: mock.fn(async () => []),
    addReply: mock.fn(async () => ({ insertId: 2 })),
    getCommentReplies: mock.fn(async () => []),
    ...overrides,
  } as any;
}

describe("CommentService", () => {
  describe("addComment", () => {
    it("should delegate to commentRepo.addComment with correct args", async () => {
      const repo = createMockCommentRepo();
      const service = new CommentService(repo);
      await service.addComment("user1", 10, "nice post!");
      assert.strictEqual(repo.addComment.mock.callCount(), 1);
      assert.deepStrictEqual(repo.addComment.mock.calls[0].arguments, ["user1", 10, "nice post!"]);
    });
  });

  describe("removeComment", () => {
    it("should delegate to commentRepo.removeComment with correct args", async () => {
      const repo = createMockCommentRepo();
      const service = new CommentService(repo);
      await service.removeComment("user1", 10, 5);
      assert.strictEqual(repo.removeComment.mock.callCount(), 1);
      assert.deepStrictEqual(repo.removeComment.mock.calls[0].arguments, ["user1", 10, 5]);
    });
  });

  describe("getComments", () => {
    it("should return comments from repo", async () => {
      const mockComments = [{ id: 1, text: "hello" }, { id: 2, text: "world" }];
      const repo = createMockCommentRepo({
        getComments: mock.fn(async () => mockComments),
      });
      const service = new CommentService(repo);
      const result = await service.getComments("user1", 10);
      assert.deepStrictEqual(result, mockComments);
    });
  });

  describe("addReply", () => {
    it("should delegate to commentRepo.addReply with correct args", async () => {
      const repo = createMockCommentRepo();
      const service = new CommentService(repo);
      await service.addReply("user1", 10, "nice reply", "5");
      assert.strictEqual(repo.addReply.mock.callCount(), 1);
      assert.deepStrictEqual(repo.addReply.mock.calls[0].arguments, ["user1", 10, "nice reply", "5"]);
    });
  });

  describe("getCommentReplies", () => {
    it("should return replies from repo", async () => {
      const mockReplies = [{ id: 3, text: "reply1" }];
      const repo = createMockCommentRepo({
        getCommentReplies: mock.fn(async () => mockReplies),
      });
      const service = new CommentService(repo);
      const result = await service.getCommentReplies("user1", 5);
      assert.deepStrictEqual(result, mockReplies);
    });
  });
});
