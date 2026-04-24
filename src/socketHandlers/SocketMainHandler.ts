import logger, { formErrorBody } from "../utils/pino.js";
import { socketIo } from "../app.js"
import fetchDb from "../utils/dbQueryHelper.js";
import UserRepo from "../repo/userRepo.js";
import { addUser, getSocketId, removeUser } from "./ConnectedUsers.js";
import { addMessageToDb } from "../repo/messageRepo.js";
import message from "../types/message.type.js";
import { fcmService } from "../services/index.service.js";
const userRepo = new UserRepo();

function setSocketFunctions(socket: any, io: any) {

  socket.on("onConnect", (data: string) => {
    addUser(data, socket.id);
  });

  socket.on("CToS", async (data: any) => {

    let MsgUid = data.MsgUid;
    let type = data.type != null ? data.type : "text";

    let ReplyTOMsgUid =
      data.ReplyTOMsgUid != null && data.ReplyTOMsgUid != undefined
        ? data.ReplyTOMsgUid
        : "null";

    let profile =
      data.senderProfilePic != null && data.senderProfilePic != undefined
        ? data.senderProfilePic
        : "null";

    let timestamp = data.timestamp;

    let receiverSocketID = getSocketId(data.receiverUuid);

    if (receiverSocketID != null) {

      io.to(receiverSocketID).emit("StoC", {
        msg: data.msg,
        senderUuid: data.senderUuid,
        receiverUuid: data.receiverUuid,
        username: data.senderName,
        userid: data.senderUserId,
        profile,
        MsgUid,
        ReplyTOMsgUid,
        type,
        link: data.link,
        postId: data.postId,
        timestamp,
      });

      socket.emit("MsgStatusUpdate", {
        MsgUid,
        deliveryStatus: 1,
      });

      try {
        const msgData: message = {
          messageUid: MsgUid,
          replyToMessageId: ReplyTOMsgUid,
          senderUUId: data.senderUuid,
          recieverUUId: data.receiverUuid,
          type,
          message: data.msg,
          postid: data.postId,
          postLink: data.link,
          creationTime: timestamp,
          deliveryStatus: 1,
          isDeleted: false
        };
        await addMessageToDb(msgData);
      } catch (error) {
        logger.error(formErrorBody(error as string, null, null));
      }

    } else {

      try {
        let response: any = await userRepo.getBasicUserDetailsFromUUid(data.receiverUuid);

        if (response[0].fcmToken != null) {

          const token = response[0].fcmToken;
          const receiverUserid = response[0].userid;

          try {
            const messageToSend = {
              msg: data.msg,
              senderUuid: data.senderUuid,
              receiverUuid: data.receiverUuid,
              receiverUserId: receiverUserid,
              username: data.senderName,
              userid: data.senderUserId,
              profile,
              MsgUid,
              ReplyTOMsgUid,
              type,
              postId: String(data.postId),
              link: data.link,
              timestamp,
              deliveryStatus: "-1",
              isDeleted: "false",
              notificationText: data.notificationText ? data.notificationText : " "
            };

            await fcmService.sendMessage(token, messageToSend);

            socket.emit("MsgStatusUpdate", {
              MsgUid,
              deliveryStatus: 1,
            });

            try {
              const msgData: message = {
                messageUid: MsgUid,
                replyToMessageId: ReplyTOMsgUid,
                senderUUId: data.senderUuid,
                recieverUUId: data.receiverUuid,
                type,
                message: data.msg,
                postid: data.postId,
                postLink: data.link,
                creationTime: timestamp,
                deliveryStatus: 1,
                isDeleted: false
              };
              await addMessageToDb(msgData);
            } catch (error) {
              logger.error(formErrorBody(error as string, null, null));
            }

          } catch (error) {

            logger.error(formErrorBody(error as string, null, null));

            socket.emit("MsgStatusUpdate", {
              MsgUid,
              deliveryStatus: 1,
            });

            try {
              const msgData: message = {
                messageUid: MsgUid,
                replyToMessageId: ReplyTOMsgUid,
                senderUUId: data.senderUuid,
                recieverUUId: data.receiverUuid,
                type,
                message: data.msg,
                postid: data.postId,
                postLink: data.link,
                creationTime: timestamp,
                deliveryStatus: 1,
                isDeleted: false
              };
              await addMessageToDb(msgData);
            } catch (error) {
              logger.error(formErrorBody(error as string, null, null));
            }
          }

        } else {

          socket.emit("MsgStatusUpdate", {
            MsgUid,
            deliveryStatus: 1,
          });

          try {
            const msgData: message = {
              messageUid: MsgUid,
              replyToMessageId: ReplyTOMsgUid,
              senderUUId: data.senderUuid,
              recieverUUId: data.receiverUuid,
              type,
              message: data.msg,
              postid: data.postId,
              postLink: data.link,
              creationTime: timestamp,
              deliveryStatus: 1,
              isDeleted: false
            };
            await addMessageToDb(msgData);
          } catch (error) {
            logger.error(formErrorBody(error as string, null, null));
          }
        }

      } catch (e) {
        logger.error(formErrorBody(e as string, null, null));
      }
    }
  });

  socket.on("update_seen_msg_status", async (data: any) => {

    const senderUUid = data.senderUUid;
    const receiverUserid = data.myUserid;

    let receiverUUid = await userRepo.getUUidFromUserId(receiverUserid);

    try {
      if (receiverUUid != null) {

        const getQuery = `select * from messages where senderUUId=? and recieverUUId=? and deliveryStatus=2`;
        const UpdateQuery = `update messages set deliveryStatus=3 where senderUUId=? and recieverUUId=? and deliveryStatus=2`;

        const response: any = await fetchDb(getQuery, [senderUUid, receiverUUid]);

        if (response.length > 0) {

          for (let i = 0; i < response.length; i++) {
            await notifyStatusChanged(String(senderUUid), response[i].messageUid, 3, false);
          }

          try {
            await fetchDb(UpdateQuery, [senderUUid, receiverUUid]);
          } catch (error) {
            logger.error(formErrorBody(error as string, null, null));
          }
        }
      }
    } catch (error) {
      logger.error(formErrorBody(error as string, null, null));
    }
  });

  socket.on("notifyReceivedToSender", async (data: any) => {

    const senderUUid = data.senderUUid;
    const msgUid = data.msgUid;

    notifyStatusChanged(senderUUid, msgUid, 2, false);

    await fetchDb(
      `update messages set deliveryStatus=2 where senderUUId=? and messageUid=? and deliveryStatus=1`,
      [senderUUid, msgUid]
    ).catch((err: any) => {
      logger.error(formErrorBody(err as string, err.statusCode || 500, null));
    });

  });

  socket.on("postViewed", async (data: any) => {
    await handlePostViewed(data);
  });

  socket.on("StoryViewed", async (data: any) => {
    await handleStoryViewed(data);
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
}

async function handlePostViewed(data: any) {
  const db_query = `insert into postview (userid,uuid,postid) values(?,?,?)`;

  try {
    await fetchDb(db_query, [data.userid, data.uuid, data.postid]);
  } catch (error) {
    logger.error(formErrorBody(error as string, null, null));
  }
}

async function handleStoryViewed(data: any) {
  const db_query = `insert into storyview (userid,uuid,storyid) values(?,?,?)`;

  try {
    await fetchDb(db_query, [data.userid, data.uuid, data.storyid]);
  } catch (error) {
    logger.error(formErrorBody(error as string, null, null));
  }
}

async function notifyStatusChanged(uuid: string, messageUid: string, status: number, isDeleted: boolean) {

  let object = {
    MsgUid: messageUid,
    deliveryStatus: status,
    isDeleted: isDeleted,
  };

  let socket_id = getSocketId(uuid);

  if (socket_id != null) {
    return socketIo.to(socket_id).emit("msg_status_changed_event", object);
  }

  try {
    let response: any = await userRepo.getBasicUserDetailsFromUUid(uuid);

    let fcmToken = response[0].fcmToken;
    let userId = response[0].userid;

    if (fcmToken == null) return;

    await fcmService.notifyStatus_via_Fcm(fcmToken, messageUid, status, isDeleted, userId);

  } catch (error) {
    logger.error(formErrorBody(error as string, null, null));
  }
}

async function notifyUnSendMessage(ReceiverUuid: string, messageUid: string) {

  let object = { MsgUid: messageUid };

  let socket_id = getSocketId(ReceiverUuid);

  if (socket_id != null) {
    return socketIo.to(socket_id).emit("msg_unSend_event", object);
  }

  try {
    let fcmToken = await userRepo.getFcmTokenWithUUid(ReceiverUuid) as string;

    if (fcmToken != null) {
      await fcmService.notifyUnsendMessageViaFcm(fcmToken, messageUid, ReceiverUuid);
    }

  } catch (error) {
    logger.error(formErrorBody(error as string, null, null));
  }
}

export { setSocketFunctions, notifyStatusChanged, notifyUnSendMessage };
