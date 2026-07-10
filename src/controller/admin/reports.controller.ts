import express from "express";
import Response from "../../constants/Response.js";
import ApiError from "../../constants/apiError.js";
import apiErrorType from "../../constants/apiErrorTypesEnum.js";
import ErrorDetails from "../../constants/errorDetails.js";
import logger, { formErrorBody } from "../../utils/pino.js";
import { getReports, updateReportStatus } from "../../repo/adminRepo.js";

const getReportsController = async (req: express.Request, res: express.Response) => {
  try {
    const status = (req.query.status as string) || "pending";
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const result = await getReports(status, page);
    return res.json(new Response(200, result));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

const updateReportStatusController = async (req: express.Request, res: express.Response) => {
  try {
    const reportid = req.params.reportid;
    const status = req.body.status;
    if (!reportid || !status)
      return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide all required fields")));
    await updateReportStatus(Number(reportid), status);
    return res.status(200).json(new Response(200, { message: "success" }));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

export { getReportsController, updateReportStatusController };
