import fetchDb from "../utils/dbQueryHelper.js";

export default class StoryRepo {
  addStory = (userid: string, url: any, type: string) => {
    const query = `insert into story (userid,storyUrl,type) values (?,?,?)`;
    return fetchDb(query, [userid, url, type]);
  };

  removeStory = (userid: string, storyid: number) => {
    let query = `delete from story where userid=? and  id=?`;
    return fetchDb(query, [userid, storyid]);
  };

  getAllStories = (userid: string) => {
    let query = `SELECT 
    us.userid,
    us.profilepic,
    COUNT(DISTINCT st.id) AS storiesCount
FROM followers AS flr
JOIN users AS us 
       ON flr.followingid = us.userid
JOIN story AS st 
       ON st.userid = us.userid
       AND st.createdAt >= NOW() - INTERVAL 24 HOUR

WHERE 
    flr.followerid = ?
    AND flr.isApproved = TRUE
GROUP BY us.userid;
 `;
    return fetchDb(query, [userid]);
  };

  getMyStories = (userid: string) => {
    let query = `select st.* ,
  count(distinct sl.likeid)as isLiked ,
  count(distinct sv.userid)as viewCount
  from story as st left join story_likes as sl on st.id=sl.storyid and sl.userid=? 
  left join storyview as sv on st.id=sv.storyid and not (sv.userid=?) where st.userid=? and st.createdAt >=NOW()-interval 24 hour 
  group by st.id
 `;
    return fetchDb(query, [userid, userid, userid]);
  };

  getStoryOfUser = (loggedInUser: string, userid: string) => {
    let query = `select st.* ,count(distinct sl.likeid)as isLiked, 
  count(distinct sv.userid)as isViewed,
  0 as viewCount 
  from story as st left join story_likes as sl on st.id=sl.storyid and sl.userid=? 
  left join storyview as sv on st.id=sv.storyid and sv.userid=?
  where st.userid=? and st.createdAt >=NOW()-interval 24 hour group by st.id; 
 `;
    return fetchDb(query, [loggedInUser, loggedInUser, userid]);
  };

  recordStoryView = (userid: string, uuid: string, storyid: string) => {
    const query = `insert into storyview (userid,uuid,storyid) values(?,?,?)`;
    return fetchDb(query, [userid, uuid, storyid]);
  };
}
