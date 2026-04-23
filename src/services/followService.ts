import FollowRepo from "../repo/followRepo.js";
import logger, { formErrorBody } from "../utils/pino.js";
import { fcmService } from "./index.service.js";

export default class FollowService {
  followRepo: FollowRepo;
  constructor(followRepo: FollowRepo) {
    this.followRepo = followRepo;
  }
  approveAllPendingFollowRequest = async (userid: string) => {
    try {
      const pendingApprovals = await this.followRepo.getFollowRequests(userid);
      if (!(pendingApprovals instanceof Array)) return;
      if (pendingApprovals.length < 1) return;
      await this.followRepo.approveAllFollowRequests(userid);
      //fecth follower id and send message
      pendingApprovals.forEach((item) => {
        this.notifyFollowRequestApproved(item.followerid,userid);
      });
      // console.log("notified all followers ");
    } catch (error) {
      logger.error(formErrorBody(error as string, null, null));
    }
  };

//    notifyNewFollower = async (followerId, followingId) => {
//   const getFollowerDetailsQuery =
//     "select us.userid,us.username,us.profilepic , count(distinct fl.followerid) as isFollowed from users as us left join followers as fl on us.userid = fl.followingid and fl.followerid=? and fl.isApproved=true where userid=? limit 1";
//   const getFollowingDetailsQuery =
//     "select fcmToken ,userid from users where userid=? limit 1";
//   try {
//     let follower = await fetchDb(getFollowerDetailsQuery, [
//       followingId,
//       followerId,
//     ]);
//     let following = await fetchDb(getFollowingDetailsQuery, [followingId]);
//     if (
//       follower.length > 0 &&
//       following.length > 0 &&
//       following[0].fcmToken != null
//     ) {
//       const token = following[0].fcmToken;
//       const ReceiverUserId = following[0].userid;
//       await notify_new_Follower_via_fcm(
//         token,
//         followerId,
//         follower[0].username,
//         String(follower[0].profilepic ? follower[0].profilepic : "null"),
//         Number(follower[0].isFollowed) > 0,
//         ReceiverUserId
//       );
//     } else {
//       // console.log("no fcm token");
//     }
//   } catch (error) {
//     logger.error(formErrorBody(error,null));
//   }
// };


//  notifyFollowRequest = async (followerId, followingId) => {
//   const getFollowerDetailsQuery =
//     `select us.userid,
//     us.username,
//     us.profilepic,
//     count(distinct fl.followerid) as isFollowed 
//     from users as us left join followers as fl 
//     on us.userid = fl.followingid 
//     and fl.followerid=? 
//     and fl.isApproved=true 
//     where userid=? limit 1`;
//   const getFollowingDetailsQuery =
//     "select fcmToken ,userid from users where userid=? limit 1";
//   try {
//     let follower = await fetchDb(getFollowerDetailsQuery, [
//       followingId,
//       followerId,
//     ]);
//     let following = await fetchDb(getFollowingDetailsQuery, [followingId]);
//     if (
//       follower.length > 0 &&
//       following.length > 0 &&
//       following[0].fcmToken != null
//     ) {
//       const token = following[0].fcmToken;
//       const ReceiverUserId = following[0].userid;
//       await notify_new_Follower_request_fcm(
//         token,
//         followerId,
//         follower[0].username,
//         String(follower[0].profilepic ? follower[0].profilepic : "null"),
//         Number(follower[0].isFollowed) > 0,
//         ReceiverUserId
//       );
//     } else {
//       // console.log("no fcm token");
//     }
//   } catch (error) {
//     logger.error(formErrorBody(error,null));
//   }
// };

//  notifyFollowRequestCancelled = async (followerId, followingId) => {
//   // console.log("notifying to delete request");
//   const getFollowingDetailsQuery =
//     "select fcmToken ,userid from users where userid=? limit 1";
//   try {
//     let following = await fetchDb(getFollowingDetailsQuery, [followingId]);
//     if (following.length > 0 && following[0].fcmToken != null) {
//       const token = following[0].fcmToken;
//       await notify_followRequestCancel_via_fcm(
//         token,
//         followerId,
//         following[0].userid
//       );
//     } else {
//       // console.log("no fcm token");
//     }
//   } catch (error) {
//    logger.error(formErrorBody(error,null));
//   }
// };
 notifyFollowRequestApproved = async (followerId:string, followingId:string) => {
 
  try {
    let follower:any = await this.followRepo.getFollowerDetails(followerId);
    let following:any = await this.followRepo.getFollowingDetails(
      followerId,
      followingId
    );
    if (
      following.length > 0 &&
      follower.length > 0 &&
      follower[0].fcmToken != null
    ) {
      const token = follower[0].fcmToken;
      const ReceiverUserId = follower[0].userid;
      const isfollowed:boolean=Number(following[0].isFollowed) > 0
      const profilePic:string= String(following[0].profilepic ? following[0].profilepic : "null")
      await fcmService.notify_Follow_request_accepted_fcm({ token,
        userid:followingId,
        username:following[0].username,
        profile:profilePic,
        isFollowed:String(isfollowed),
        ReceiverUserId});
    } 
  } catch (error) {
   logger.error(formErrorBody(error as string,null,null));
  }
};

// const notifyUnFollow = async (followerId, followingId) => {
//   const getFollowingDetailsQuery =
//     "select fcmToken ,userid from users where userid=? limit 1";
//   try {
//     let following = await fetchDb(getFollowingDetailsQuery, [followingId]);
//     if (following.length > 0 && following[0].fcmToken != null) {
//       const token = following[0].fcmToken;
//       await notify_UnFollow_via_fcm(token, followerId, following[0].userid);
//     } else {
//       // console.log("no fcm token");
//     }
//   } catch (error) {
//    logger.error(formErrorBody(error,null));
//   }
// };
}
