import fetchDb from "../utils/dbQueryHelper.js";
import logger, { formErrorBody } from "../utils/pino.js";

const getUUidFromUserId = (userid:string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await fetchDb(`select uuid from users where userid =?`, [
        userid,
      ]);
      if(!(response  instanceof Array))return reject(null)
      if (response.length > 0 && response[0].uuid != null) {
        const uuid = response[0].uuid;
        resolve(uuid);
      } else {
        reject(null);
      }
    } catch (error) {
          logger.error(formErrorBody(error as string,null,null));

      reject(null);
    }
  });
};



const getFcmTokenWithUUid = (uuid:string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await fetchDb(`select fcmToken from users where uuid =?`, [
        uuid,
      ]);
      if(!(response  instanceof Array))return reject(null)
      if (response.length > 0 && response[0].fcmToken != null) {
        const fcmToken = response[0].fcmToken;
        resolve(fcmToken);
      } else {
        reject(null);
      }
    } catch (error) {
           logger.error(formErrorBody(error as string,null,null));

      reject(null);
    }
  });
};
async function getBasicUserDetailsFromUUid(uuid:string){
 return  new Promise(async (resolve,reject)=>{
    const query=`select userid,username,profilepic,fcmToken from users where uuid=?`;
    try{
      let response=await fetchDb(query,[uuid]);
      if(!(response  instanceof Array))return reject(null)
      if(response.length<1){
        reject(null);
      }
      resolve(response);

    }catch (e){
     logger.error(formErrorBody(e as string , null,null));

      reject(e);
    }

  })
}

export {getUUidFromUserId,getFcmTokenWithUUid,getBasicUserDetailsFromUUid}