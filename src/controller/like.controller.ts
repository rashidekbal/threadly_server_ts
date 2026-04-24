import logger, { formErrorBody } from "../utils/pino.js";
import ApiError from "../constants/apiError.js";
import Response from "../constants/Response.js";
import apiErrorType from "../constants/apiErrorTypesEnum.js";
import express from "express";
import ErrorDetails from "../constants/errorDetails.js";
import { likeService } from "../services/index.service.js";

let PostlikeController = async (req: express.Request, res: express.Response) => {
  let userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  let postid = req.params.postid;
  if (!postid) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide a valid post id")));
  try {
    await likeService.likePost(userid, Number(postid));
    return res.json(new Response(201, "success"));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

let PostunlikeController = async (req: express.Request, res: express.Response) => {
  let userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  let postid = req.params.postid;
  if (!postid) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide a valid post id")));
  try {
    await likeService.unlikePost(userid, Number(postid));
    return res.json(new Response(201, "success"));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

async function CommentLikeContorller(req: express.Request, res: express.Response) {
  let userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  let commentid = req.params.commentid;
  if (!commentid) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide a valid comment id")));
  try {
    await likeService.likeComment(userid, commentid);
    return res.json(new Response(201, "success"));
  } catch (err) {
    logger.error(formErrorBody(err as string, 500, req));
    res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
}

async function CommentUnlikeController(req: express.Request, res: express.Response) {
  let userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  let commentid = req.params.commentid;
  if (!commentid) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide a valid comment id")));
  try {
    await likeService.unlikeComment(userid, commentid);
    res.json(new Response(201, "success"));
  } catch (err) {
    logger.error(formErrorBody(err as string, 500, req));
    res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
}

const likeStoryController = async (req: express.Request, res: express.Response) => {
  const userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  const story_id = req.params.storyid;
  if (story_id == null)
    return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide a valid story id")));
  try {
    await likeService.likeStory(userid, story_id);
    return res.json(new Response(201, "created"));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

const UnlikeStoryController = async (req: express.Request, res: express.Response) => {
  const userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  const story_id = req.params.storyid;
  if (story_id == null)
    return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide a valid story id")));
  try {
    await likeService.unlikeStory(userid, story_id);
    return res.json(new Response(201, "created"));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

export {
  PostlikeController, PostunlikeController,
  CommentLikeContorller, CommentUnlikeController,
  likeStoryController, UnlikeStoryController,
};
