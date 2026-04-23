import fetchDb from "../utils/dbQueryHelper.js";
import logger, { formErrorBody } from "../utils/pino.js";
export default class UserRepo {
  getUUidFromUserId = (userid: string) => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await fetchDb(`select uuid from users where userid =?`, [
          userid,
        ]);
        if (!(response instanceof Array)) return reject(null);
        if (response.length > 0 && response[0].uuid != null) {
          const uuid = response[0].uuid;
          resolve(uuid);
        } else {
          reject(null);
        }
      } catch (error) {
        logger.error(formErrorBody(error as string, null, null));

        reject(null);
      }
    });
  };

  getFcmTokenWithUUid = (uuid: string) => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await fetchDb(
          `select fcmToken from users where uuid =?`,
          [uuid],
        );
        if (!(response instanceof Array)) return reject(null);
        if (response.length > 0 && response[0].fcmToken != null) {
          const fcmToken = response[0].fcmToken;
          resolve(fcmToken);
        } else {
          reject(null);
        }
      } catch (error) {
        logger.error(formErrorBody(error as string, null, null));

        reject(null);
      }
    });
  };
  getBasicUserDetailsFromUUid = (uuid: string) => {
    return new Promise(async (resolve, reject) => {
      const query = `select userid,username,profilepic,fcmToken from users where uuid=?`;
      try {
        let response = await fetchDb(query, [uuid]);
        if (!(response instanceof Array)) return reject(null);
        if (response.length < 1) {
          reject(null);
        }
        resolve(response);
      } catch (e) {
        logger.error(formErrorBody(e as string, null, null));

        reject(e);
      }
    });
  };
  getSuggestedUsers = (userid: string, page: number = 1) => {
    const Query = `
    SELECT 
      u.userid, 
      u.username, 
      u.profilepic, 
      u.isPrivate,
      COUNT(fl.followid) AS isfollowedBy 
    FROM 
      users AS u 
    LEFT JOIN 
      followers AS fl 
      ON u.userid = fl.followingid 
    WHERE 
      u.userid != ? -- Exclude the requesting user
      AND u.userid NOT IN (
        SELECT followingid 
        FROM followers 
        WHERE followerid = ?  -- Exclude users already followed by the requesting user
      ) 
    GROUP BY 
      u.userid;
  `;
    return fetchDb(Query, [userid, userid]);
  };

  fetchUserforAuth(column: string, value: string) {
    let query = `select * from users where ${column} = ?`;
    return fetchDb(query, [value]);
  }


  createSession=(sessionId:string,userid:string)=>{
    return  fetchDb(
          `update users set sessionId=? , fcmToken=null where userid=?`,
          [sessionId,userid],
        );
  }
  logoutUser=(userid:string)=>{
    const query = `update users set fcmToken=null , sessionId=null where userid=?`;
    return fetchDb(query,[userid])
  }
}
