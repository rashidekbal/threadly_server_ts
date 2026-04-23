import ApiError from "../constants/apiError.js";
import bcryptUtil from "../utils/bcryptUtil.js";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { v4 } from "uuid";
import redisClient from "../redis/redis.js";
import fetchDb from "../utils/dbQueryHelper.js";
import connection from "../db/connection.js";
import Response from "../constants/Response.js";
import apiErrorType from "../constants/apiErrorTypesEnum.js";
import AccountRestriction_body from "../constants/accountRestrictionBody.js";
import { get_CurrentTimeStamp_Sql_Format } from "../utils/helperFunctions.js";
import AuthError_body from "../constants/authErrorBody.js";
import logger, { formErrorBody } from "../utils/pino.js";
import express from "express";
import ErrorDetails from "../constants/errorDetails.js";

import { authService } from "../services/index.service.js";

import ServiceError from "../constants/serviceError.js";
import ErrorEnum from "../constants/errorsEnum.js";
import BanType from "../constants/banTypeEnum.js";
import LoginType from "../constants/loginTypeEnum.js";
import { auth } from "firebase-admin";

const Login_userid_controller = async (
  req: express.Request,
  res: express.Response,
) => {
    //used when user is in banned state ;
    let banDuration="",banReason="",banned_at="";
  try {
    let userid = req.body.nameValuePairs.userid;
    let password = req.body.nameValuePairs.password;
    if (!password || !userid)
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            apiErrorType.API_ERROR,
            new ErrorDetails("please provide all the credentials"),
          ),
        );
    //create a valid usermodel
    const data: any = await authService.loginUserId(LoginType.userid,userid, password);
    banDuration=data.userdata.banDuration;
    banReason=data.userdata.banReason;
    banned_at=data.userdata.banned_at;

    return res.json({
      message: "sucess",
      username: data.userdata.username,
      profile: data.userdata.profilepic,
      userid: data.userdata.userid,
      token: data.token,
      uuid: data.userdata.uuid,
      isPrivate: data.userdata.isPrivate,
    });
  } catch (e) {
    if (e instanceof ServiceError) {
      switch (e.type) {
        case ErrorEnum.user_not_exist:
            return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR,new AuthError_body("USER DOES NOT EXIST","please check the userid")))
          
        case ErrorEnum.invalid_password:
            return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR,new AuthError_body("INVALID PASSWORD","please check the password")))
        case ErrorEnum.banned:
            return res.status(403).json(new ApiError(403,apiErrorType.ACCOUNT_RESTRICTION_ERROR,new AccountRestriction_body(banDuration=="24hr"?BanType.TEMPORARY:BanType.PERMANENT,banReason,banned_at)))
      }
//when default case 
logger.error(formErrorBody(e.type+e.errorDetails,500,req));
      return res
        .status(500)
        .json(
          new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)),
        );
    }
  }
};
const Login_email_controller=async(req:express.Request,res:express.Response)=>{
    //used when user is in banned state ;
    let banDuration="",banReason="",banned_at="";
  try {
    let userid = req.body.nameValuePairs.userid;
    let password = req.body.nameValuePairs.password;
    if (!password || !userid)
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            apiErrorType.API_ERROR,
            new ErrorDetails("please provide all the credentials"),
          ),
        );
    //create a valid usermodel
    const data: any = await authService.loginUserId(LoginType.email,userid, password);
    banDuration=data.userdata.banDuration;
    banReason=data.userdata.banReason;
    banned_at=data.userdata.banned_at;

    return res.json({
      message: "sucess",
      username: data.userdata.username,
      profile: data.userdata.profilepic,
      userid: data.userdata.userid,
      token: data.token,
      uuid: data.userdata.uuid,
      isPrivate: data.userdata.isPrivate,
    });
  } catch (e) {
    if (e instanceof ServiceError) {
      switch (e.type) {
        case ErrorEnum.user_not_exist:
            return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR,new AuthError_body("USER DOES NOT EXIST","please check the userid")))
          
        case ErrorEnum.invalid_password:
            return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR,new AuthError_body("INVALID PASSWORD","please check the password")))
        case ErrorEnum.banned:
            return res.status(403).json(new ApiError(403,apiErrorType.ACCOUNT_RESTRICTION_ERROR,new AccountRestriction_body(banDuration=="24hr"?BanType.TEMPORARY:BanType.PERMANENT,banReason,banned_at)))
      }
//when default case 
logger.error(formErrorBody(e.type+e.errorDetails,500,req));
      return res
        .status(500)
        .json(
          new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)),
        );
    }
  }
}
const Login_mobile_controller=async(req:express.Request,res:express.Response)=>{
   //used when user is in banned state ;
    let banDuration="",banReason="",banned_at="";
  try {
    let userid = req.body.nameValuePairs.userid;
    let password = req.body.nameValuePairs.password;
    if (!password || !userid)
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            apiErrorType.API_ERROR,
            new ErrorDetails("please provide all the credentials"),
          ),
        );
    //create a valid usermodel
    const data: any = await authService.loginUserId(LoginType.phone,userid, password);
    banDuration=data.userdata.banDuration;
    banReason=data.userdata.banReason;
    banned_at=data.userdata.banned_at;

    return res.json({
      message: "sucess",
      username: data.userdata.username,
      profile: data.userdata.profilepic,
      userid: data.userdata.userid,
      token: data.token,
      uuid: data.userdata.uuid,
      isPrivate: data.userdata.isPrivate,
    });
  } catch (e) {
    if (e instanceof ServiceError) {
      switch (e.type) {
        case ErrorEnum.user_not_exist:
            return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR,new AuthError_body("USER DOES NOT EXIST","please check the userid")))
          
        case ErrorEnum.invalid_password:
            return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR,new AuthError_body("INVALID PASSWORD","please check the password")))
        case ErrorEnum.banned:
            return res.status(403).json(new ApiError(403,apiErrorType.ACCOUNT_RESTRICTION_ERROR,new AccountRestriction_body(banDuration=="24hr"?BanType.TEMPORARY:BanType.PERMANENT,banReason,banned_at)))
      }
//when default case 
logger.error(formErrorBody(e.type+e.errorDetails,500,req));
      return res
        .status(500)
        .json(
          new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)),
        );
    }
  }
}

const logout_controller=async (req:express.Request, res:express.Response) => {
  const userid = req.body.userid;
  try {
   await authService.logoutUser(userid)
    res.json(new Response(200, { msg: "ok" }));
  } catch (err) {
    logger.error(formErrorBody(err as string,500,req));
    res.status(500).json(new ApiError(500, apiErrorType.API_ERROR,new ErrorDetails("internal server error")));
  }
}

export {
  Login_userid_controller,
    Login_email_controller,
    Login_mobile_controller,
    logout_controller,
};
