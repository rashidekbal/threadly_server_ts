import connection from "../db/connection.js";
import ApiError from "../constants/apiError.js";
import { isvalidEmail } from "../utils/regex.js";
import fetchDb from "../utils/dbQueryHelper.js";
import apiErrorType from "../constants/apiErrorTypesEnum.js";
import logger, { formErrorBody } from "../utils/pino.js";
import express, { NextFunction } from "express";
import ErrorDetails from "../constants/errorDetails.js";
import UserRepo from "../repo/userRepo.js";
const userRepo=new UserRepo();
// function ifUserExistsMobile(req:express.Request, res:express.Response, next:NextFunction) {
//   let phone = req.body.nameValuePairs.phone;
//   if (!phone || phone.length < 10) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR,new ErrorDetails("please provide a valid phoneNumber")));

//   let query = `select * from users where phone ='${phone}'`;
//   connection.query(query, (err, response) => {
//     if (!err) {
//       if (response.length > 0) return res.status(409).json(new ApiError(409,API_ERROR ,{}));
//       next();
//     } else {
//       logger.error(formErrorBody(err,req));
//       return res.status(500).json(new ApiError(500, API_ERROR,{}));
//     }
//   });
// }
async function ifUserExistsEmail(req:express.Request, res:express.Response, next:NextFunction) {

  try {
     let email = req.body.nameValuePairs.email;
  let isEmailValid =isvalidEmail(email)
  if (!isEmailValid) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR,new ErrorDetails("please provide a valid email")));
    let response=await userRepo.fetchUserforAuth("email",email);
    if(!(response instanceof Array))return res.status(500).json(new ApiError(500,apiErrorType.API_ERROR,new ErrorDetails(null)))
    if (response.length > 0) return res.status(409).json(new ApiError(409,apiErrorType.API_ERROR, new ErrorDetails("user already exists")));
    return next();
  } catch (error) {
    logger.error(formErrorBody(error as string,500,req));
    return res.status(500).json(new ApiError(500,apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
}
export {
    //  ifUserExistsMobile,
     ifUserExistsEmail };



