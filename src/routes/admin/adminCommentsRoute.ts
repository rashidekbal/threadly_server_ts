import {Router} from "express"

import { getCommentsController } from "../../controller/admin/postComments.controller.js";
import checkAdminAccess from "../../middlewares/adminAccessCheck.middleware.js";
import adminAuthorizationVerification from "../../middlewares/adminAuthTokenValidator.js";

const router =Router();
router.route("/:postid").get(adminAuthorizationVerification,checkAdminAccess,getCommentsController)
export default router;