import { Router } from "express";
import verifyToken from "../middlewares/authorization.js";
import {
  addComentController,
  getComments,
  removeCommentController,
  replyToCommentController,
  getReplyOfCommentController
} from "../controller/comment.controller.js";

let router = Router();
router.route("/addComment").post(verifyToken, addComentController);
router.route("/removeComment").post(verifyToken, removeCommentController);
router.route("/getComments/:postid").get(verifyToken, getComments);
router.route("/replyTo/:commentId").post(verifyToken,replyToCommentController);
router.route("/getCommentReplies/:commentId").get(verifyToken,getReplyOfCommentController)
export default router;
