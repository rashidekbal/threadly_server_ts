import { Router } from "express";
import verifyToken from "../middlewares/authorization.js";
import {
  ApproveFollowRequestController,
  cancelFollowRequestController,
  followController,
  followControllerV2,
  getAllFollowRequestsController,
  getFollowersController,
  getFollowingController,
  rejectFollowRequest,
  unfollowController,
} from "../controller/follow.controller.js"
import CheckIfFollowExists from "../middlewares/checkFollowExistance.js";
import accessCheckLayer from "../middlewares/accessCheckLayer.js";
let router = Router();
router.route("/follow").post(verifyToken, followController);
router.route("/follow/V2").post(verifyToken, CheckIfFollowExists,followControllerV2);
router.route("/cancelFollowRequest").post(verifyToken,cancelFollowRequestController)
router.route("/acceptFollowRequest").post(verifyToken,ApproveFollowRequestController)
router.route("/unfollow").post(verifyToken, unfollowController);
router.route("/getFollowers/:userid").get(verifyToken,accessCheckLayer, getFollowersController);
router.route("/getFollowings/:userid").get(verifyToken, accessCheckLayer,getFollowingController);
router.route("/getAllFollowRequests").get(verifyToken,getAllFollowRequestsController);
router.route("/rejectFollowRequest/:followerId").delete(verifyToken,rejectFollowRequest);
export default router;
