import { Router } from "express";
import adminAuthorizationVerification from "../../middlewares/adminAuthTokenValidator.js";
import checkAdminAccess from "../../middlewares/adminAccessCheck.middleware.js";
import { getReportsController, updateReportStatusController } from "../../controller/admin/reports.controller.js";

const router = Router();
router.route("/").get(adminAuthorizationVerification, checkAdminAccess, getReportsController);
router.route("/:reportid").patch(adminAuthorizationVerification, checkAdminAccess, updateReportStatusController);
export default router;
