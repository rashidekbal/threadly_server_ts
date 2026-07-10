import express from "express";
import Response from "../../constants/Response.js";
import ApiError from "../../constants/apiError.js";
import apiErrorType from "../../constants/apiErrorTypesEnum.js";
import ErrorDetails from "../../constants/errorDetails.js";
import logger, { formErrorBody } from "../../utils/pino.js";
import { getUserActivityLog, getPlatformActivity } from "../../repo/adminRepo.js";

const getUserActivityLogController = async (req: express.Request, res: express.Response) => {
  try {
    const userid = req.params.userid;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    if (!userid)
      return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide a valid userid")));
    const result = await getUserActivityLog(userid, page);
    return res.json(new Response(200, result));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

const getPlatformActivityController = async (req: express.Request, res: express.Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const result = await getPlatformActivity(page);
    return res.json(new Response(200, result));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

export { getUserActivityLogController, getPlatformActivityController };
