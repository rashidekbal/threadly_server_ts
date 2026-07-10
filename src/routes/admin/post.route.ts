import { Router } from "express";
import { getUserPostsController, getAllPostsController, deletePostController } from "../../controller/admin/post.controller.js";
import checkAdminAccess from "../../middlewares/adminAccessCheck.middleware.js";
import adminAuthorizationVerification from "../../middlewares/adminAuthTokenValidator.js";

const router = Router();
router.route("/").get(adminAuthorizationVerification, checkAdminAccess, getAllPostsController);
router.route("/:postid").delete(adminAuthorizationVerification, checkAdminAccess, deletePostController);
router.route("/user/:userid").get(adminAuthorizationVerification, checkAdminAccess, getUserPostsController);
export default router;