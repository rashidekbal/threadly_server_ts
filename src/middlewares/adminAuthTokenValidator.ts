import logger, { formErrorBody } from "../utils/pino.js";
import jwt from "jsonwebtoken";
import ApiError from "../constants/apiError.js";
import "dotenv/config";
import apiErrorType from "../constants/apiErrorTypesEnum.js";
import { getJWT_secretToken } from "../utils/envValuesAccessInterface.js";
import express from "express"
import { NextFunction } from "express-serve-static-core";
import AuthError_body from "../constants/authErrorBody.js";
function adminAuthorizationVerification(req:express.Request, res:express.Response, next:NextFunction) {
  let header = req.headers["authorization"];
  if (!header) return res.status(401).json(new ApiError(401, apiErrorType.AUTH_ERROR,new AuthError_body("INVALID_AUTH_HEADER","please provide a valid auth header")));
  let token = header.split(" ")[1];
  if (token ==null) return res.status(401).json(new ApiError(401, apiErrorType.AUTH_ERROR,new AuthError_body("INVALID_AUTH_TOKEN","please provide a valid auth token")));
  jwt.verify(token, getJWT_secretToken(), (err:any, result:any) => {
    if (err){logger.error(formErrorBody(err,403,req)); return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR,new AuthError_body("EXPIRED_OR_TAMPERED_AUTH_TOKEN","your provided auth token is either expired or tampered with")))};
    req.body = {ObtainedData:result};
    next();
  });
}
export default adminAuthorizationVerification;
