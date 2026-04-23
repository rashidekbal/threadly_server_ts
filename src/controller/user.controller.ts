import logger, { formErrorBody } from "../utils/pino.js";
import fetchDb from "../utils/dbQueryHelper.js"; // Helper function for database queries
import ApiError from "../constants/apiError.js";
import apiErrorType from "../constants/apiErrorTypesEnum.js";
import express from "express"
import ErrorDetails from "../constants/errorDetails.js";
import { userService } from "../services/index.service.js";
async function getSuggestUsersController(req:express.Request, res:express.Response) {
  let userid = req.body.userid; // Extract user ID from the request
  try {
    // Execute the query with the user's ID as parameter
    let response = await userService.getSuggestedUsers(userid,1);

    // Send the query response
    res.json({ status: 200, data: response });
  } catch (err) {
    logger.error(formErrorBody(err as string,500,req)); // Log any errors for debugging
    return res.status(500).json(new ApiError(500, apiErrorType.API_ERROR,new ErrorDetails("internal server error"))); // Return 500 Internal Server Error on failure
  }
}

/**
 * Controller to fetch specific user information.
 * - Retrieves detailed data about the selected user.
 * - Includes post-count, follower count, following-count, and relations to the requesting user.
//  */
// async function getUserController(req:express.Request, res:express.Response) {
//   let userid = req.body.userid; // Extract user ID from the request
//   let useridtofetch = req.params.userid; // Extract ID of the user to fetch
//   if (!useridtofetch) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR,new ErrorDetails("please provide valid userid"))); // Return 400 Bad Request if no user ID is provided

//   // SQL query to fetch detailed user data along with counts (posts, followers, following

//   const query = `
//     SELECT 
//       users.userid,
//       users.username,
//       users.profilepic,
//       users.bio,
//       users.isPrivate,
//       COUNT(DISTINCT imgpsts.postid) AS Posts,
//       COUNT(DISTINCT following.followid) AS Following,
//       COUNT(DISTINCT followersCount.followid) AS Followers,
//       COUNT(DISTINCT isFollowedByUser.followerid) AS isFollowedByUser,
//       coalesce(isFollowedByUser.isApproved,-1) as isApproved
//       ,
//       COUNT(DISTINCT isFollowingUser.followid) AS isFollowingUser
//     FROM 
//       users
//     LEFT JOIN 
//       imagepost AS imgpsts ON users.userid=imgpsts.userid
//     LEFT JOIN 
//       followers AS following ON following.followerid=users.userid and following.isApproved=true
//     LEFT JOIN 
//       followers AS followersCount ON users.userid=followersCount.followingid and followersCount.isApproved=true
//     LEFT JOIN 
//       followers AS isFollowedByUser ON users.userid=isFollowedByUser.followingid 
//       AND isFollowedByUser.followerid=? and ( isFollowedByUser.isApproved=false or isFollowedByUser.isApproved=true)
//     LEFT JOIN 
//       followers AS isFollowingUser ON users.userid=isFollowingUser.followerid 
//       AND isFollowingUser.followingid=? AND isFollowingUser.isApproved=true
//     WHERE 
//       users.userid=?
//     GROUP BY 
//       users.userid;
//   `;

//   try {
//     // Execute the query with the user ID parameters
//     let response = await fetchDb(query, [userid, userid, useridtofetch]);
//     return res.json({ status: 200, data: response }); // Return query results
  
//   } catch (err) {
//     logger.error(formErrorBody(err,req)); // Log any errors
//     return res.status(500).json(new ApiError(500,API_ERROR ,{})); // Return 500 Internal Server Error on failure
//   }
// }

// async function getUserByUUidController(req, res) {
//   let uuid = req.params.uuid; // Extract ID of the user to fetch
//   if (!uuid) return res.status(400).json(new ApiError(400, API_ERROR,{})); // Return 400 Bad Request if no user ID is provided

//   // SQL query to fetch detailed user data along with counts (posts, followers, following

//   const query = `
//     SELECT 
//       userid,
//       username,
//       profilepic from users  where 
//       uuid=?

//   `;

//   try {
//     // Execute the query with the user ID parameters
//     let response = await fetchDb(query, [uuid]);

//     return res.json({ status: 200, data: response }); // Return query results
//   } catch (err) {
//     logger.error(formErrorBody(err,req));// Log any errors
//     return res.status(500).json(new ApiError(500, API_ERROR,{})); // Return 500 Internal Server Error on failure
//   }
// }

// /**
//  * Controller to fetch data about the requesting user.
//  * - Retrieves profile details and activity counts for the user.
//  * - Includes count of posts, followers, and following of users.
//  */
// async function getMyDataController(req, res) {
//   let userid = req.ObtainedData; // Extract user ID from the request

//   // SQL query to retrieve the user's profile data and activity stats
//   let query = `
//     SELECT 
//       u.userid,
//       u.username,
//       u.bio,
//       u.profilepic,
//       u.createdAt,
//       u.dob,
//       u.isPrivate,
//       COUNT(DISTINCT imp.postid) AS PostsCount, 
//       COUNT(DISTINCT follows.followerid) AS followersCount,
//       COUNT(DISTINCT following.followingid) AS followingCount
//     FROM 
//       users AS u
//     LEFT JOIN 
//       imagepost AS imp ON u.userid=imp.userid
//     LEFT JOIN 
//       followers AS follows ON u.userid=follows.followingid and follows.isApproved=1
//     LEFT JOIN 
//       followers AS following ON u.userid=following.followerid and following.isApproved=1
//     WHERE 
//       u.userid=?
//     GROUP BY 
//       u.userid;
//   `;

//   try {
//     // Execute the query with the user ID as a parameter
//     let response = await fetchDb(query, [userid]);

//     return res.json({ status: 200, data: response }); // Return query results
//   } catch (err) {
//    logger.error(formErrorBody(err,req)); // Log any errors
//     return res.status(500).json(new ApiError(500, API_ERROR,{})); // Return 500 Internal Server Error on failure
//   }
// }

// Export controllers for use in other parts of the application
export {
  getSuggestUsersController,
//   getUserController,
//   getMyDataController,
//   getUserByUUidController,
};

