import Response from "../constants/Response.js";
import message from "../types/message.type.js";
import fetchDb from "../utils/dbQueryHelper.js";
import logger, { formErrorBody } from "../utils/pino.js";

const addMessageToDb = (
 data:message
) => {
  // is deleted field is not set when me=sg is created due to some desing problem the is deleted filed is passed from
  // every calling place
  return new Promise(async (resolve, reject) => {
    const query = `insert into messages (messageUid,replyToMessageId,senderUUId,recieverUUId,type,message,postid,postLink,creationTime,deliveryStatus) values (?,?,?,?,?,?,?,?,?,?)`;
    try {
      await fetchDb(query, [
        data.messageUid,
        data.replyToMessageId,
        data.senderUUId,
        data.recieverUUId,
        data.type,
        data.message,
        data.postid,
        data.postLink,
        data.creationTime,
        data.deliveryStatus,
      ]);
      resolve(new Response(201, { msg: "success" }));
    } catch (error) {
          logger.error(formErrorBody(error as string,null,null));
      reject(error);
    }
  });
};

export default class MessageRepo {
  addMessageToDb = addMessageToDb;

  getPendingHistory = (uuid: any) => {
    const query = `SELECT count(distinct msg.messageId)as messagesPending,msg.senderUUId as senderUUid,usr.userid,usr.username,usr.profilepic FROM messages as msg left join users as usr on usr.uuid =msg.senderUUid WHERE msg.recieverUUId=? and 
    msg.deliveryStatus=1 group by msg.senderUUId`;
    return fetchDb(query, [uuid]);
  };

  getPendingMessages = (senderUuid: string, receiverUuid: any) => {
    const query = `select * from messages where senderUUId=? and recieverUUId=? and deliveryStatus=1 order by creationTime asc`;
    return fetchDb(query, [senderUuid, receiverUuid]);
  };

  updateDeliveryStatus = (senderUuid: string, receiverUuid: any, messageUid: string) => {
    return fetchDb(
      "update messages set deliveryStatus=2 where senderUUID=? and recieverUUID=? and messageUid=? and deliveryStatus=1 ",
      [senderUuid, receiverUuid, messageUid],
    );
  };

  getFcmTokenByUuid = (uuid: string) => {
    const query = `select fcmToken from users where uuid=?`;
    return fetchDb(query, [uuid]);
  };

  getMessagesWithStatus = (senderUUid: string, receiverUUid: string, status: number) => {
    const query = `select * from messages where senderUUId=? and recieverUUId=? and deliveryStatus=?`;
    return fetchDb(query, [senderUUid, receiverUUid, status]);
  };

  bulkUpdateDeliveryStatus = (senderUUid: string, receiverUUid: string, fromStatus: number, toStatus: number) => {
    const query = `update messages set deliveryStatus=? where senderUUId=? and recieverUUId=? and deliveryStatus=?`;
    return fetchDb(query, [toStatus, senderUUid, receiverUUid, fromStatus]);
  };

  getAllChats = (uuid: any) => {
    const query = `select * from messages where (senderUUid=? or recieverUUid=?) and isDeletedBoth=false and not deliveryStatus='null' order by creationTime asc`;
    return fetchDb(query, [uuid, uuid]);
  };

  deleteMessageForSender = (uuid: any, msgUid: string) => {
    const query = `update messages set isDeletedBySender=true where senderUUId=? and messageUid=?`;
    return fetchDb(query, [uuid, msgUid]);
  };

  deleteMessageForReceiver = (uuid: any, msgUid: string) => {
    const query = `update messages set isDeletedByReceiver=true where recieverUUId=? and messageUid=?`;
    return fetchDb(query, [uuid, msgUid]);
  };

  unsendMessage = (uuid: any, msgUid: string) => {
    const query = `update messages set isDeletedBoth=true where senderUUId=? and messageUid=?`;
    return fetchDb(query, [uuid, msgUid]);
  };
}

export { addMessageToDb };