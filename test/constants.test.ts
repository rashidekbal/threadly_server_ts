import { describe, it } from "node:test";
import assert from "assert";
import ApiError from "../src/constants/apiError.ts";
import apiErrorType from "../src/constants/apiErrorTypesEnum.ts";
import ErrorDetails from "../src/constants/errorDetails.ts";
import Response from "../src/constants/Response.ts";
import ServiceError from "../src/constants/serviceError.ts";
import ErrorEnum from "../src/constants/errorsEnum.ts";

describe("ApiError", () => {
  it("should create ApiError with status, type, and body", () => {
    const err = new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("bad request"));
    assert.strictEqual(err.status, 400);
    assert.strictEqual(err.errorType, apiErrorType.API_ERROR);
    assert.strictEqual((err.errorBody as ErrorDetails).errorDetails, "bad request");
  });

  it("should create ApiError with AUTH_ERROR type", () => {
    const err = new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("unauthorized"));
    assert.strictEqual(err.status, 403);
    assert.strictEqual(err.errorType, apiErrorType.AUTH_ERROR);
  });

  it("should set default error message when ErrorDetails receives null", () => {
    const details = new ErrorDetails(null);
    assert.strictEqual(details.errorDetails, "somethin went wrong....");
  });

  it("should preserve custom error message", () => {
    const details = new ErrorDetails("custom error");
    assert.strictEqual(details.errorDetails, "custom error");
  });
});

describe("Response", () => {
  it("should create Response with status and data", () => {
    const res = new Response(200, { msg: "success" });
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.data, { msg: "success" });
  });

  it("should support 201 status", () => {
    const res = new Response(201, "created");
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data, "created");
  });

  it("should handle array data", () => {
    const res = new Response(200, [{ id: 1 }, { id: 2 }]);
    assert.strictEqual(res.status, 200);
    assert.strictEqual((res.data as any[]).length, 2);
  });
});

describe("ServiceError", () => {
  it("should create with error type and message", () => {
    const err = new ServiceError(ErrorEnum.user_not_exist, "user not found");
    assert.strictEqual(err.type, ErrorEnum.user_not_exist);
    assert.strictEqual(err.errorDetails, "user not found");
  });

  it("should be instance of ErrorDetails", () => {
    const err = new ServiceError(ErrorEnum.invalid_password, "wrong password");
    assert.ok(err instanceof ErrorDetails);
  });

  it("should support all error enum types", () => {
    const types = [
      ErrorEnum.user_not_exist,
      ErrorEnum.invalid_user,
      ErrorEnum.invalid_password,
      ErrorEnum.banned,
      ErrorEnum.internal_error,
      ErrorEnum.notAdult,
    ];
    for (const type of types) {
      const err = new ServiceError(type, "test");
      assert.strictEqual(err.type, type);
    }
  });
});
