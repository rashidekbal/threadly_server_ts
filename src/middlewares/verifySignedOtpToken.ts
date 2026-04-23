import logger, { formErrorBody } from "../utils/pino.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import ApiError from "../constants/apiError.js";
import "dotenv/config";
import apiErrorType from "../constants/apiErrorTypesEnum.js";
import express, { NextFunction } from "express"
import ErrorDetails from "../constants/errorDetails.js";
import { getJWT_secretToken } from "../utils/envValuesAccessInterface.js";
function verifyOtpSignedToken(req:express.Request, res:express.Response, next:NextFunction) {
  let header = req.headers["authorization"];
  if (!header) return res.status(401).json(new ApiError(401, apiErrorType.AUTH_ERROR,new ErrorDetails("please attach a proper auth header")));
  let token = header.split(" ")[1];
 
  if (token ==null)return res.status(401).json(new ApiError(401,apiErrorType.AUTH_ERROR ,new ErrorDetails("please provide a auth token in header")));
  try {
    const result=jwt.verify(token,getJWT_secretToken())as JwtPayload;
    req.body=result;
    next();
  } catch (error) {
     logger.error(formErrorBody(error as string,null,req));
    return res.status(401).json(new ApiError(401,apiErrorType.AUTH_ERROR ,new ErrorDetails("auth token invalid")));
  } 
  
 
}
export default verifyOtpSignedToken;
