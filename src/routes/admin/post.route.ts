import {Router} from "express"


import { getUserPostsController } from "../../controller/admin/post.controller.js";
import checkAdminAccess from "../../middlewares/adminAccessCheck.middleware.js";
import adminAuthorizationVerification from "../../middlewares/adminAuthTokenValidator.js";
const router =Router();
router.route("/:userid").get(adminAuthorizationVerification,checkAdminAccess,getUserPostsController)
export default router;