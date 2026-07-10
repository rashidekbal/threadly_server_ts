import { Router } from "express";
import { getUserPostsController, getAllPostsController, deletePostController, getSinglePostController } from "../../controller/admin/post.controller.js";
import checkAdminAccess from "../../middlewares/adminAccessCheck.middleware.js";
import adminAuthorizationVerification from "../../middlewares/adminAuthTokenValidator.js";

const router = Router();
router.route("/").get(adminAuthorizationVerification, checkAdminAccess, getAllPostsController);
router.route("/:postid").delete(adminAuthorizationVerification, checkAdminAccess, deletePostController);
router.route("/user/:userid").get(adminAuthorizationVerification, checkAdminAccess, getUserPostsController);
router.route("/single/:postid").get(adminAuthorizationVerification, checkAdminAccess, getSinglePostController);
export default router;