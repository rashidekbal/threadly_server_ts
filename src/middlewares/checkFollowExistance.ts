import logger, { formErrorBody } from "../utils/pino.js";
import Response from "../constants/Response.js";
import ApiError from "../constants/apiError.js";
import apiErrorType from "../constants/apiErrorTypesEnum.js";
import express, { NextFunction } from "express"
import ErrorDetails from "../constants/errorDetails.js";
import { followService } from "../services/index.service.js";

export default async function CheckIfFollowExists(req:express.Request,res:express.Response,next:NextFunction){
   try {
  const followerid=req.auth?.userid;
            if(!followerid)return res.status(403).json(new ApiError(403,apiErrorType.AUTH_ERROR,new ErrorDetails("please provide a valid jwt token")))
           
   let followingid = req.body.nameValuePairs.followingid;
   if(!followingid) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR,new ErrorDetails("please provide valid userid to follow")));

    let result:any=await followService.isRequestApproved(followerid,followingid);
    if(result.length===0)return next();
    if(result[0].isApproved===1) return res.json(new Response(201, { status: "SUCCESS" }));
      return res.json(new Response(201,{status:"PENDING"}));  

   } catch (error) {
    logger.error(formErrorBody(error as string , 500,req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR,new ErrorDetails(null)));
   }


}


