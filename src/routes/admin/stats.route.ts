import {Router}from "express";

import checkAdminAccess from "../../middlewares/adminAccessCheck.middleware.js";
import {statsController } from "../../controller/admin/stats.controller.js";
import adminAuthorizationVerification from "../../middlewares/adminAuthTokenValidator.js";

const router=Router();
router.route("/").get(adminAuthorizationVerification,checkAdminAccess,statsController);
export default router;