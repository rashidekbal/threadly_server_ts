import { Router } from "express";
import verifyToken from "../middlewares/authorization.js";
import { searchController } from "../controller/search.controller.js";
const router=Router();
router.route("/get").get(verifyToken,searchController)

export default router;
