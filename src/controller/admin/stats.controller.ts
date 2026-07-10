import Response from "../../constants/Response.js";
import ApiError from "../../constants/apiError.js";
import apiErrorType from "../../constants/apiErrorTypesEnum.js";
import ErrorDetails from "../../constants/errorDetails.js";
import { adminService } from "../../services/index.service.js";
import logger, { formErrorBody } from "../../utils/pino.js";
import express from "express"

 async function statsController(req:express.Request, res:express.Response) {
  const likeStats = await adminService.getLikesStats();
  const commentStats = await adminService.getCommentsStats();
  const usersStats = await adminService.getUsersStats();
  const postViewStats = await adminService.getPostViewStats();
  return res.json(
    new Response(200, { likeStats, commentStats, usersStats, postViewStats }),
  );
}

const getAnalyticsController = async (req: express.Request, res: express.Response) => {
  try {
    const [signups, posts, topUsers, topPosts] = await Promise.all([
      adminService.getSignupsTrend(),
      adminService.getPostsTrend(),
      adminService.getTopUsers(),
      adminService.getTopPosts(),
    ]);
    return res.json(new Response(200, { signups, posts, topUsers, topPosts }));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

const getSystemScanController = async (req: express.Request, res: express.Response) => {
  try {
    const result = await adminService.getSystemScan();
    if (!result) return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
    return res.json(new Response(200, result));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

const getDashboardReportController = async (req: express.Request, res: express.Response) => {
  try {
    const result = await adminService.getDashboardReport();
    if (!result) return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
    return res.json(new Response(200, result));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

export { statsController, getAnalyticsController, getSystemScanController, getDashboardReportController }

