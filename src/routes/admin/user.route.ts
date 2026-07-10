import { Router } from "express";
import { deleteUserProfilePicController, editUserInfoController, editUserProfilePicController, getUserInfoController, getUsersController, overridePasswordController, restrictUserController, unRestrictUserController} from "../../controller/admin/user.controller.js";
import checkAdminAccess from "../../middlewares/adminAccessCheck.middleware.js";
import { uploadtoDisk } from "../../middlewares/multer.js";
import adminAuthorizationVerification from "../../middlewares/adminAuthTokenValidator.js";
import { getUserActivityLogController } from "../../controller/admin/activityLog.controller.js";
const router=Router();
router.route("/").get(adminAuthorizationVerification,checkAdminAccess,getUsersController);
router.route("/:userid").get(adminAuthorizationVerification,checkAdminAccess,getUserInfoController);
router.route("/overridePassword").patch(adminAuthorizationVerification,checkAdminAccess,overridePasswordController);
router.route("/edit").patch(adminAuthorizationVerification,checkAdminAccess,editUserInfoController);
router.route("/editProfilePic/:uuid").patch(adminAuthorizationVerification,checkAdminAccess,uploadtoDisk.single("image"),editUserProfilePicController)
router.route("/editProfilePic/:uuid").delete(adminAuthorizationVerification,checkAdminAccess,deleteUserProfilePicController);
router.route("/restrict/:uuid").patch(adminAuthorizationVerification,checkAdminAccess,restrictUserController);
router.route("/unRestrict/:uuid").patch(adminAuthorizationVerification,checkAdminAccess,unRestrictUserController);
router.route("/activity/:userid").get(adminAuthorizationVerification, checkAdminAccess, getUserActivityLogController);
export default router