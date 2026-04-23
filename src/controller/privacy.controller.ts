import logger, { formErrorBody } from "../utils/pino.js";
import Response from "../constants/Response.js"
import ApiError from "../constants/apiError.js";
import fetchDb from "../utils/dbQueryHelper.js";
import apiErrorType from "../constants/apiErrorTypesEnum.js";
import express from "express";
import { followService, privacyService } from "../services/index.service.js";
import ErrorDetails from "../constants/errorDetails.js";
const setPrivateController=async (req:express.Request,res:express.Response)=>{

    try {
            const userid=req.auth?.userid;
            if(!userid)return res.status(403).json(new ApiError(403,apiErrorType.AUTH_ERROR,new ErrorDetails("please provide a valid jwt token")))
           
        await privacyService.setUserPrivacy(userid,true);
       return  res.json(new Response(200,"ok"));
    } catch (error) {
        logger.error(formErrorBody(error as string,500,req));
       return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR,new ErrorDetails(null)));
        
    }

}
const setPublicController=async(req:express.Request,res:express.Response)=>{
     
    try {
       const userid=req.auth?.userid;
            if(!userid)return res.status(403).json(new ApiError(403,apiErrorType.AUTH_ERROR,new ErrorDetails("please provide a valid jwt token")))
           
        await privacyService.setUserPrivacy(userid,false);
        followService.approveAllPendingFollowRequest(userid);
        res.json(new Response(200,"ok"));
    } catch (error) {
        logger.error(formErrorBody(error as string,500,req));
        res.status(500).json(new ApiError(500,apiErrorType.API_ERROR, new ErrorDetails(null)));
        
    }

}

export {setPrivateController,setPublicController}