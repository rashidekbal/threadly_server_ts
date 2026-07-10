import { Router } from "express";
import adminAuthorizationVerification from "../../middlewares/adminAuthTokenValidator.js";
import checkAdminAccess from "../../middlewares/adminAccessCheck.middleware.js";
import { getAnomaliesController, resolveAnomalyController } from "../../controller/admin/anomaly.controller.js";

const router = Router();
router.route("/").get(adminAuthorizationVerification, checkAdminAccess, getAnomaliesController);
router.route("/:anomalyId").patch(adminAuthorizationVerification, checkAdminAccess, resolveAnomalyController);
export default router;
