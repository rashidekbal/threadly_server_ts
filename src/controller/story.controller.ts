import { isProductionMode } from "../utils/envValuesAccessInterface.js";
import logger, { formErrorBody } from "../utils/pino.js";
import Response from "../constants/Response.js";
import ApiError from "../constants/apiError.js";
import apiErrorType from "../constants/apiErrorTypesEnum.js";
import express from "express";
import ErrorDetails from "../constants/errorDetails.js";
import { storyService } from "../services/index.service.js";

let ProductionMode = isProductionMode();

const addStoryController = async (req: express.Request, res: express.Response) => {
  let userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  let isVideo = req.body.type == "video";
  const type = isVideo ? "video" : "image";
  try {
    let url;
    if (ProductionMode) {
      let buffer = req.file?.buffer;
      if (!buffer) return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
      url = await storyService.addStoryFromRam(buffer, userid, type);
    } else {
      let path = (req.file as any)?.path;
      if (!path) return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
      url = await storyService.addStoryFromDisk(path, userid, type);
    }
    if (!url) return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
    res.json(new Response(201, { msg: "success" }));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

const getStoriesAllController = async (req: express.Request, res: express.Response) => {
  let userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  try {
    let response = await storyService.getAllStories(userid);
    return res.json(new Response(200, response));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

const getMyStoriesController = async (req: express.Request, res: express.Response) => {
  let userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  try {
    let response = await storyService.getMyStories(userid);
    return res.json(new Response(200, response));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

const getStoryOfUserController = async (req: express.Request, res: express.Response) => {
  let loggedInUser = req.auth?.userid;
  if (!loggedInUser)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  let userid = req.params.userid;
  try {
    let response = await storyService.getStoryOfUser(loggedInUser, userid);
    return res.json(new Response(200, response));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

async function removeStory(req: express.Request, res: express.Response) {
  let userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  let storyid = req.params.storyid;
  try {
    await storyService.removeStory(userid, Number(storyid));
    return res.json(new Response(200, { msg: "success" }));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
}

const StoryViewRecordController = async (req: express.Request, res: express.Response) => {
  let userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  let storyid = req.params.storyid;
  let uuid = req.body.nameValuePairs.uuid;
  if (!storyid || !uuid) return res.status(404).json(new ApiError(404, apiErrorType.API_ERROR, new ErrorDetails(null)));
  try {
    await storyService.recordStoryView(userid, uuid, storyid);
    return res.json(new Response(201, "ok"));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

export {
  getStoriesAllController, addStoryController, getStoryOfUserController,
  getMyStoriesController, removeStory, StoryViewRecordController
};
