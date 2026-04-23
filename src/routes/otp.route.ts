import express from "express";
import {
  generateOtpEmail,
//   sendOtpMobile,
  verifyOtpEmail,
//   verifyOtpMobile,
} from "../controller/otp.controller.js";
import {
  ifUserExistsEmail,
//   ifUserExistsMobile,
} from "../middlewares/userExistanceCheck.js";

import {
  userEmailExistanceForgetPassword,
//   userMobileExistanceForgetPassword,
} from "../middlewares/userExistanceCheckForgetPassword.js";
let router = express.Router();

// mobile otp section
//generate mobile otp
// router.post("/generateOtpMobile", ifUserExistsMobile, sendOtpMobile);
// //regenerate mobile otp
// router.post("/resendOtpMobile", ifUserExistsMobile, async (req, res) => {
//   let phone = req.body.nameValuePairs.phone;
//   try {
//  await fetchDb(`delete from otpmodel where phone_email =?`, [
//       phone,
//     ]);
//   } catch (error) {}
//   sendOtpMobile(req, res);
// });
//generate mobile otp for forget password
// router.post(
//   "/ForgetPasswordGenerateOtpMobile",
//   userMobileExistanceForgetPassword,
//   sendOtpMobile
// );
// verify mobile otp
// router.post("/verifyOtpMobile", verifyOtpMobile);

//emial otp section

//generate email otp
router.post("/generateOtpEmail", ifUserExistsEmail, generateOtpEmail);

//resend opt email
router.post("/resendOtpEmail", ifUserExistsEmail, generateOtpEmail);

// verify email otp
router.post("/verifyOtpEmail", verifyOtpEmail);

//generate email otp for forget password
router.post(
  "/ForgetPasswordGenerateOtpEmail",
  userEmailExistanceForgetPassword,
  generateOtpEmail
);

export default router;
