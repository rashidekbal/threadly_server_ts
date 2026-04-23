import logger, { formErrorBody } from "../utils/pino.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import ApiError from "../constants/apiError.js";
import "dotenv/config";
import redisHelper from "../redis/operation.js";
import fetchDb from "../utils/dbQueryHelper.js";

import apiErrorType from "../constants/apiErrorTypesEnum.js";
import express, { NextFunction } from "express"
import ErrorDetails from "../constants/errorDetails.js";
import { getJWT_secretToken } from "../utils/envValuesAccessInterface.js";
async function verifyToken(req:express.Request, res:express.Response, next:NextFunction) {
  let header = req.headers["authorization"];
  if (!header) return res.status(401).json(new ApiError(401, apiErrorType.AUTH_ERROR,new ErrorDetails("please attach a proper auth header")));
  let token = header.split(" ")[1];
  if (token ==null) return res.status(401).json(new ApiError(401,apiErrorType.AUTH_ERROR ,new ErrorDetails("please provide a auth token in header")));
  try {
    const result=jwt.verify(token,getJWT_secretToken()) as JwtPayload;
    const sessionId=result.sessionId;
     if(!sessionId||!result.userid)return res.status(401).json(new ApiError(401,apiErrorType.AUTH_ERROR ,new ErrorDetails("auth token invalid")));
    let isValidSession =await validateSession(sessionId,result.userid);
    if(!isValidSession)return res.status(401).json(new ApiError(401, apiErrorType.AUTH_ERROR,new ErrorDetails("auth token invalid")));
    req.body = {userid:result.userid};
   return next();
  } catch (error) {
    logger.error(formErrorBody(error as string,null,req));
    return res.status(401).json(new ApiError(401,apiErrorType.AUTH_ERROR ,new ErrorDetails("auth token invalid")));
    
  }
}
async function validateSession(sessionId:string,userid:string){

  //check for session id on redis
  try {
      const sessionIdOnredis=await redisHelper.getEntry(`UserSession:${userid}`);
      if(!sessionIdOnredis){
        // check for db
        const dbResult= await fetchDb(`select sessionId from users where userid=? limit 1`,[userid]);
        if(!(dbResult instanceof Array))return false;
        if(dbResult.length<1)return false;
        const sessionIdOnDb=dbResult[0].sessionId;
        if(sessionIdOnDb==null)return false;
              await redisHelper.addEntry(`UserSession:${userid}`,sessionIdOnDb);
        if(sessionIdOnDb===sessionId)return true;
    
          
        return false;
      }
      if(sessionIdOnredis===sessionId)return true;
      return false;

  } catch (error) {
    logger.error(formErrorBody(error as string,null,null));
    return false;
  }

 
  
  
}

export default verifyToken;
