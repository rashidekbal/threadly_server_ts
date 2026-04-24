import logger, { formErrorBody } from "../utils/pino.js";
import Response from "../constants/Response.js";
import ApiError from "../constants/apiError.js";
import apiErrorType from "../constants/apiErrorTypesEnum.js";
import express from "express";
import ErrorDetails from "../constants/errorDetails.js";
import { messageService } from "../services/index.service.js";
import { isProductionMode } from "../utils/envValuesAccessInterface.js";

const getMsgPendingHistoryController = async (req: express.Request, res: express.Response) => {
  const userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  try {
    let response = await messageService.getPendingHistory(userid);
    return res.json(new Response(200, response));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

const getpendingMessagesController = async (req: express.Request, res: express.Response) => {
  const userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  const senderUuid = req.body.nameValuePairs.senderUuid;
  if (!senderUuid) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide senderUuid")));
  try {
    const response = await messageService.getPendingMessages(userid, senderUuid);
    return res.json(new Response(200, response));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

const sendMessageController = async (req: express.Request, res: express.Response) => {
  const data = req.body.nameValuePairs;
  if (data == null || data == undefined) {
    return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide a valid request body")));
  }
  const { senderUuid, receiverUuid, timestamp, MsgUid } = data;
  if (!senderUuid || !receiverUuid || !timestamp || !MsgUid) {
    return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide all required fields")));
  }
  try {
    const result = await messageService.sendMessage(data);
    return res.json(new Response(200, result));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

const updateMessageSeenStatusController = async (req: express.Request, res: express.Response) => {
  const senderUUid = req.body.nameValuePairs.senderUUid;
  const receiverUUid = req.body.nameValuePairs.receiverUUid;
  if (senderUUid == null || receiverUUid == null) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide senderUUid and receiverUUid")));
  try {
    await messageService.updateSeenStatus(senderUUid, receiverUUid);
    return res.json(new Response(201, { msg: "success" }));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

const uploadMessageMedia = async (req: express.Request, res: express.Response) => {
  try {
    const isProduction = isProductionMode();
    const url = await messageService.uploadMedia(req.file, isProduction);
    if (!url) return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
    return res.json(new Response(201, { link: url }));
  } catch (err) {
    logger.error(formErrorBody(err as string, 500, req));
    res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

const getAllChatsController = async (req: express.Request, res: express.Response) => {
  const userid = req.auth?.userid;
  if (!userid) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide a valid jwt token")));
  try {
    let response = await messageService.getAllChats(userid);
    return res.json(new Response(200, response));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

const deleteMessageForRoleController = async (req: express.Request, res: express.Response) => {
  const userid = req.auth?.userid;
  if (!userid) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide a valid jwt token")));
  let MsgUid = req.body.nameValuePairs.MsgUid;
  const role = req.body.nameValuePairs.Role;
  if (!MsgUid || !role) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide MsgUid and Role")));
  try {
    await messageService.deleteMessageForRole(userid, MsgUid, role);
    return res.json(new Response(200, { Msg: "ok" }));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

const UnsendMessageController = async (req: express.Request, res: express.Response) => {
  const userid = req.auth?.userid;
  if (!userid) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide a valid jwt token")));
  let MsgUid = req.body.nameValuePairs.MsgUid;
  const receiverUUid = req.body.nameValuePairs.receiverUUid;
  if (!MsgUid || !receiverUUid) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide MsgUid and receiverUUid")));
  try {
    await messageService.unsendMessage(userid, MsgUid, receiverUUid);
    return res.json(new Response(200, { msg: "ok" }));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

export {
  getMsgPendingHistoryController, getpendingMessagesController,
  sendMessageController, updateMessageSeenStatusController,
  uploadMessageMedia, getAllChatsController,
  deleteMessageForRoleController, UnsendMessageController
};
