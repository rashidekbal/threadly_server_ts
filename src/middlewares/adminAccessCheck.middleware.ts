import ApiError from "../constants/apiError.js";
import apiErrorType from "../constants/apiErrorTypesEnum.js";
import express, { NextFunction } from "express";
import AuthError_body from "../constants/authErrorBody.js";
async function checkAdminAccess(req:express.Request,res:express.Response,next:NextFunction){
    const {authenticated,role,power,email}=req.body.ObtainedData;
    if(!authenticated||(role!="admin"))return res.status(401).json(new ApiError(401, apiErrorType.AUTH_ERROR,new AuthError_body("INVALID_TOKEN","your token might be corrupted")));
    next();
}
export default checkAdminAccess;