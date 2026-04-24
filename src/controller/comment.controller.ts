import logger, { formErrorBody } from "../utils/pino.js";
import ApiError from "../constants/apiError.js";
import Response from "../constants/Response.js";
import apiErrorType from "../constants/apiErrorTypesEnum.js";
import express from "express";
import ErrorDetails from "../constants/errorDetails.js";
import { commentService } from "../services/index.service.js";

let addComentController = async (req: express.Request, res: express.Response) => {
  let userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  let postid = req.body.nameValuePairs.postid;
  let comment = req.body.nameValuePairs.comment;
  if (!postid || !comment) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide postid and comment")));
  try {
    let response: any = await commentService.addComment(userid, Number(postid), comment);
    res.json(new Response(201, { commentid: response.insertId }));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

let removeCommentController = async (req: express.Request, res: express.Response) => {
  let userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  let postid = req.body.nameValuePairs.postid;
  let commentid = req.body.nameValuePairs.commentid;
  if (!postid) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide a valid postid")));
  try {
    await commentService.removeComment(userid, Number(postid), Number(commentid));
    res.status(201).json(new Response(201, { msg: "success" }));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

async function getComments(req: express.Request, res: express.Response) {
  let userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  let postid = req.params.postid;
  if (!postid) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide a valid postid")));
  try {
    let response = await commentService.getComments(userid, Number(postid));
    res.json(new Response(200, response));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
}

const replyToCommentController = async (req: express.Request, res: express.Response) => {
  const userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  let ReplyToCommentId = req.params.commentId;
  const data = req.body.nameValuePairs;
  const postId = data.postId;
  const reply = data.comment;
  if (!ReplyToCommentId || !postId || !reply) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide all required fields")));
  try {
    let response: any = await commentService.addReply(userid, Number(postId), reply, ReplyToCommentId);
    res.json(new Response(201, { commentid: response.insertId }));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
};

async function getReplyOfCommentController(req: express.Request, res: express.Response) {
  let userid = req.auth?.userid;
  if (!userid)
    return res.status(403).json(new ApiError(403, apiErrorType.AUTH_ERROR, new ErrorDetails("please provide a valid jwt token")));
  let commentid = req.params.commentId;
  if (!commentid) return res.status(400).json(new ApiError(400, apiErrorType.API_ERROR, new ErrorDetails("please provide a valid commentId")));
  try {
    let response = await commentService.getCommentReplies(userid, Number(commentid));
    res.json(new Response(200, response));
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req));
    res.status(500).json(new ApiError(500, apiErrorType.API_ERROR, new ErrorDetails(null)));
  }
}

export { removeCommentController, addComentController, getComments, replyToCommentController, getReplyOfCommentController };
