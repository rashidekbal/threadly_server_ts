import express from "express";
import "dotenv/config";
import {
  Login_email_controller,
  Login_mobile_controller,
  Login_userid_controller,
  logout_controller,
  registerUserEmailController,
  registerUserPhoneController,
  ResetPasswordController,
} from "../controller/auth.controller.js";
import verifyToken from "../middlewares/authorization.js";
import verifyOtpSignedToken from "../middlewares/verifySignedOtpToken.js";

let router = express.Router();
router.route("/login/mobile").post(Login_mobile_controller);
router.route("/login/email").post(Login_email_controller);
router.route("/login/userid").post(Login_userid_controller);
router.route("/register/mobile").post( verifyOtpSignedToken,registerUserPhoneController);
router.post("/register/email", verifyOtpSignedToken, registerUserEmailController);
router.route("/logout").get(verifyToken,logout_controller);
router.route("/resetPassword").post(verifyToken,ResetPasswordController);

export default router;
