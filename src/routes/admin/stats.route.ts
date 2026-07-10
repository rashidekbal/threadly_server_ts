import { Router } from "express";
import checkAdminAccess from "../../middlewares/adminAccessCheck.middleware.js";
import { statsController, getAnalyticsController, getSystemScanController, getDashboardReportController } from "../../controller/admin/stats.controller.js";
import adminAuthorizationVerification from "../../middlewares/adminAuthTokenValidator.js";
import { getPlatformActivityController } from "../../controller/admin/activityLog.controller.js";

const router = Router();
router.route("/").get(adminAuthorizationVerification, checkAdminAccess, statsController);
router.route("/analytics").get(adminAuthorizationVerification, checkAdminAccess, getAnalyticsController);
router.route("/activity").get(adminAuthorizationVerification, checkAdminAccess, getPlatformActivityController);
router.route("/scan").get(adminAuthorizationVerification, checkAdminAccess, getSystemScanController);
router.route("/report").get(adminAuthorizationVerification, checkAdminAccess, getDashboardReportController);
export default router;