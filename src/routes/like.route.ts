import { Router } from "express";
import verifyToken from "../middlewares/authorization.js";
import {
  CommentLikeContorller,
  CommentUnlikeController,
  likeStoryController,
  PostlikeController,
  PostunlikeController,
  UnlikeStoryController,
} from "../controller/like.controller.js";
let router = Router();
//this is for like and unlike a image post
router.route("/likePost/:postid").get(verifyToken, PostlikeController);
router.route("/unlikePost/:postid").get(verifyToken, PostunlikeController);

// route for liking and disliking story
router.route("/likeStory/:storyid").get(verifyToken, likeStoryController);
router.route("/unlikeStory/:storyid").get(verifyToken, UnlikeStoryController);

//route for liking and disliking a comment
router
  .route("/likeAComment/:commentid")
  .get(verifyToken, CommentLikeContorller);
router
  .route("/unlikeAComment/:commentid")
  .get(verifyToken, CommentUnlikeController);
export default router;
