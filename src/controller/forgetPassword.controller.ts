import logger, { formErrorBody } from "../utils/pino.js";
import ApiError from "../constants/apiError.js";
import Response from "../constants/Response.js";
import apiErrorType from "../constants/apiErrorTypesEnum.js";
import express from "express";
import ErrorDetails from "../constants/errorDetails.js";
import { forgetPasswordService } from "../services/index.service.js";

async function resetPasswordMobileContorler(req: express.Request, res: express.Response) {
  let phone = req.body.auth_base;
  let password = req.body.nameValuePairs.password;
  if (phone.toString().length < 10 || password.length < 6)
    return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("invalid phone or password length")));
  try {
    const affectedRows = await forgetPasswordService.resetPasswordByPhone(phone, password);
    if (affectedRows < 1) return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
    return res.json(new Response(201, "success"));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
}

async function resetPasswordEmailContorler(req: express.Request, res: express.Response) {
  let email = req.body.auth_base;
  let password = req.body.nameValuePairs.password;
  try {
    const affectedRows = await forgetPasswordService.resetPasswordByEmail(email, password);
    if (affectedRows < 1) return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
    return res.json(new Response(201, "success"));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
}

export { resetPasswordMobileContorler, resetPasswordEmailContorler };
