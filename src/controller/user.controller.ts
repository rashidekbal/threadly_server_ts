import logger, { formErrorBody } from "../utils/pino.js";// Helper function for database queries
import ApiError from "../constants/apiError.js";
import apiErrorType from "../constants/apiErrorTypesEnum.js";
import express from "express";
import ErrorDetails from "../constants/errorDetails.js";
import { userService } from "../services/index.service.js";
async function getSuggestUsersController(
  req: express.Request,
  res: express.Response,
) {
  const userid = req.auth?.userid;
  if (!userid)
    return res
      .status(403)
      .json(
        new ApiError(
          403,
          apiErrorType.AUTH_ERROR,
          new ErrorDetails("please provide a valid jwt token"),
        ),
      );
  // Extract user ID from the request
  try {
    // Execute the query with the user's ID as parameter
    let response = await userService.getSuggestedUsers(userid, 1);

    // Send the query response
    res.json({ status: 200, data: response });
  } catch (err) {
    logger.error(formErrorBody(err as string, 500, req)); // Log any errors for debugging
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          apiErrorType.API_ERROR,
          new ErrorDetails("internal server error"),
        ),
      ); // Return 500 Internal Server Error on failure
  }
}

/**
 * Controller to fetch specific user information.
 * - Retrieves detailed data about the selected user.
 * - Includes post-count, follower count, following-count, and relations to the requesting user.
//  */
async function getUserController(req: express.Request, res: express.Response) {
  try {
    const userid = req.auth?.userid;
    if (!userid)
      return res
        .status(403)
        .json(
          new ApiError(
            403,
            apiErrorType.AUTH_ERROR,
            new ErrorDetails("please provide a valid jwt token"),
          ),
        );
    // Extract user ID from the request
    let useridtofetch = req.params.userid; // Extract ID of the user to fetch
    if (!useridtofetch)
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            apiErrorType.API_ERROR,
            new ErrorDetails("please provide valid userid"),
          ),
        ); // Return 400 Bad Request if no user ID is provided
    // Execute the query with the user ID parameters
    let response = await userService.getUserinfo(useridtofetch, userid);
    return res.json({ status: 200, data: response }); // Return query results
  } catch (err) {
    logger.error(formErrorBody(err as string, 500, req)); // Log any errors
    return res
      .status(500)
      .json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null))); // Return 500 Internal Server Error on failure
  }
}

async function getUserByUUidController(
  req: express.Request,
  res: express.Response,
) {
  // SQL query to fetch detailed user data along with counts (posts, followers, following

  try {
    let uuid = req.params.uuid; // Extract ID of the user to fetch
    if (!uuid)
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            apiErrorType.API_ERROR,
            new ErrorDetails("please provide a valid uuid"),
          ),
        ); // Return 400 Bad Request if no user ID is provided
    let response = await userService.getUserWithUUid(uuid);

    return res.json({ status: 200, data: response }); // Return query results
  } catch (err) {
    logger.error(formErrorBody(err as string, 500, req)); // Log any errors
    return res
      .status(500)
      .json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null))); // Return 500 Internal Server Error on failure
  }
}

// /**
//  * Controller to fetch data about the requesting user.
//  * - Retrieves profile details and activity counts for the user.
//  * - Includes count of posts, followers, and following of users.
//  */
async function getMyDataController(
  req: express.Request,
  res: express.Response,
) {
  try {
     const userid=req.auth?.userid;
            if(!userid)return res.status(403).json(new ApiError(403,apiErrorType.AUTH_ERROR,new ErrorDetails("please provide a valid jwt token")))
           // Extract user ID from the request

    // Execute the query with the user ID as a parameter
    let response = await userService.getLoggedInUserData(userid);

    return res.json({ status: 200, data: response }); // Return query results
  } catch (err) {
    logger.error(formErrorBody(err as string, 500, req)); // Log any errors
    return res
      .status(500)
      .json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null))); // Return 500 Internal Server Error on failure
  }
}

// Export controllers for use in other parts of the application
export {
  getSuggestUsersController,
  getUserController,
  getMyDataController,
  getUserByUUidController,
};
