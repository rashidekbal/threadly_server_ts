import { Router } from "express";
import verifyToken from "../middlewares/authorization.js";
import {
  editNameController,
  editProfileController,
  editUserBioController,
  editUserIdController,
} from "../controller/profile.controller.js";
import { uploadtoDisk, uploadToRam } from "../middlewares/multer.js";
import { isProductionMode } from "../utils/envValuesAccessInterface.js";
const router = Router();
router.route("/edit/username").patch(verifyToken, editNameController);
router.route("/edit/userid").patch(verifyToken, editUserIdController);
router.route("/edit/bio").patch(verifyToken, editUserBioController);
if (isProductionMode()) {
  router.post(
    "/edit/Profile",
    verifyToken,
    uploadToRam.single("image"),
    editProfileController
  );
} else {
  router.post(
    "/edit/Profile",
    verifyToken,
    uploadtoDisk.single("image"),
    editProfileController
  );
}

export default router;
