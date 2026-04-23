// Database connection instance
import jwt from "jsonwebtoken"; // Library for generating and verifying JSON Web Tokens
import "dotenv/config"; // Enables usage of environment variables
// Helper function for executing database queries
import { isvalidEmail } from "../utils/regex.js"; // Regex pattern for validating email addresses
import Response from "../constants/Response.js"; // Class for standardized API responses
import ApiError from "../constants/apiError.js";
import apiErrorTypes from "../constants/apiErrorTypesEnum.js";
import logger, { formErrorBody } from "../utils/pino.js";
import { sendOtp, verifyOtp } from "eazyotp";
import APP_NAME from "../constants/appNameConstant.js";
import {
  getEazyOtpApiKey,
  getJWT_secretToken,
} from "../utils/envValuesAccessInterface.js";
import express from "express";
import ErrorDetails from "../constants/errorDetails.js";

/**
 * Function to send an OTP to a mobile number.
 * - Generates a random 6-digit OTP.
 * - Stores the OTP and phone number in the database.
 * - Sends the OTP via an external API to the user's mobile number.
 */
// let sendOtpMobile = (req, res) => {
//   let OTP = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit OTP
//   let phone = req.body.nameValuePairs.phone; // Extract the phone number from the request body

//   // SQL query to insert the OTP and phone number into the database
//   let query = `insert into otpmodel (phone_email,otp) values ('${phone}',${OTP})`;

//   // Execute the database query to store OTP
//   connection.query(query, (err, result) => {
//     if (!err) {
//       // Set up API request options to send OTP to the recipient's phone
//       let options = {
//         method: "POST",
//         url: "https://dbuddyz.com/send/",
//         formData: {
//           token: process.env.DBUDDY_API_KEY, // API key from environment variables
//           otp: OTP, // Generated OTP
//           tonumber: `+91` + phone, // Phone number with country code
//         },
//       };

//       // Send the OTP using the external API
//       request(options, (error, response) => {
//         if (!error) {
//           // OTP sent successfully, send success response
//           res.json(new Response(200, "success"));
//         } else {
//           // Handle error in sending the OTP
//           logger.error(formErrorBody(error,null));
//           res.status(500).json(new ApiError(500, API_ERROR,{}));
//         }
//       });
//     } else {
//       // Handle database insertion error
//       res.status(500).json(new ApiError(500, API_ERROR,{}));
//     }
//   });
// };

/**
 * Function to verify the OTP for a mobile number.
 * - Verifies if the OTP and phone number are provided in the request.
 * - Checks if OTP is valid (within the 5-minute timeframe).
 * - Generates a JWT token and sends it upon successful verification.
 */
// function verifyOtpMobile(req, res) {
//   let otp = req.body.nameValuePairs.otp; // Extract OTP from the request body
//   let phone = req.body.nameValuePairs.phone; // Extract phone number from the request body

//   // Return 400 Bad Request if OTP or phone number is missing
//   if (!otp || !phone) return res.status(400).json(new ApiError(400, API_ERROR,{}));

//   // SQL query to validate OTP within a 5-minute timeframe
//   let query = `SELECT * FROM otpmodel WHERE phone_email= ? AND otp=? AND createdAt >=NOW() -INTERVAL 5 MINUTE AND flag='false' `;

//   connection.query(query, [phone, otp], (err, response) => {
//     if (!err) {
//       if (response.length > 0) {
//         // Generate a JWT token for the user
//         let token = jwt.sign({ phone: phone }, process.env.SECRET_KEY, {
//           expiresIn: "5m", // Token expires in 5 minutes
//         });

//         // Delete the verified OTP from the database
//         connection.query(
//           `delete from otpmodel WHERE phone_email= '${phone}' AND otp='${otp}'`,
//           (error, result) => {
//             if(error){
//               logger.error(formErrorBody(error,null));
//             }
//           } // No extra action needed on deletion
//         );

//         res.json({ token: token }); // Send the token to the user
//       } else {
//         // Return 401 Unauthorized if OTP verification fails
//         res.status(401).json(new ApiError(401, AUTH_ERROR,{}));
//       }
//     } else {
//       // Handle server errors
//       res.status(500).json(new ApiError(500, API_ERROR,{ msg: "something went wrong" }));
//     }
//   });
// }

/**
 * Function to generate and send an OTP to an email address.
 * - Creates a random 6-digit OTP.
 * - Sends OTP using an email utility.
 * - Stores the email address and OTP in the database.
 */
async function generateOtpEmail(req: express.Request, res: express.Response) {
  try {
    let email = req.body.nameValuePairs.email;
    if (!email || !isvalidEmail(email))
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            apiErrorTypes.API_ERROR,
            new ErrorDetails("please check if the email is valid"),
          ),
        );
    await sendOtp(email, APP_NAME, getEazyOtpApiKey()); //send otp via eazyotp sdk
    res.json(new Response(200, "success")); // Send success response
  } catch (error) {
    logger.error(formErrorBody(error as string, 500, req)); // Log the error
    res
      .status(500)
      .json(new ApiError(500, apiErrorTypes.API_ERROR, new ErrorDetails(null))); // Return server error
  }
}

/**
 * Function to verify the OTP sent via email.
 * - Validates the email format using a regex pattern.
 * - Checks if the OTP is valid within a 5-minute timeframe.
 * - Generates a JWT token and sends it after successful verification.
 */
async function verifyOtpEmail(req: express.Request, res: express.Response) {
  try {
    let otp = req.body.nameValuePairs.otp; // Extract OTP from the request body
    let email = req.body.nameValuePairs.email; // Extract email address from the request body
    // Return 400 Bad Request if OTP or email is invalid
    if (!otp || !isvalidEmail(email))
      return res
        .status(400)
        .json(
          new ApiError(
            400,
            apiErrorTypes.API_ERROR,
            new ErrorDetails("please provide correct req body"),
          ),
        );
    const isOtpValid = await verifyOtp(email, otp, getEazyOtpApiKey());

    if (!isOtpValid)
      return res
        .status(401)
        .json(
          new ApiError(
            401,
            apiErrorTypes.AUTH_ERROR,
            new ErrorDetails("invalid otp"),
          ),
        );
    // Generate a JWT token for the user
    let token = jwt.sign({ email: email }, getJWT_secretToken(), {
      expiresIn: "5m", // Token expires in 5 minutes
    });

    return res.json({ token: token }); // Send the token to the user
  } catch (error) {
    // Handle server errors
    logger.error(formErrorBody(error as string, 500, req));
    res
      .status(500)
      .json(new ApiError(500, apiErrorTypes.API_ERROR, new ErrorDetails(null)));
  }
}

// Export the functions for use in other parts of the application
export {
  // sendOtpMobile, verifyOtpMobile,
  generateOtpEmail,
  verifyOtpEmail,
};
