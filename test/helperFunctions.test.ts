import { describe, it } from "node:test";
import assert from "assert";
import { get_CurrentTimeStamp_Sql_Format, verifyAgeAbove18 } from "../src/utils/helperFunctions.ts";

describe("helperFunctions", () => {
  describe("get_CurrentTimeStamp_Sql_Format", () => {
    it("should return a string in SQL timestamp format YYYY-MM-DD HH:MM:SS", () => {
      const result = get_CurrentTimeStamp_Sql_Format();
      // matches pattern like 2024-01-15 10:30:45
      const pattern = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
      assert.ok(pattern.test(result), `Expected SQL format, got: ${result}`);
    });

    it("should not contain the T character from ISO format", () => {
      const result = get_CurrentTimeStamp_Sql_Format();
      assert.ok(!result.includes("T"), "Should not contain T separator");
    });

    it("should return length of 19 characters", () => {
      const result = get_CurrentTimeStamp_Sql_Format();
      assert.strictEqual(result.length, 19);
    });
  });

  describe("verifyAgeAbove18", () => {
    it("should return true (current impl always returns true)", () => {
      const result = verifyAgeAbove18("2000-01-01");
      assert.strictEqual(result, true);
    });

    it("should handle empty string", () => {
      const result = verifyAgeAbove18("");
      assert.strictEqual(result, true);
    });
  });
});
