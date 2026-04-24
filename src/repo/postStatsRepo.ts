import fetchDb from "../utils/dbQueryHelper.js";

export default class PostStatsRepo {
  getLikedByUsers = (postid: string, offset: number) => {
    const query = `
select usr.userid,
 usr.username,
usr.profilepic,
usr.uuid
from users as usr left join post_likes as pl on usr.userid=pl.userid 
where pl.postid=? and usr.blocked=false group by  usr.userid
limit 100 offset ?`;
    return fetchDb(query, [postid, offset]);
  };

  getStoryViewedByUsers = (userid: string, storyid: string, offset: number) => {
    const query = `
select usr.userid,
 usr.username,
usr.profilepic,
usr.uuid,
count(distinct sl.likeid)as isLiked
from users as usr left join storyview as sv on usr.userid=sv.userid and not(sv.userid=?)
left join story as ps on ps.id=sv.storyid
left join story_likes as sl on ps.id=sl.storyid and usr.userid=sl.userid
where ps.userid=? and sv.storyid=? and usr.blocked=false group by  usr.userid
limit 100 offset ?`;
    return fetchDb(query, [userid, userid, storyid, offset]);
  };

  getSharedByUsers = (postid: string, offset: number) => {
    const query = `
select usr.userid,
 usr.username,
usr.profilepic,
usr.uuid
from users as usr left join post_shares as ps on usr.userid=ps.sharerid 
where ps.postid=? and usr.blocked=false group by usr.userid
limit 100 offset ?`;
    return fetchDb(query, [postid, offset]);
  };
}
