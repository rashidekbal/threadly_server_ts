import express from "express";
import { uploadToRam, uploadtoDisk } from "../middlewares/multer.js";
import verifyToken from "../middlewares/authorization.js";
import { isProductionMode } from "../utils/envValuesAccessInterface.js";
import {
  addImagePost,
  addVideoPost,
  getImageFeed,
  getImageFeedV2,
  getPostinfo,
  getUserPostsController,
  getVideoFeed,
  getVideoFeedV2,
  postViewRecordController,
  removePost,
} from "../controller/post.controller.js";
import accessCheckLayer from "../middlewares/accessCheckLayer.js";
import { likedBy_User_controller, sharedBy_User_Record_controller } from "../controller/postStats.controller.js";
import { handlePostShareController } from "../controller/postShare.controller.js";
let ProductionMode = isProductionMode();
let Router = express.Router();
if (ProductionMode) {
  Router.route("/addImagePost").post(
    verifyToken,
    uploadToRam.single("image"),
    addImagePost
  );
} else {
  Router.route("/addImagePost").post(
    verifyToken,
    uploadtoDisk.single("image"),
    addImagePost
  );
}
if (ProductionMode) {
  Router.route("/addVideoPost").post(
    verifyToken,
    uploadToRam.single("video"),
    addVideoPost
  );
} else {
  Router.route("/addVideoPost").post(
    verifyToken,
    uploadtoDisk.single("video"),
    addVideoPost
  );
}
Router.route("/removePost/:postid").delete(verifyToken, removePost);
Router.route("/getImagePostsFeed").get(verifyToken, getImageFeed);//old
Router.route("/getImagePostsFeedv2").post(verifyToken, getImageFeedV2);
Router.route("/getVideoPostsFeed").get(verifyToken, getVideoFeed);//old
Router.route("/getVideoPostsFeedV2").post(verifyToken, getVideoFeedV2);
Router.get("/getUserPosts/:userid", verifyToken,accessCheckLayer ,getUserPostsController);
Router.route("/getPost/:postid").get(verifyToken,getPostinfo);
Router.route("/postViewed/:postid").post(verifyToken,postViewRecordController);
Router.route("/:postid/likedby").get(verifyToken,likedBy_User_controller);
Router.route("/share").post(verifyToken,handlePostShareController);
Router.route("/:postid/sharedby").get(verifyToken,sharedBy_User_Record_controller);


export default Router;
