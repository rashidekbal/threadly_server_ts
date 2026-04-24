import logger, { formErrorBody } from "../utils/pino.js";
import Response from "../constants/Response.js";
import ApiError from "../constants/apiError.js";
import apiErrorType from "../constants/apiErrorTypesEnum.js";
import express from "express";
import ErrorDetails from "../constants/errorDetails.js";
import { profileService } from "../services/index.service.js";
import { isProductionMode } from "../utils/envValuesAccessInterface.js";

const editNameController = async (req: express.Request, res: express.Response) => {
  let userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  let name = req.body.nameValuePairs.name;
  if (!name || name.length < 3) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("name must be at least 3 characters")));
  try {
    await profileService.editName(userid, name);
    return res.json(new Response(201, { message: "success", newName: name }));
  } catch (e) {
    logger.error(formErrorBody(e as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

const editUserIdController = async (req: express.Request, res: express.Response) => {
  let userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  let updateUserid = req.body.nameValuePairs.newUserId;
  if (!updateUserid || updateUserid.length < 6) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("userid must be at least 6 characters")));
  try {
    const result = await profileService.editUserId(userid, updateUserid);
    if (result.conflict) return res.status(409).json(new ApiError(409, apiErrorType.API_ERROR, new ErrorDetails("userid already exists")));
    return res.json(new Response(200, { token: result.token, userid: result.userid }));
  } catch (e) {
    logger.error(formErrorBody(e as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

const editUserBioController = async (req: express.Request, res: express.Response) => {
  let userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  let bio = req.body.nameValuePairs.bioText;
  if (!bio) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide a bio text")));
  try {
    await profileService.editBio(userid, bio);
    return res.json(new Response(201, "successfully updated user"));
  } catch (e) {
    logger.error(formErrorBody(e as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

const editProfileController = async (req: express.Request, res: express.Response) => {
  let userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  try {
    const isProduction = isProductionMode();
    const url = await profileService.editProfilePic(userid, req.file, isProduction);
    if (!url) return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
    return res.json(new Response(201, { url: url, message: "success" }));
  } catch (e) {
    logger.error(formErrorBody(e as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

export { editNameController, editUserIdController, editUserBioController, editProfileController };
