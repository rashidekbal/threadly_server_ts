import logger, { formErrorBody } from "../../utils/pino.js";
import Response from "../../constants/Response.js";
import ApiError from "../../constants/apiError.js";
import apiErrorType from "../../constants/apiErrorTypesEnum.js";
import express from "express"
import ErrorDetails from "../../constants/errorDetails.js";
import { getCommentsOfPost } from "../../repo/adminRepo.js";

const getCommentsController = async (req:express.Request, res:express.Response) => {
  const postid = req.params.postid;
  if (!postid) return res.status(404).json(new ApiError(404,apiErrorType.API_ERROR ,new ErrorDetails("please provide a valid postid")));
 
try {
    let result = await getCommentsOfPost(1,Number(postid))
    return res.json(new Response(200, result));
  } catch (error) {
    logger.error(formErrorBody(error as string,500,req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR,new ErrorDetails("something went wrong..")));
  }
};
export {getCommentsController}

