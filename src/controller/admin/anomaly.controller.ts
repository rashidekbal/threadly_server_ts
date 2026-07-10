import express from "express";
import Response from "../../constants/Response.js";
import ApiError from "../../constants/apiError.js";
import apiErrorType from "../../constants/apiErrorTypesEnum.js";
import ErrorDetails from "../../constants/errorDetails.js";
import logger, { formErrorBody } from "../../utils/pino.js";
import { getAnomalies, resolveAnomaly } from "../../repo/anomalyRepo.js";

const getAnomaliesController = async (req: express.Request, res: express.Response) => {
  try {
    const status = (req.query.status as string) || "unresolved";
    const result = await getAnomalies(status);
    return res.json(new Response(200, result));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

const resolveAnomalyController = async (req: express.Request, res: express.Response) => {
  try {
    const anomalyId = req.params.anomalyId;
    if (!anomalyId) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("anomalyId required")));
    await resolveAnomaly(Number(anomalyId));
    return res.json(new Response(200, { message: "resolved" }));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

export { getAnomaliesController, resolveAnomalyController };
