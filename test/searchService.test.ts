import { describe, it, mock } from "node:test";
import assert from "assert";
import SearchService from "../src/services/searchService.ts";

function createMockSearchRepo(overrides: Record<string, any> = {}) {
  return {
    searchAccounts: mock.fn(async () => []),
    searchReels: mock.fn(async () => []),
    ...overrides,
  } as any;
}

describe("SearchService", () => {
  describe("search", () => {
    it("should call both searchAccounts and searchReels with correct args", async () => {
      const repo = createMockSearchRepo();
      const service = new SearchService(repo);
      await service.search("john", "user1");
      assert.deepStrictEqual(repo.searchAccounts.mock.calls[0].arguments, ["john"]);
      assert.deepStrictEqual(repo.searchReels.mock.calls[0].arguments, ["john", "user1"]);
    });

    it("should return combined Account and Reels result", async () => {
      const accounts = [{ userid: "johndoe" }];
      const reels = [{ postid: 5, caption: "john reels" }];
      const repo = createMockSearchRepo({
        searchAccounts: mock.fn(async () => accounts),
        searchReels: mock.fn(async () => reels),
      });
      const service = new SearchService(repo);
      const result = await service.search("john", "user1");
      assert.deepStrictEqual(result, { Account: accounts, Reels: reels });
    });

    it("should return empty arrays when no results found", async () => {
      const repo = createMockSearchRepo();
      const service = new SearchService(repo);
      const result = await service.search("unknownxyz", "user1");
      assert.deepStrictEqual(result, { Account: [], Reels: [] });
    });
  });
});
