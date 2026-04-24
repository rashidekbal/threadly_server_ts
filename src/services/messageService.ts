import MessageRepo from "../repo/messageRepo.js";
import UserRepo from "../repo/userRepo.js";
import { notifyStatusChanged, notifyUnSendMessage } from "../socketHandlers/SocketMainHandler.js";
import { getSocketId } from "../socketHandlers/ConnectedUsers.js";
import { socketIo } from "../app.js";
import message from "../types/message.type.js";
import {
  uploadOnColudinaryFromRam,
  uploadOnColudinaryviaLocalPath,
} from "./cloudinary.js";

export default class MessageService {
  messageRepo: MessageRepo;
  userRepo: UserRepo;
  constructor(messageRepo: MessageRepo, userRepo: UserRepo) {
    this.messageRepo = messageRepo;
    this.userRepo = userRepo;
  }

  getPendingHistory = async (userid: string) => {
    const uuid = await this.userRepo.getUUidFromUserId(userid);
    return this.messageRepo.getPendingHistory(uuid);
  };

  getPendingMessages = async (userid: string, senderUuid: string) => {
    const receiverUuid = await this.userRepo.getUUidFromUserId(userid);
    const response: any = await this.messageRepo.getPendingMessages(senderUuid, receiverUuid);
    for (let i = 0; i < response.length; i++) {
      await this.messageRepo.updateDeliveryStatus(senderUuid, receiverUuid, response[i].messageUid);
      notifyStatusChanged(senderUuid, response[i].messageUid, 2, false);
    }
    return response;
  };

  sendMessage = async (data: any) => {
    const {
      MsgUid: messageUid,
      replyToMessageId,
      senderProfilePic: senderProfile,
      senderName: senderUsername,
      senderUserId: senderUserid,
      senderUuid,
      receiverUuid,
      type = "text",
      msg: msgContent,
      timestamp,
      postLink,
      postId,
    } = data;

    const replyTo = replyToMessageId ? replyToMessageId : "null";
    const link = postLink ? postLink : " ";

    // socket delivery
    const socketId = getSocketId(receiverUuid);

    if (socketId != null) {
      socketIo.to(socketId).emit("StoC", {
        msg: msgContent, senderUuid, receiverUuid,
        username: senderUsername, userid: senderUserid, profile: senderProfile,
        MsgUid: messageUid, ReplyTOMsgUid: replyTo, type, link, postId, timestamp,
      });

      const msgData: message = {
        messageUid, replyToMessageId: replyTo, senderUUId: senderUuid, recieverUUId: receiverUuid,
        type, message: msgContent, postid: postId, postLink: link,
        creationTime: timestamp, deliveryStatus: 2, isDeleted: false
      };
      await this.messageRepo.addMessageToDb(msgData);
      return { MsgUid: messageUid, deliveryStatus: 2 };
    }

    // FCM fallback
    const response: any = await this.messageRepo.getFcmTokenByUuid(receiverUuid);
    const hasValidToken = response.length > 0 && response[0].fcmToken != null;

    if (hasValidToken) {
      // FCM send - to be enabled later
      const msgData: message = {
        messageUid, replyToMessageId: replyTo, senderUUId: senderUuid, recieverUUId: receiverUuid,
        type, message: msgContent, postid: postId, postLink: link,
        creationTime: timestamp, deliveryStatus: 2, isDeleted: false
      };
      await this.messageRepo.addMessageToDb(msgData);
      return { MsgUid: messageUid, deliveryStatus: 2 };
    }

    // No FCM token
    const msgData: message = {
      messageUid, replyToMessageId: replyTo, senderUUId: senderUuid, recieverUUId: receiverUuid,
      type, message: msgContent, postid: postId, postLink: link,
      creationTime: timestamp, deliveryStatus: 1, isDeleted: false
    };
    await this.messageRepo.addMessageToDb(msgData);
    return { MsgUid: messageUid, deliveryStatus: 1 };
  };

  updateSeenStatus = async (senderUUid: string, receiverUUid: string) => {
    const response: any = await this.messageRepo.getMessagesWithStatus(senderUUid, receiverUUid, 2);
    if (response.length > 0) {
      for (let i = 0; i < response.length; i++) {
        await notifyStatusChanged(String(senderUUid), response[i].messageUid, 3, false);
      }
      await this.messageRepo.bulkUpdateDeliveryStatus(senderUUid, receiverUUid, 2, 3);
    }
  };

  uploadMedia = async (file: any, isProduction: boolean) => {
    if (isProduction) {
      const buffer = file?.buffer;
      if (!buffer) return null;
      return uploadOnColudinaryFromRam(buffer);
    } else {
      const path = file?.path;
      if (!path) return null;
      return uploadOnColudinaryviaLocalPath(path);
    }
  };

  getAllChats = async (userid: string) => {
    const uuid = await this.userRepo.getUUidFromUserId(userid);
    return this.messageRepo.getAllChats(uuid);
  };

  deleteMessageForRole = async (userid: string, msgUid: string, role: string) => {
    const uuid = await this.userRepo.getUUidFromUserId(userid);
    if (role === "sender") {
      return this.messageRepo.deleteMessageForSender(uuid, msgUid);
    } else {
      return this.messageRepo.deleteMessageForReceiver(uuid, msgUid);
    }
  };

  unsendMessage = async (userid: string, msgUid: string, receiverUUid: string) => {
    const uuid = await this.userRepo.getUUidFromUserId(userid);
    await this.messageRepo.unsendMessage(uuid, msgUid);
    notifyUnSendMessage(receiverUUid, msgUid);
  };
}
