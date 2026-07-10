import logger, { formErrorBody } from "../../utils/pino.js";
import Response from "../../constants/Response.js";
import ApiError from "../../constants/apiError.js";
import { uploadOnColudinaryviaLocalPath } from "../../services/cloudinary.js";
import express from "express";
import apiErrorType from "../../constants/apiErrorTypesEnum.js";
import { get_CurrentTimeStamp_Sql_Format } from "../../utils/helperFunctions.js";
import ErrorDetails from "../../constants/errorDetails.js";
import {
    editUserProfile,
  getUserInfo,
  getUsers,
  overridePassword,
  restrictUser,
  unRestrictUser,
  userinfoEdit,
  softDeleteUser,
  unDeleteUser,
} from "../../repo/adminRepo.js";
import RedisHelper from "../../redis/operation.js";
import { v4 as UUIDv4 } from "uuid";
import bcryptUtil from "../../utils/bcryptUtil.js";
import fetchDb from "../../utils/dbQueryHelper.js";

const getUsersController = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const search = req.query.search as string || "";
    const sort = req.query.sort as string || "";
    const result = await getUsers(page, false, search, sort);
    return res.json(new Response(200, result));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          apiErrorType.API_ERROR,
          new ErrorDetails("something went wrong..."),
        ),
      );
  }
};

const getDeletedUsersController = async (req: express.Request, res: express.Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const search = req.query.search as string || "";
    const sort = req.query.sort as string || "";
    const result = await getUsers(page, true, search, sort);
    return res.json(new Response(200, result));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

const createUserController = async (req: express.Request|any, res: express.Response) => {
  try {
    let { userid, username, email, phone, pass, bio, dob, isPrivate } = req.body;
    let filePath = req.file?.path;
    
    if (!userid || !username || !pass || !dob) {
      return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("Missing required fields")));
    }

    const hashedPassword = await bcryptUtil.hashPassword(pass);
    const uuid = UUIDv4();
    const sessionId = UUIDv4();
    let profilepic = null;

    if (filePath) {
      profilepic = await uploadOnColudinaryviaLocalPath(filePath);
    }
    
    const privateInt = (isPrivate === 'true' || isPrivate === true) ? 1 : 0;

    const query = `INSERT INTO users (userid, username, email, phone, pass, bio, dob, uuid, sessionId, isPrivate, profilepic) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      userid, username, email || null, phone || null, hashedPassword, bio, dob, uuid, sessionId, privateInt, profilepic
    ];
    
    await fetchDb(query, params);
    
    return res.status(201).json(new Response(201, { message: "User created successfully" }));
  } catch (error: any) {
    logger.error(formErrorBody(error as string, 500, req));
    if (error?.code === 'ER_DUP_ENTRY') {
      return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("User ID, email, or phone already exists")));
    }
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails("Failed to create user")));
  }
};

const deleteUserController = async (req: express.Request, res: express.Response) => {
  try {
    const userid = req.params.userid;
    if (!userid) {
      return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("Please provide a valid userid")));
    }
    
    await softDeleteUser(userid);
    return res.json(new Response(200, { message: "User deleted successfully" }));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails("Failed to delete user")));
  }
};

const getUserInfoController = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const userid = req.params.userid;
    if (!userid)
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            apiErrorType.API_ERROR,
            new ErrorDetails("please provide a valid userid"),
          ),
        );

    const result = await getUserInfo(userid as string);
    return res.json(new Response(200, result));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          apiErrorType.API_ERROR,
          new ErrorDetails("something went wrong..."),
        ),
      );
  }
};
const overridePasswordController = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const newPassword = req.body.newPassword;
    const uuid = req.body.uuid;
    if (!uuid || newPassword.length < 6)
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            apiErrorType.API_ERROR,
            new ErrorDetails("invalid request body"),
          ),
        );
    await overridePassword(uuid, newPassword);
    return res.status(201).json(new Response(201, { message: "success" }));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res
      .status(500)
      .json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};
const editUserInfoController = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { userid, username, email, uuid } = req.body;
    if (!userid || !username || !email || !uuid)
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            apiErrorType.API_ERROR,
            new ErrorDetails("please provide all the required fields"),
          ),
        );

    await userinfoEdit({userid,username,email,uuid})
    return res.status(201).json(new Response(201, { message: "success" }));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res
      .status(500)
      .json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};
const editUserProfilePicController = async (req:express.Request|any, res:express.Response) => {

  try {
  const uuid = req.params.uuid;
  const filePath = req.file?.path;
  
  if (!filePath || !uuid)
    return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please attach the file for processing")));
    const url = await uploadOnColudinaryviaLocalPath(filePath);
    await editUserProfile(url as string,uuid)
    res.status(201).json(new Response(201, {message:"success"}));
  } catch (error) {
    logger.error(formErrorBody(error as string, null,req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};
const deleteUserProfilePicController = async (req:express.Request, res:express.Response) => {
  const uuid = req.params.uuid;

  if (!uuid) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide a valid uuid")));
  try {
    await editUserProfile(null,uuid)
    return res.status(200).json(new Response(200, {message:"success"}));
  } catch (error) {
    logger.error(formErrorBody(error as string,500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};
const unDeleteUserController = async (req: express.Request, res: express.Response) => {
  const userid = req.params.userid;
  if (!userid)
    return res
      .status(400)
      .json(
        new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("missing field")),
      );

  try {
    await unDeleteUser(userid);
    return res.status(200).json(new Response(200, { message: "success" }));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res
      .status(500)
      .json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

const restrictUserController = async (req:express.Request, res:express.Response) => {

  try {
      const uuid = req.params.uuid;
  if (!uuid) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide a valid uuid")));
  let banDuration = req.body.banDuration;
  const banReason = req.body.banReason;
  const userid = req.body.userid;
  if (!banDuration || !banReason || !userid)
    return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide all the required fields")));
  if (banDuration == 24) {
    banDuration = "24hr";
  } else {
    banDuration = "permanent";
  }

    let result = await restrictUser({
      banDuration,
      banned_at:get_CurrentTimeStamp_Sql_Format(),
      banReason,
      uuid,
  });
    await RedisHelper.deleteEntry(`UserSession:${userid}`)
    return res.status(200).json(new Response(200, result));
  } catch (error) {
    logger.error(formErrorBody(error as string,500, req));
    return res
      .status(500)
      .json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(error)));
  }
};
const unRestrictUserController = async (req:express.Request, res:express.Response) => {

  try {
      const uuid = req.params.uuid;
  if (!uuid) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide a valid uuid")));
    let result = await unRestrictUser(uuid);
    return res.status(200).json(new Response(200, result));
  } catch (error) {
    logger.error(formErrorBody(error as string,500, req));
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};
export {
  getUsersController,
  getUserInfoController,
  overridePasswordController,
  editUserInfoController,
  editUserProfilePicController,
  deleteUserProfilePicController,
  restrictUserController,
  unRestrictUserController,
  createUserController,
  deleteUserController,
  getDeletedUsersController,
  unDeleteUserController
};
