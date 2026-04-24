import logger, { formErrorBody } from "../utils/pino.js";
import ApiError from "../constants/apiError.js";
import fetchDb from "../utils/dbQueryHelper.js";
import apiErrorType from "../constants/apiErrorTypesEnum.js";
import express, { NextFunction } from "express";
import ErrorDetails from "../constants/errorDetails.js";
import { followService, privacyService } from "../services/index.service.js";

const accessCheckLayer = async (req:express.Request, res:express.Response, next:NextFunction) => {
  const requester_UserId = req.auth?.userid;
  const requested_UserId = req.params.userid;
  if(requested_UserId===requester_UserId) return next();
  if (!requested_UserId) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR,new ErrorDetails("please provide a valid userid to fetch its followers")));
if(!requester_UserId)return res.status(403).json(new ApiError(403,apiErrorType.AUTH_ERROR,new ErrorDetails("please provide a valid jwt token")))
  try {
    const isPrivateAccount = await privacyService.isUserPrivate(requested_UserId);
    if (isPrivateAccount) {
      const isRequesterAllowedAccess = await isUserAllowed(
        requester_UserId,
        requested_UserId
      );
      if (!isRequesterAllowedAccess) {
        return res.status(403).json(new ApiError(403, apiErrorType.API_ERROR,new ErrorDetails("action not allowed")));
      }
    }
    return next();
  } catch (error) {
    logger.error(formErrorBody(error as string,500,req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR,new ErrorDetails(null)));
  }
};


const isUserAllowed = async (requesterUser:string, requestedUser:string) => {
  return new Promise(async (resolve, reject) => {
    try{
    const result:any=await followService.isRequestApproved(requesterUser,requestedUser);
    if (result.length == 0) return reject("forbidden");
      const isFollowed = result[0].isApproved == 1;
      resolve(isFollowed);
    } catch (error) {
      logger.error(formErrorBody(error as string,null,null));
      return reject(error);
    }
  });
};
export default accessCheckLayer;



