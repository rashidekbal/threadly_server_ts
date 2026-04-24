import FollowRepo from "../repo/followRepo.js";
import logger, { formErrorBody } from "../utils/pino.js";
import { fcmService, privacyService } from "./index.service.js";

export default class FollowService {
  followRepo: FollowRepo;
  constructor(followRepo: FollowRepo) {
    this.followRepo = followRepo;
  }

  registerNewFollow = async (followerId: string, followingId: string) => {
    try {
      const isPrivateAccount = await privacyService.isUserPrivate(followingId);
      if (isPrivateAccount) {
        await this.followRepo.addnewFollow(followerId, followingId, false);
          this.notifyFollowRequest(followerId, followingId);
        return { status: "pending" };
      }
      await this.followRepo.addnewFollow(followerId, followingId, true);
      this.notifyNewFollower(followerId, followingId);
      return { status: "approved" };
    } catch (error) {
      throw error;
    }
  };
  getFollowers=async(requestingUser:string,requestedUser:string,page:number=1)=>{
    return this.followRepo.getFollowers(requestingUser,requestedUser,page);

  }
  getFollowings=async(requestingUser:string,requestedUser:string,page:number=1)=>{
    return this.followRepo.getFollowings(requestingUser,requestedUser,page);

  }
  getPendingFollowRequestWithUserDetails=(userid:string,page:number=1)=>{
    return this.followRepo.getPendingFollowRequestWithUserDetails(userid,page);

  }
  approveAllPendingFollowRequest = async (userid: string) => {
    try {
      const pendingApprovals = await this.followRepo.getFollowRequests(userid);
      if (!(pendingApprovals instanceof Array)) return;
      if (pendingApprovals.length < 1) return;
      await this.followRepo.approveAllFollowRequests(userid);
      //fecth follower id and send message
      pendingApprovals.forEach((item) => {
        this.notifyFollowRequestApproved(item.followerid, userid);
      });
    } catch (error) {
      logger.error(formErrorBody(error as string, null, null));
    }
  };

  notifyNewFollower = async (followerId: string, followingId: string) => {
    try {
      //don't get confused with name there is a legecy naming problem
      let follower: any = await this.followRepo.getFollowingDetails(
        followingId,
        followerId,
      );
      //don't get confused with name there is a legecy naming problem
      let following: any =
        await this.followRepo.getFollowerDetails(followingId);
      if (
        follower.length > 0 &&
        following.length > 0 &&
        following[0].fcmToken != null
      ) {
        const token = following[0].fcmToken;
        const ReceiverUserId = following[0].userid;
        const profilePic = String(
          follower[0].profilepic ? follower[0].profilepic : "null",
        );
        const isfollowed: boolean = Number(follower[0].isFollowed) > 0;
        await fcmService.notify_new_Follower_via_fcm({
          token,
          userid: followerId,
          username: follower[0].username,
          profile: profilePic,
          isFollowed: String(isfollowed),
          ReceiverUserId,
        });
      }
    } catch (error) {
      logger.error(formErrorBody(error as string, null, null));
    }
  };

  isRequestApproved = (followerid: string, followingid: string) => {
    return this.followRepo.checkFollowRequestStatus(followerid, followingid);
  };

  notifyFollowRequest = async (followerId: string, followingId: string) => {
    const getFollowerDetailsQuery = `select us.userid,
    us.username,
    us.profilepic,
    count(distinct fl.followerid) as isFollowed 
    from users as us left join followers as fl 
    on us.userid = fl.followingid 
    and fl.followerid=? 
    and fl.isApproved=true 
    where userid=? limit 1`;
    const getFollowingDetailsQuery =
      "select fcmToken ,userid from users where userid=? limit 1";
    try {
      let follower:any = await this.followRepo.getFollowingDetails(followingId,
        followerId,);
      let following:any = await this.followRepo.getFollowerDetails(followingId);
      if (
        follower.length > 0 &&
        following.length > 0 &&
        following[0].fcmToken != null
      ) {
        const token = following[0].fcmToken;
        const ReceiverUserId = following[0].userid;
        const profilePic = String(
          follower[0].profilepic ? follower[0].profilepic : "null",
        );
        const isfollowed: boolean = Number(follower[0].isFollowed) > 0;
        await fcmService.notify_new_Follower_request_fcm(
          {token,
          userid:followerId,
          username:follower[0].username,
         profile:profilePic,
         isFollowed:String(isfollowed),
          ReceiverUserId,}
        );
      } else {
        
      }
    } catch (error) {
      logger.error(formErrorBody(error as string, null,null));
    }
  };

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
  notifyFollowRequestApproved = async (
    followerId: string,
    followingId: string,
  ) => {
    try {
      let follower: any = await this.followRepo.getFollowerDetails(followerId);
      let following: any = await this.followRepo.getFollowingDetails(
        followerId,
        followingId,
      );
      if (
        following.length > 0 &&
        follower.length > 0 &&
        follower[0].fcmToken != null
      ) {
        const token = follower[0].fcmToken;
        const ReceiverUserId = follower[0].userid;
        const isfollowed: boolean = Number(following[0].isFollowed) > 0;
        const profilePic: string = String(
          following[0].profilepic ? following[0].profilepic : "null",
        );
        await fcmService.notify_Follow_request_accepted_fcm({
          token,
          userid: followingId,
          username: following[0].username,
          profile: profilePic,
          isFollowed: String(isfollowed),
          ReceiverUserId,
        });
      }
    } catch (error) {
      logger.error(formErrorBody(error as string, null, null));
    }
  };

  follow = async (followerId: string, followingId: string) => {
    await this.followRepo.addFollow(followerId, followingId, true);
    this.notifyNewFollower(followerId, followingId);
  };

  unfollow = async (followerId: string, followingId: string) => {
    await this.followRepo.unfollow(followerId, followingId);
    this.notifyUnFollow(followerId, followingId);
  };

  cancelFollowRequest = async (followerId: string, followingId: string) => {
    await this.followRepo.cancelFollowRequest(followerId, followingId);
    this.notifyFollowRequestCancelled(followerId, followingId);
  };

  approveFollowRequest = async (followerId: string, followingId: string) => {
    await this.followRepo.approveAllFollowRequests(followingId);
    // Use the specific query pattern from original: update where followerid=? and followingid=? and isApproved=false
    this.notifyFollowRequestApproved(followerId, followingId);
  };

  rejectFollowRequest = async (followerId: string, followingId: string) => {
    await this.followRepo.rejectFollowRequest(followerId, followingId);
  };

  notifyFollowRequestCancelled = async (followerId: string, followingId: string) => {
    try {
      let following: any = await this.followRepo.getFollowerDetails(followingId);
      if (following.length > 0 && following[0].fcmToken != null) {
        const token = following[0].fcmToken;
        await fcmService.notify_followRequestCancel_via_fcm(token, followerId, following[0].userid);
      }
    } catch (error) {
      logger.error(formErrorBody(error as string, null, null));
    }
  };

  notifyUnFollow = async (followerId: string, followingId: string) => {
    try {
      let following: any = await this.followRepo.getFollowerDetails(followingId);
      if (following.length > 0 && following[0].fcmToken != null) {
        const token = following[0].fcmToken;
        await fcmService.notify_UnFollow_via_fcm(token, followerId, following[0].userid);
      }
    } catch (error) {
      logger.error(formErrorBody(error as string, null, null));
    }
  };
}

