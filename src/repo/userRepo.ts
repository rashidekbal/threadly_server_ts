
import user from "../types/user.js";
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

  registerNewUser=(userdata:user)=>{
     let db_query = `insert into users (userid,username,email,phone,pass,bio,dob,uuid,sessionId) values (?,?,?,?,?,?,?,?,?)`;
        let data = [
          `${userdata.userid}`, // User ID
          `${userdata.username}`, // Username
          `${userdata.email}`,
          `${userdata.phone}` ,
          `${userdata.password}`, // Hashed password
          `${userdata.bio}`,
          `${userdata.dob}`,
          `${userdata.uuid}`,
          userdata.sessionId,
        ];
        return fetchDb(db_query,data);
    
  }

  getUser=(requestedUserid:string,requesterUserId:string)=>{
    const query = `
    SELECT 
      users.userid,
      users.username,
      users.profilepic,
      users.bio,
      users.isPrivate,
      COUNT(DISTINCT imgpsts.postid) AS Posts,
      COUNT(DISTINCT following.followid) AS Following,
      COUNT(DISTINCT followersCount.followid) AS Followers,
      COUNT(DISTINCT isFollowedByUser.followerid) AS isFollowedByUser,
      coalesce(isFollowedByUser.isApproved,-1) as isApproved
      ,
      COUNT(DISTINCT isFollowingUser.followid) AS isFollowingUser
    FROM 
      users
    LEFT JOIN 
      imagepost AS imgpsts ON users.userid=imgpsts.userid
    LEFT JOIN 
      followers AS following ON following.followerid=users.userid and following.isApproved=true
    LEFT JOIN 
      followers AS followersCount ON users.userid=followersCount.followingid and followersCount.isApproved=true
    LEFT JOIN 
      followers AS isFollowedByUser ON users.userid=isFollowedByUser.followingid 
      AND isFollowedByUser.followerid=? and ( isFollowedByUser.isApproved=false or isFollowedByUser.isApproved=true)
    LEFT JOIN 
      followers AS isFollowingUser ON users.userid=isFollowingUser.followerid 
      AND isFollowingUser.followingid=? AND isFollowingUser.isApproved=true
    WHERE 
      users.userid=?
    GROUP BY 
      users.userid;
  `;
  return fetchDb(query,[requesterUserId,requesterUserId,requestedUserid])

  }
  getBasicUserDetailsByUUid=(uuid:string)=>{
    const query = `
    SELECT 
      userid,
      username,
      profilepic from users  where 
      uuid=?

  `;
return fetchDb(query,[uuid]);
  }

  getLoggedInUserData=(userid:string)=>{
      // SQL query to retrieve the user's profile data and activity stats
  let query = `
    SELECT 
      u.userid,
      u.username,
      u.bio,
      u.profilepic,
      u.createdAt,
      u.dob,
      u.isPrivate,
      COUNT(DISTINCT imp.postid) AS PostsCount, 
      COUNT(DISTINCT follows.followerid) AS followersCount,
      COUNT(DISTINCT following.followingid) AS followingCount
    FROM 
      users AS u
    LEFT JOIN 
      imagepost AS imp ON u.userid=imp.userid
    LEFT JOIN 
      followers AS follows ON u.userid=follows.followingid and follows.isApproved=1
    LEFT JOIN 
      followers AS following ON u.userid=following.followerid and following.isApproved=1
    WHERE 
      u.userid=?
    GROUP BY 
      u.userid;
  `;
  return fetchDb(query,[userid])
  }
  getUserPrivacyInfo=(userid:string)=>{
    const query = `select isPrivate from users where userid=? limit 1`;
    return fetchDb(query,[userid]);
  }
  setUserAccountPrivacyStatus=(userid:string,status:boolean)=>{
      const query=`update users set isPrivate=? where userid=?`
      return fetchDb(query,[userid,status])
  }
  
}
