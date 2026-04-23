import { Router } from "express";
import verifyToken from "../middlewares/authorization.js";
import { setPrivateController, setPublicController } from "../controller/privacy.controller.js";
const router=Router();
router.route("/setPrivate").get(verifyToken,setPrivateController);
router.route("/setPublic").get(verifyToken,setPublicController);
export default router;