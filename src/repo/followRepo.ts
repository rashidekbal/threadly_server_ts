import fetchDb from "../utils/dbQueryHelper.js";

export default class FollowRepo {
  getFollowRequests = (userid: string) => {
    
    const getPendingApprovals = `select * from followers where followingid=? and isApproved=false`;
    return fetchDb(getPendingApprovals, [userid]);
  };
  approveAllFollowRequests = (userid: string) => {
    const queryApprove = `update followers set isApproved=true where followingid=? and isApproved=false`;
    return fetchDb(queryApprove, [userid]);
  };

  getFollowingDetails = (followerid: string, followingid: string) => {
    const query =
      "select us.userid,us.username,us.profilepic , count(distinct fl.followerid) as isFollowed from users as us left join followers as fl on us.userid = fl.followingid and fl.followerid=? and fl.isApproved=true where userid=? limit 1";
    return fetchDb(query, [followerid, followingid]);
  };

  getFollowerDetails = (userid: string) => {
    const query = "select fcmToken ,userid from users where userid=? limit 1";
    return fetchDb(query, [userid]);
  };

  addnewFollow = (followerId:string,followingId:string,isApproved:boolean) => {
    let query ="insert into followers (followerid,followingid,isApproved) values (?,?,?)";
    return fetchDb(query,[followerId,followingId,isApproved]);
  };

  checkFollowRequestStatus=(followerid:string,followigid:string)=>{
     const query=`select isApproved from followers where followerid=? and followingid=?`;
     return fetchDb(query,[followerid,followigid]);

  }
  getFollowers=(requestingUser:string,requestedUser:string,page:number)=>{
    let query = `select users.uuid,
        users.userid,
        users.isPrivate,
        users.username,
        users.profilepic,
        count(distinct chkIsFllowed.followerid) AS ifFollowed,
        coalesce(chkIsFllowed.isApproved,-1) as isApproved
        from followers left join users on followers.followerid = users.userid 
        left join followers as chkIsFllowed on users.userid=chkIsFllowed.followingid and chkIsFllowed.followerid=?  
        where followers.followingid=? and   followers.isApproved=true group by users.userid
    `;
    return fetchDb(query,[requestingUser,requestedUser]);
  }
  getFollowings=(requistingUser:string,requestedUser:string,page:number)=>{
    let query = `select users.uuid ,
  users.userid ,
  users.isPrivate,
   users.username,
   users.profilepic,
   CASE WHEN chkIsFllowed.followid IS NOT NULL THEN 1 ELSE 0 END AS ifFollowed,
   coalesce(chkIsFllowed.isApproved,-1) as isApproved  from followers 
   left join users on followers.followingid = users.userid
    left join followers as chkIsFllowed on users.userid=chkIsFllowed.followingid and chkIsFllowed.followerid=? 
     where followers.followerid=? and followers.isApproved=true group by users.userid`;
     return fetchDb(query,[requistingUser,requestedUser])
  }
  getPendingFollowRequestWithUserDetails=(userid:string,page:number)=>{
    const query="select us.userid,us.username,us.profilepic from followers as flws left join users as us on flws.followerid=us.userid where flws.followingid=? and isApproved=false"
    return fetchDb(query,[userid]);
  }
}
