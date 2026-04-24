import ApiError from "../constants/apiError.js";
import ErrorDetails from "../constants/errorDetails.js";
import apiErrorType from "../constants/apiErrorTypesEnum.js";
import Response from "../constants/Response.js";
import logger, { formErrorBody } from "../utils/pino.js";
import express from "express";
import { postStatsService } from "../services/index.service.js";

const likedBy_User_controller = async (req: express.Request, res: express.Response) => {
  const postid = req.params.postid;
  const page = req.query.page as string;
  if (!postid) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("PLEASE PROVIDE A VALID POST ID")));
  try {
    let result = await postStatsService.getLikedByUsers(postid, page);
    return res.json(new Response(200, result));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails("INTERNAL SERVER ERROR")));
  }
};

const storyViewed_by_User_controller = async (req: express.Request, res: express.Response) => {
  const userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  const storyid = req.params.storyid;
  const page = req.query.page as string;
  if (!storyid) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("PLEASE PROVIDE A VALID STORY ID")));
  try {
    let result = await postStatsService.getStoryViewedByUsers(userid, storyid, page);
    return res.json(new Response(200, result));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails("INTERNAL SERVER ERROR")));
  }
};

const sharedBy_User_Record_controller = async (req: express.Request, res: express.Response) => {
  const postid = req.params.postid;
  const page = req.query.page as string;
  if (!postid) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("PLEASE PROVIDE A VALID POST ID")));
  try {
    let result = await postStatsService.getSharedByUsers(postid, page);
    return res.json(new Response(200, result));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails("INTERNAL SERVER ERROR")));
  }
};

export { likedBy_User_controller, sharedBy_User_Record_controller, storyViewed_by_User_controller };
