import fetchDb from "../utils/dbQueryHelper.js";

export default class FollowRepo{
    getFollowRequests=(userid:string)=>{
         const getPendingApprovals=`select * from followers where followingid=? and isApproved=false`;
         return fetchDb(getPendingApprovals,[userid]);
    }
    approveAllFollowRequests=(userid:string)=>{
            const queryApprove=`update followers set isApproved=true where followingid=? and isApproved=false`;
            return fetchDb(queryApprove,[userid])
    }

      getFollowingDetails =(followerid:string,followingid:string)=>{
        const query="select us.userid,us.username,us.profilepic , count(distinct fl.followerid) as isFollowed from users as us left join followers as fl on us.userid = fl.followingid and fl.followerid=? and fl.isApproved=true where userid=? limit 1";
        return fetchDb(query,[followerid,followingid])
      }
    
      getFollowerDetails =(userid:string)=>{
        const query="select fcmToken ,userid from users where userid=? limit 1";
        return fetchDb(query,[userid]);
      }
    
}