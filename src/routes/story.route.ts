import { Router } from "express";
import verifyToken from "../middlewares/authorization.js";
import {
  addStoryController,
  getMyStoriesController,
  getStoriesAllController,
  getStoryOfUserController,
  removeStory,
  StoryViewRecordController,
} from "../controller/story.controller.js";
import { isProductionMode } from "../utils/envValuesAccessInterface.js";
import { uploadtoDisk, uploadToRam } from "../middlewares/multer.js";
import accessCheckLayer from "../middlewares/accessCheckLayer.js";
import { storyViewed_by_User_controller } from "../controller/postStats.controller.js";

const router = Router();
const isProduction = isProductionMode();
if (isProduction) {
  router
    .route("/addStory")
    .post(verifyToken, uploadToRam.single("media"), addStoryController);
} else {
  router
    .route("/addStory")
    .post(verifyToken, uploadtoDisk.single("media"), addStoryController);
}
router.route("/removeStory/:storyid").delete(verifyToken, removeStory);
router.route("/getStories").get(verifyToken, getStoriesAllController);
router.route("/getMyStories").get(verifyToken, getMyStoriesController);
router.route("/getStories/:userid").get(verifyToken,accessCheckLayer ,getStoryOfUserController);
router.route("/storyViewed/:storyid").post(verifyToken,StoryViewRecordController);
router.route("/:storyid/viewedby").get(verifyToken,storyViewed_by_User_controller);
export default router;
