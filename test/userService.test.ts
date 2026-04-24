import { describe, it, mock } from "node:test";
import assert from "assert";
import UserService from "../src/services/UserServices.ts";

function createMockUserRepo(overrides: Record<string, any> = {}) {
  return {
    getSuggestedUsers: mock.fn(async () => []),
    getUser: mock.fn(async () => []),
    getBasicUserDetailsByUUid: mock.fn(async () => []),
    getLoggedInUserData: mock.fn(async () => []),
    ...overrides,
  } as any;
}

describe("UserService", () => {
  describe("getSuggestedUsers", () => {
    it("should delegate to userRepo with userid and page", async () => {
      const repo = createMockUserRepo();
      const service = new UserService(repo);
      await service.getSuggestedUsers("user1", 1);
      assert.strictEqual(repo.getSuggestedUsers.mock.callCount(), 1);
      assert.deepStrictEqual(repo.getSuggestedUsers.mock.calls[0].arguments, ["user1", 1]);
    });

    it("should use default page=1 if not provided", async () => {
      const repo = createMockUserRepo();
      const service = new UserService(repo);
      await service.getSuggestedUsers("user1");
      assert.deepStrictEqual(repo.getSuggestedUsers.mock.calls[0].arguments, ["user1", 1]);
    });

    it("should return userRepo data", async () => {
      const mockUsers = [{ userid: "jane" }, { userid: "bob" }];
      const repo = createMockUserRepo({ getSuggestedUsers: mock.fn(async () => mockUsers) });
      const service = new UserService(repo);
      const result = await service.getSuggestedUsers("user1");
      assert.deepStrictEqual(result, mockUsers);
    });
  });

  describe("getUserinfo", () => {
    it("should call getUser with requestedUserId and requesterUserid", async () => {
      const repo = createMockUserRepo();
      const service = new UserService(repo);
      await service.getUserinfo("targetUser", "requester");
      assert.deepStrictEqual(repo.getUser.mock.calls[0].arguments, ["targetUser", "requester"]);
    });
  });

  describe("getUserWithUUid", () => {
    it("should call getBasicUserDetailsByUUid with uuid", () => {
      const repo = createMockUserRepo();
      const service = new UserService(repo);
      service.getUserWithUUid("some-uuid-123");
      assert.deepStrictEqual(repo.getBasicUserDetailsByUUid.mock.calls[0].arguments, ["some-uuid-123"]);
    });
  });

  describe("getLoggedInUserData", () => {
    it("should delegate to userRepo.getLoggedInUserData", () => {
      const repo = createMockUserRepo();
      const service = new UserService(repo);
      service.getLoggedInUserData("user1");
      assert.deepStrictEqual(repo.getLoggedInUserData.mock.calls[0].arguments, ["user1"]);
    });
  });
});
