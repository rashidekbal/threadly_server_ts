import logger, { formErrorBody } from "../../utils/pino.js";
import jwt from "jsonwebtoken";
import express from "express";
import validateAdminCreds from "../../utils/adminTokenAuthenticator.js";
import apiErrorType from "../../constants/apiErrorTypesEnum.js";
import ApiError from "../../constants/apiError.js";
import ErrorDetails from "../../constants/errorDetails.js";
import AuthError_body from "../../constants/authErrorBody.js";
import { getJWT_secretToken } from "../../utils/envValuesAccessInterface.js";
import adminPayload from "../../types/adminTokenPayload.js";
const LoginController = async (req:express.Request, res:express.Response) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR,new ErrorDetails("please provide the required email and password")));
  }
  if (!validateAdminCreds({ email, password })) {
    return res.status(401).json(new ApiError(401,apiErrorType.AUTH_ERROR ,new AuthError_body("INVALID CREDS","please provide a valid admin credential")
  ))}
  try {
    const payload:adminPayload = {
      authenticated: true,
      role: "admin",
      power: "full",
      email,
    };
    const token = jwt.sign(JSON.stringify(payload), getJWT_secretToken());
    return res.status(200).json({ token });
  } catch (error) {
    logger.error(formErrorBody(error as string,500,req));
    return res.status(500).json(new ApiError(500,apiErrorType.API_ERROR ,new ErrorDetails(error as string)));
  }
};
export { LoginController };

