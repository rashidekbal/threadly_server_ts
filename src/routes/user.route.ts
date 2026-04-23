import { Router } from "express";
import verifyToken from "../middlewares/authorization.js";
import {
//   getMyDataController,
//   getUserController,
  getSuggestUsersController,
//   getUserByUUidController,
} from "../controller/user.controller.js";

let usersRouter = Router();
usersRouter.route("/getUsers").get(verifyToken, getSuggestUsersController);
// usersRouter.route("/getUser/:userid").get(verifyToken, getUserController);
// usersRouter
//   .route("/getUserByUUid/:uuid")
//   .get(verifyToken, getUserByUUidController);
// usersRouter.route("/getMyData").get(verifyToken, getMyDataController);

export default usersRouter;
