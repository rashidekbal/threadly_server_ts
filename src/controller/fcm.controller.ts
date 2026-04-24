import logger, { formErrorBody } from "../utils/pino.js";
import Response from "../constants/Response.js";
import ApiError from "../constants/apiError.js";
import apiErrorType from "../constants/apiErrorTypesEnum.js";
import express from "express";
import ErrorDetails from "../constants/errorDetails.js";
import { userService } from "../services/index.service.js";
import UserRepo from "../repo/userRepo.js";

const userRepo = new UserRepo();

const updateToken = async (req: express.Request, res: express.Response) => {
  const userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  const token = req.body.nameValuePairs.token;
  if (!token) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide a fcm token")));
  try {
    let result = await userRepo.updateFcmToken(userid, token);
    return res.json(new Response(201, { msg: "success", result }));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

export { updateToken };
