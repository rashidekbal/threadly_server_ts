import logger, { formErrorBody } from "../utils/pino.js";
import ApiError from "../constants/apiError.js";
import Response from "../constants/Response.js";
import apiErrorType from "../constants/apiErrorTypesEnum.js";
import express from "express";
import ErrorDetails from "../constants/errorDetails.js";
import { postService } from "../services/index.service.js";
import { isProductionMode } from "../utils/envValuesAccessInterface.js";

let ProductionMode = isProductionMode();

async function addImagePost(req: express.Request, res: express.Response) {
  let userid = req.auth?.userid;
  if (!userid)
    return res
      .status(403)
      .json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  let caption = req.body.caption?.length > 0 ? req.body.caption : null;
  if (ProductionMode) {
    let buffer = req.file?.buffer;
    if (!buffer) return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
    postService.backgroundUploadFromRam(buffer, userid, caption, "image");
  } else {
    let path = (req.file as any)?.path;
    if (!path) return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
    postService.backgroundUpload(path, userid, caption, "image");
  }
  return res.json(new Response(201, { msg: "success" }));
}

async function addVideoPost(req: express.Request, res: express.Response) {
  let userid = req.auth?.userid;
  if (!userid)
    return res
      .status(403)
      .json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  let caption = req.body.caption?.length > 0 ? req.body.caption : null;
  if (ProductionMode) {
    let buffer = req.file?.buffer;
    if (!buffer) return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
    postService.backgroundUploadFromRam(buffer, userid, caption, "video");
  } else {
    let path = (req.file as any)?.path;
    if (!path) return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
    postService.backgroundUpload(path, userid, caption, "video");
  }
  return res.json(new Response(201, { msg: "success" }));
}

async function removePost(req: express.Request, res: express.Response) {
  let userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  let postid = req.params.postid;
  try {
    await postService.removePost(userid, Number(postid));
    return res.json(new Response(200, { msg: "success" }));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
}

let getPostinfo = async (req: express.Request, res: express.Response) => {
  let userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  let postid = req.params.postid;
  try {
    let response: any = await postService.getPostInfo(userid, postid);
    if (response.length === 0) return res.status(404).json(new ApiError(404, apiErrorType.API_ERROR, new ErrorDetails(null)));
    res.json({ status: 200, data: response });
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

async function getImageFeed(req: express.Request, res: express.Response) {
  let userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  try {
    let response = await postService.getImageFeed(userid);
    res.json(new Response(200, response));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
}

async function getVideoFeed(req: express.Request, res: express.Response) {
  let userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  try {
    let response = await postService.getVideoFeed(userid);
    res.json(new Response(200, response));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
}

async function getUserPostsController(req: express.Request, res: express.Response) {
  let reqMakerUserId = req.auth?.userid;
  if (!reqMakerUserId)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  let userid = req.params.userid;
  const limit = 50;
  let page = req.query.page ? Number(req.query.page) - 1 : 0;
  let offset = limit * page;
  try {
    let response = await postService.getUserPosts(reqMakerUserId, userid, limit, offset);
    return res.json({ status: 200, data: response });
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
}

const postViewRecordController = async (req: express.Request, res: express.Response) => {
  let userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  let postid = req.params.postid;
  let uuid = req.body.nameValuePairs.uuid;
  if (!postid || !uuid) return res.status(404).json(new ApiError(404, apiErrorType.API_ERROR, new ErrorDetails(null)));
  try {
    await postService.recordPostView(userid, uuid, postid);
    return res.json(new Response(201, "ok"));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

export {
  addImagePost, addVideoPost, removePost,
  getImageFeed, getVideoFeed, getUserPostsController,
  getPostinfo, postViewRecordController
};
