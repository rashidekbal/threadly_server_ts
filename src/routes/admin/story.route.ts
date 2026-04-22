import {Router} from "express"


import { getUserStoriesController } from "../../controller/admin/user.story.controller.js";
import checkAdminAccess from "../../middlewares/adminAccessCheck.middleware.js";
import adminAuthorizationVerification from "../../middlewares/adminAuthTokenValidator.js";
const router =Router();
router.route("/:userid").get(adminAuthorizationVerification,checkAdminAccess,getUserStoriesController)
export default router;