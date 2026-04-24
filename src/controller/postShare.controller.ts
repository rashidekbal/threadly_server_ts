import ApiError from "../constants/apiError.js";
import ErrorDetails from "../constants/errorDetails.js";
import apiErrorType from "../constants/apiErrorTypesEnum.js";
import Response from "../constants/Response.js";
import logger, { formErrorBody } from "../utils/pino.js";
import express from "express";
import { postShareService } from "../services/index.service.js";

const handlePostShareController = async (req: express.Request, res: express.Response) => {
  const sender_UserId = req.body.nameValuePairs.senderUserId;
  const Receiver_UserId = req.body.nameValuePairs.receiverUserId;
  const postid = req.body.nameValuePairs.postid;
  if (!sender_UserId || !Receiver_UserId || !postid) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("PLEASE ENSURE ALL THE REQUIRED VALUES ARE GIVEN IN THE REQUEST BODY")));
  try {
    await postShareService.sharePost(sender_UserId, Receiver_UserId, postid);
    return res.json(new Response(200, { msg: "ok" }));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails("INTERNAL SERVER ERROR")));
  }
};

export { handlePostShareController };
