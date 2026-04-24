import logger, { formErrorBody } from "../utils/pino.js";
import ApiError from "../constants/apiError.js";
import Response from "../constants/Response.js";
import apiErrorType from "../constants/apiErrorTypesEnum.js";
import { followService } from "../services/index.service.js";
import express from "express";
import ErrorDetails from "../constants/errorDetails.js";

//new followController
let followControllerV2 = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const followerid = req.auth?.userid;
    if (!followerid)
      return res
        .status(403)
        .json(
          new ApiError(
            403,
            apiErrorType.AUTH_ERROR,
            new ErrorDetails("please provide a valid jwt token"),
          ),
        );

    let followingid = req.body.nameValuePairs.followingid;
    if (!followingid)
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            apiErrorType.API_ERROR,
            new ErrorDetails("please provide a valid userid to"),
          ),
        );

    let result = await followService.registerNewFollow(followerid, followingid);
    if (result?.status == "pending")
      return res.json(new Response(201, { status: "PENDING" }));
    res.json(new Response(201, { status: "SUCCESS" }));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    res
      .status(500)
      .json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};
// const rejectFollowRequest = async (req, res) => {
//   const userid = req.ObtainedData;
//   const followerId = req.params.followerId;
//   // console.log(followerId + " is follower ");
//   if (!followerId) return res.status(400).json(new ApiError(400,API_ERROR ,{}));
//   const query = `delete from followers where followerid=? and followingid=? and isApproved=false`;
//   try {
//     await fetchDb(query, [followerId, userid]);

//     return res.json(new Response(200, { msg: "success" }));
//   } catch (error) {
//     logger.error(formErrorBody(error,req));
//     res.status(500).json(new ApiError(500, API_ERROR,{}));
//   }
// };
// //cancel follow request from the follower end controller
// const cancelFollowRequestController = async (req, res) => {
//   let followerid = req.ObtainedData;
//   let followingid = req.body.nameValuePairs.followingid;
//   if (!followingid) return res.status(400).json(new ApiError(400,API_ERROR ,{}));
//   try {
//     const query = `delete from followers where followerid=? and  followingid=? and isApproved=false`;
//     await fetchDb(query, [followerid, followingid]);
//     notifyFollowRequestCancelled(followerid, followingid);
//     return res.json(new Response(200, { msg: "success" }));
//   } catch (error) {
//     logger.error(formErrorBody(error,req));
//     return res.status(500).json(new ApiError(500, API_ERROR,{}));
//   }
// };
// const ApproveFollowRequestController = async (req, res) => {
//   // console.log("Approve followRequest received");
//   let followingid = req.ObtainedData;
//   let followerid = req.body.nameValuePairs.followerId;
//   if (!followerid) return res.status(400).json(new ApiError(400, API_ERROR,{}));
//   try {
//     const query = `update followers set isApproved=true where followerid=? and  followingid=? and isApproved=false`;
//     await fetchDb(query, [followerid, followingid]);
//     notifyFollowRequestApproved(followerid, followingid);
//     return res.json(new Response(200, { msg: "success" }));
//   } catch (error) {
//     logger.error(formErrorBody(error,req));
//     return res.status(500).json(new ApiError(500,API_ERROR ,{}));
//   }
// };

// let unfollowController = async (req, res) => {
//   let followerid = req.ObtainedData;
//   let followingid = req.body.nameValuePairs.followingid;
//   if (!followingid) return res.status(400).json(new ApiError(400,API_ERROR ,{}));
//   let query =
//     "delete from followers where  followerid = ? and followingid=? and isApproved=true ";
//   try {
//     await fetchDb(query, [followerid, followingid]);
//     notifyUnFollow(followerid, followingid);
//     res.json(new Response(201, { mag: "success" }));
//   } catch (error) {
//    logger.error(formErrorBody(error,req));
//     res.status(500).json(new ApiError(500,API_ERROR ,{}));
//   }
// };

const getFollowersController = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const requestingUser = req.auth?.userid;
    if (!requestingUser)
      return res
        .status(403)
        .json(
          new ApiError(
            403,
            apiErrorType.AUTH_ERROR,
            new ErrorDetails("please provide a valid jwt token"),
          ),
        );

    let requestedUser = req.params.userid;
    if (!requestedUser)
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            apiErrorType.API_ERROR,
            new ErrorDetails(
              "please provide a valid userid to fetch its follower",
            ),
          ),
        );
    let response = await followService.getFollowers(
      requestingUser,
      requestedUser,
      1,
    );
    return res.json(new Response(200, response));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res
      .status(500)
      .json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

const getFollowingController = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const requestingUser = req.auth?.userid;
    if (!requestingUser)
      return res
        .status(403)
        .json(
          new ApiError(
            403,
            apiErrorType.AUTH_ERROR,
            new ErrorDetails("please provide a valid jwt token"),
          ),
        );
    let userid = req.params.userid;
    if (!userid)
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            apiErrorType.API_ERROR,
            new ErrorDetails(
              "please provide a valid userid to get following details",
            ),
          ),
        );

    let response = await followService.getFollowings(requestingUser, userid);
    return res.json(new Response(200, response));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res
      .status(500)
      .json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

const getAllFollowRequestsController = async (
  req: express.Request,
  res: express.Response,
) => {
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
    let response = await followService.getPendingFollowRequestWithUserDetails(
      userid,
      1,
    );
    // console.log(response);
    return res.json(new Response(200, response));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    return res
      .status(500)
      .json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

export {
  //   followController,
  //   unfollowController,
  getFollowersController,
  getFollowingController,
  followControllerV2,
  //   cancelFollowRequestController,
  //   ApproveFollowRequestController,
  //   notifyFollowRequestApproved,
  getAllFollowRequestsController,
  //   rejectFollowRequest,
};
