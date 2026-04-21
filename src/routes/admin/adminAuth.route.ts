import { Router } from "express";
import { LoginController } from "../../controller/admin/adminAuth.controller.js";
const router = Router();
router.route("/login").post(LoginController);
export default router;
