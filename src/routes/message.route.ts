import { Router } from "express";
import verifyToken from "../middlewares/authorization.js";
import {
  deleteMessageForRoleController,
  getAllChatsController,
  getMsgPendingHistoryController,
  getpendingMessagesController,
  sendMessageController,
  UnsendMessageController,
  updateMessageSeenStatusController,
  uploadMessageMedia,
} from "../controller/message.controller.js";
import { uploadtoDisk, uploadToRam } from "../middlewares/multer.js";
import { isProductionMode } from "../utils/envValuesAccessInterface.js";

const router = Router();

router
  .route("/checkPendingMessages")
  .get(verifyToken, getMsgPendingHistoryController);
router
  .route("/getPendingMessages")
  .post(verifyToken, getpendingMessagesController);
router.route("/sendMessage").post(verifyToken, sendMessageController);
router
  .route("/updateMessageDeliveryStatus")
  .post(verifyToken, updateMessageSeenStatusController);
if (isProductionMode()) {
  router
    .route("/uploadMedia")
    .post(verifyToken, uploadToRam.single("media"), uploadMessageMedia);
} else {
  router
    .route("/uploadMedia")
    .post(verifyToken, uploadtoDisk.single("media"), uploadMessageMedia);
}
router.route("/getAllChats").get(verifyToken, getAllChatsController);
router
  .route("/deleteMessageForMe")
  .patch(verifyToken, deleteMessageForRoleController);
router.route("/unSendMessage").patch(verifyToken, UnsendMessageController);

export default router;
