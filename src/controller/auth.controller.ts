import ApiError from "../constants/apiError.js";
import "dotenv/config";

import Response from "../constants/Response.js";
import apiErrorType from "../constants/apiErrorTypesEnum.js";
import AccountRestriction_body from "../constants/accountRestrictionBody.js";
import AuthError_body from "../constants/authErrorBody.js";
import logger, { formErrorBody } from "../utils/pino.js";
import express from "express";
import ErrorDetails from "../constants/errorDetails.js";

import { authService } from "../services/index.service.js";

import ServiceError from "../constants/serviceError.js";
import ErrorEnum from "../constants/errorsEnum.js";
import BanType from "../constants/banTypeEnum.js";
import LoginType from "../constants/loginTypeEnum.js";
import registerUserType from "../types/registerUserType.js";

const Login_userid_controller = async (
  req: express.Request,
  res: express.Response,
) => {
  //used when user is in banned state ;
  let banDuration = "",
    banReason = "",
    banned_at = "";
  try {
    const nvp = req.body?.nameValuePairs;
    let userid = nvp?.userid;
    let password = nvp?.password;
    if (!password || !userid)
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            apiErrorType.API_ERROR,
            new ErrorDetails("please provide all the credentials"),
          ),
        );
    //create a valid usermodel
    const data: any = await authService.loginUserId(
      LoginType.userid,
      userid,
      password,
    );
    banDuration = data.userdata.banDuration;
    banReason = data.userdata.banReason;
    banned_at = data.userdata.banned_at;

    return res.json({
      message: "sucess",
      username: data.userdata.username,
      profile: data.userdata.profilepic,
      userid: data.userdata.userid,
      token: data.token,
      uuid: data.userdata.uuid,
      isPrivate: data.userdata.isPrivate,
    });
  } catch (e) {
    if (e instanceof ServiceError) {
      switch (e.type) {
        case ErrorEnum.user_not_exist:
          return res
            .status(403)
            .json(
              new ApiError(
                403,
                apiErrorType.AUTH_ERROR,
                new AuthError_body(
                  "USER DOES NOT EXIST",
                  "please check the userid",
                ),
              ),
            );

        case ErrorEnum.invalid_password:
          return res
            .status(403)
            .json(
              new ApiError(
                403,
                apiErrorType.AUTH_ERROR,
                new AuthError_body(
                  "INVALID PASSWORD",
                  "please check the password",
                ),
              ),
            );
        case ErrorEnum.banned:
          return res
            .status(403)
            .json(
              new ApiError(
                403,
                apiErrorType.ACCOUNT_RESTRICTION_ERROR,
                new AccountRestriction_body(
                  banDuration == "24hr" ? BanType.TEMPORARY : BanType.PERMANENT,
                  banReason,
                  banned_at,
                ),
              ),
            );
      }
      //when default case
      logger.error(formErrorBody(e.type + e.errorDetails, 500, req));
      return res
        .status(500)
        .json(
          new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)),
        );
    }
  }
};
const Login_email_controller = async (
  req: express.Request,
  res: express.Response,
) => {
  //used when user is in banned state ;
  let banDuration = "",
    banReason = "",
    banned_at = "";
  try {
    const nvp = req.body?.nameValuePairs;
    let email = nvp?.email;
    let password = nvp?.password;
    if (!password || !email)
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            apiErrorType.API_ERROR,
            new ErrorDetails("please provide all the credentials"),
          ),
        );
    //create a valid usermodel
    const data: any = await authService.loginUserId(
      LoginType.email,
      email,
      password,
    );
    banDuration = data.userdata.banDuration;
    banReason = data.userdata.banReason;
    banned_at = data.userdata.banned_at;

    return res.json({
      message: "sucess",
      username: data.userdata.username,
      profile: data.userdata.profilepic,
      userid: data.userdata.userid,
      token: data.token,
      uuid: data.userdata.uuid,
      isPrivate: data.userdata.isPrivate,
    });
  } catch (e) {
    if (e instanceof ServiceError) {
      switch (e.type) {
        case ErrorEnum.user_not_exist:
          return res
            .status(403)
            .json(
              new ApiError(
                403,
                apiErrorType.AUTH_ERROR,
                new AuthError_body(
                  "USER DOES NOT EXIST",
                  "please check the userid",
                ),
              ),
            );

        case ErrorEnum.invalid_password:
          return res
            .status(403)
            .json(
              new ApiError(
                403,
                apiErrorType.AUTH_ERROR,
                new AuthError_body(
                  "INVALID PASSWORD",
                  "please check the password",
                ),
              ),
            );
        case ErrorEnum.banned:
          return res
            .status(403)
            .json(
              new ApiError(
                403,
                apiErrorType.ACCOUNT_RESTRICTION_ERROR,
                new AccountRestriction_body(
                  banDuration == "24hr" ? BanType.TEMPORARY : BanType.PERMANENT,
                  banReason,
                  banned_at,
                ),
              ),
            );
      }
      //when default case
      logger.error(formErrorBody(e.type + e.errorDetails, 500, req));
      return res
        .status(500)
        .json(
          new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)),
        );
    }
  }
};
const Login_mobile_controller = async (
  req: express.Request,
  res: express.Response,
) => {
  //used when user is in banned state ;
  let banDuration = "",
    banReason = "",
    banned_at = "";
  try {
    const nvp = req.body?.nameValuePairs;
    let phone = nvp?.phone;
    let password = nvp?.password;
    if (!password || !phone)
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            apiErrorType.API_ERROR,
            new ErrorDetails("please provide all the credentials"),
          ),
        );
    //create a valid usermodel
    const data: any = await authService.loginUserId(
      LoginType.phone,
      phone,
      password,
    );
    banDuration = data.userdata.banDuration;
    banReason = data.userdata.banReason;
    banned_at = data.userdata.banned_at;

    return res.json({
      message: "sucess",
      username: data.userdata.username,
      profile: data.userdata.profilepic,
      userid: data.userdata.userid,
      token: data.token,
      uuid: data.userdata.uuid,
      isPrivate: data.userdata.isPrivate,
    });
  } catch (e) {
    if (e instanceof ServiceError) {
      switch (e.type) {
        case ErrorEnum.user_not_exist:
          return res
            .status(403)
            .json(
              new ApiError(
                403,
                apiErrorType.AUTH_ERROR,
                new AuthError_body(
                  "USER DOES NOT EXIST",
                  "please check the userid",
                ),
              ),
            );

        case ErrorEnum.invalid_password:
          return res
            .status(403)
            .json(
              new ApiError(
                403,
                apiErrorType.AUTH_ERROR,
                new AuthError_body(
                  "INVALID PASSWORD",
                  "please check the password",
                ),
              ),
            );
        case ErrorEnum.banned:
          return res
            .status(403)
            .json(
              new ApiError(
                403,
                apiErrorType.ACCOUNT_RESTRICTION_ERROR,
                new AccountRestriction_body(
                  banDuration == "24hr" ? BanType.TEMPORARY : BanType.PERMANENT,
                  banReason,
                  banned_at,
                ),
              ),
            );
      }
      //when default case
      logger.error(formErrorBody(e.type + e.errorDetails, 500, req));
      return res
        .status(500)
        .json(
          new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)),
        );
    }
  }
};

const logout_controller = async (
  req: express.Request,
  res: express.Response,
) => {
  let userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  try {
    await authService.logoutUser(userid);
    res.json(new Response(200, { msg: "ok" }));
  } catch (err) {
    logger.error(formErrorBody(err as string, 500, req));
    res
      .status(500)
      .json(
        new ApiError(
          500,
          apiErrorType.API_ERROR,
          new ErrorDetails("internal server error"),
        ),
      );
  }
};
async function registerUserEmailController(
  req: express.Request,
  res: express.Response,
) {

  try {
    let email = req.body.email; // Email of the user
    let password = req.body.nameValuePairs.password; // Password provided by user
    let dob = req.body.nameValuePairs.dob; // Date of birth of the user
    let username = req.body.nameValuePairs.username;

    // Check for missing required fields
    if (!email || !password || !dob || !username) {
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            apiErrorType.API_ERROR,
            new ErrorDetails("please provide all the required parameters"),
          ),
        ); // Bad Request: Missing required fields
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            apiErrorType.API_ERROR,
            new ErrorDetails("password must be of atleast 6 digits"),
          ),
        );
    }
    const userData: registerUserType = {
      username,
      email,
      password,
      bio: "new to threadly",
      dob,
    };
    const data = await authService.registerUser(userData);
    // Send a success response to the client
    res.json({
      message: "success", // Success message
      username: data.userdata.username, // Registered username
      profile: null, // Profile is currently null
      userid: data.userdata.userid,
      uuid: data.userdata.uuid, // Registered User ID
      token: data.token, // JWT token
    });
  } catch (error) {
    if (error instanceof ServiceError) {
        //handle service error
      if (error.type == ErrorEnum.notAdult) {
        return res
          .status(403)
          .json(
            new ApiError(
              403,
              apiErrorType.API_ERROR,
              new ErrorDetails("age must be above 18 or 18"),
            ),
          );
      } else if (error.type == ErrorEnum.internal_error) {
        logger.error(formErrorBody(error.errorDetails, 500, req));
        return res
          .status(500)
          .json(
            new ApiError(
              500,
              apiErrorType.API_ERROR,
              new ErrorDetails("internal server error"),
            ),
          );
      }
    }
    // Handle controller errors
    logger.error(formErrorBody(error as string, 500, req));
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          apiErrorType.API_ERROR,
          new ErrorDetails("internal server error"),
        ),
      );
  }
}
async function registerUserPhoneController(
  req: express.Request,
  res: express.Response,
) {

  try {
    let phone= req.body.phone; // Email of the user
    let password = req.body.nameValuePairs.password; // Password provided by user
    let dob = req.body.nameValuePairs.dob; // Date of birth of the user
    let username = req.body.nameValuePairs.username;

    // Check for missing required fields
    if (!phone || !password || !dob || !username) {
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            apiErrorType.API_ERROR,
            new ErrorDetails("please provide all the required parameters"),
          ),
        ); // Bad Request: Missing required fields
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            apiErrorType.API_ERROR,
            new ErrorDetails("password must be of atleast 6 digits"),
          ),
        );
    }
     if (String(phone).length < 10) {
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            apiErrorType.API_ERROR,
            new ErrorDetails("phone must be of 10 digit"),
          ),
        );
    }
    const userData: registerUserType = {
      username,
      phone,
      password,
      bio: "new to threadly",
      dob,
    };
    const data = await authService.registerUser(userData);
    // Send a success response to the client
    res.json({
      message: "success", // Success message
      username: data.userdata.username, // Registered username
      profile: null, // Profile is currently null
      userid: data.userdata.userid,
      uuid: data.userdata.uuid, // Registered User ID
      token: data.token, // JWT token
    });
  } catch (error) {
    if (error instanceof ServiceError) {
        //handle service error
      if (error.type == ErrorEnum.notAdult) {
        return res
          .status(403)
          .json(
            new ApiError(
              403,
              apiErrorType.API_ERROR,
              new ErrorDetails("age must be above 18 or 18"),
            ),
          );
      } else if (error.type == ErrorEnum.internal_error) {
        logger.error(formErrorBody(error.errorDetails, 500, req));
        return res
          .status(500)
          .json(
            new ApiError(
              500,
              apiErrorType.API_ERROR,
              new ErrorDetails("internal server error"),
            ),
          );
      }
    }
    // Handle controller errors
    logger.error(formErrorBody(error as string, 500, req));
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          apiErrorType.API_ERROR,
          new ErrorDetails("internal server error"),
        ),
      );
  }
}

export {
  Login_userid_controller,
  Login_email_controller,
  Login_mobile_controller,
  logout_controller,
  registerUserEmailController,
  registerUserPhoneController
};
