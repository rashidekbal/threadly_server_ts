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