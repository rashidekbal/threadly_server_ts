import Response from "../../constants/Response.js";
import ApiError from "../../constants/apiError.js";
import fetchDb from "../../utils/dbQueryHelper.js";
import apiErrorType from "../../constants/apiErrorTypesEnum.js";
import logger, { formErrorBody } from "../../utils/pino.js";
import express from "express"
import { getUserStory } from "../../repo/adminRepo.js";
import ErrorDetails from "../../constants/errorDetails.js";

const getUserStoriesController = async (req:express.Request, res:express.Response) => {
  
  
  try {
    const userid = req.params.userid;
  if (!userid) return res.status(404).json(new ApiError(404,apiErrorType.API_ERROR, new ErrorDetails("please provide a valid userid")));
    let result = await getUserStory(userid)
    return res.json(new Response(200, result));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500,req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR,new ErrorDetails(null)));
  }
};
export { getUserStoriesController };

