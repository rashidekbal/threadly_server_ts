import { Router } from "express";
import {
  resetPasswordEmailContorler,
  resetPasswordMobileContorler,
} from "../controller/forgetPassword.controller.js";
import verifyOtpSignedToken from "../middlewares/verifySignedOtpToken.js";

let router = Router();

router.post("/Mobile", verifyOtpSignedToken, resetPasswordMobileContorler);
router.post("/Email", verifyOtpSignedToken, resetPasswordEmailContorler);
export default router;
