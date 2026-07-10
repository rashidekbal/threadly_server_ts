import bcryptUtil from "../utils/bcryptUtil.js";
import fetchDb from "../utils/dbQueryHelper.js";

const getCommentsOfPost = (page: number, postid: number) => {
  const db_query = `select pc.commentid ,
pc.postid ,
pc.userid ,
usr.username ,
usr.profilepic as profile ,
pc.comment_text as comment ,
count(distinct cl.comment_like_id)as likesCount ,
count(distinct rply.commentid) as replyCount,
pc.createdAt,
pc.replyToCommentId
from post_comments as pc left join users as usr on pc.userid=usr.userid
left join comment_likes as cl on pc.commentid=cl.commentid left join post_comments as rply on pc.commentid=rply.replyToCommentId
where pc.postid=? group by pc.commentid order by pc.commentid desc
`;
  return fetchDb(db_query, [postid]);
};

const getUserPost = (userid: string, page: number) => {
  const db_query = `
select imgpst.*,
usr.profilepic as profile,
 count(distinct pl.userid) as likesCount,
count(distinct pc.commentid)as commentsCount,
count(distinct pv.viewId) as viewsCount
from imagepost as imgpst left join post_likes as pl on imgpst.postid=pl.postid 
left join post_comments as pc on imgpst.postid=pc.postid  left join users as usr on imgpst.userid=usr.userid
left join postview as pv on imgpst.postid=pv.postid
where imgpst.userid=? group by imgpst.postid order by imgpst.postid desc LIMIT 15 OFFSET ?
`;
  const offset = (page - 1) * 15;
  return fetchDb(db_query, [userid, offset]);
};
const getUsers = (page: number, isDeleted: boolean = false, search: string = "", sort: string = "") => {
  const isDeletedVal = isDeleted ? 1 : 0;
  let searchCondition = "";
  let params: any[] = [];
  
  if (search) {
    searchCondition = "AND (usr.userid LIKE ? OR usr.username LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  let orderByClause = "ORDER BY usr.userid DESC";
  switch (sort) {
    case "most_followers": orderByClause = "ORDER BY followers DESC"; break;
    case "most_posts": orderByClause = "ORDER BY posts DESC"; break;
    case "most_comments": orderByClause = "ORDER BY comments DESC"; break;
    case "most_active": orderByClause = "ORDER BY posts DESC, followers DESC"; break;
    case "recently_joined": orderByClause = "ORDER BY joinDate DESC"; break;
    case "lastly_joined": orderByClause = "ORDER BY joinDate ASC"; break;
    case "alpha_username": orderByClause = "ORDER BY usr.username ASC"; break;
    case "alpha_userid": orderByClause = "ORDER BY usr.userid ASC"; break;
  }
  
  const offset = (page - 1) * 20;
  params.push(offset);

  const db_query = `select usr.userid,usr.username,
      usr.email,
       usr.profilepic as profile,
        usr.phone, usr.bio, usr.dob,
         usr.uuid, usr.fcmToken, 
         usr.createdAt as joinDate,
         case 
         when usr.blocked=1 then 'banned'
         else 'active'
         end as status,
    case 
      when isPrivate = 1 then 'private'
     else 'public'
   end as privacy,count(distinct flwr.followerid)as followers , count(distinct flwng.followingid)as following,
   count(distinct imgpst.postid) as posts ,
   count(distinct pcom.commentid) as comments,
   usr.sessionId
   from users as usr left join followers as flwr on usr.userid=flwr.followingid left join followers as flwng on usr.userid=flwng.followerid
   left join imagepost as imgpst on usr.userid=imgpst.userid 
   left join post_comments as pcom on usr.userid=pcom.userid
   WHERE usr.isDeleted = ${isDeletedVal} ${searchCondition} group by usr.userid ${orderByClause} LIMIT 20 OFFSET ?`;
  return fetchDb(db_query, params);
};
const getUserInfo = (userid: string) => {
  const db_query = `select usr.userid,usr.username,
      usr.email,
       usr.profilepic as profile,
        usr.phone, usr.bio, usr.dob,
         usr.uuid, usr.fcmToken, 
         usr.createdAt as joinDate,
         case 
         when usr.blocked=1 then 'banned'
         else 'active'
         end as status,
    case 
      when isPrivate = 1 then 'private'
     else 'public'
   end as privacy,count(distinct flwr.followerid)as followers , count(distinct flwng.followingid)as following,
   count(distinct imgpst.postid) as posts ,
   usr.sessionId
   from users as usr left join followers as flwr on usr.userid=flwr.followingid left join followers as flwng on usr.userid=flwng.followerid
   left join imagepost as imgpst on usr.userid=imgpst.userid where usr.userid=?`;
  return fetchDb(db_query, [userid]);
};

const getUserFollowers = async (userid: string, page: number = 1) => {
  const db_query = `select us.userid, us.username, us.profilepic as profile, fl.createdAt as joinDate
    from followers as fl
    inner join users as us on fl.followerid = us.userid
    where fl.followingid = ?
    order by fl.createdAt desc limit 20 offset ?`;
  const offset = (page - 1) * 20;
  return fetchDb(db_query, [userid, offset]);
};

const getUserFollowings = async (userid: string, page: number = 1) => {
  const db_query = `select us.userid, us.username, us.profilepic as profile, fl.createdAt as joinDate
    from followers as fl
    inner join users as us on fl.followingid = us.userid
    where fl.followerid = ?
    order by fl.createdAt desc limit 20 offset ?`;
  const offset = (page - 1) * 20;
  return fetchDb(db_query, [userid, offset]);
};
const overridePassword = async (uuid: string, password: string) => {
  const query = `update users set pass=? where uuid=?`;
  let encrypterPassword = await bcryptUtil.hashPassword(password);
  return fetchDb(query, [encrypterPassword, uuid]);
};
const userinfoEdit = (data: {
  userid: string;
  username: string;
  email: string | null;
  uuid: string;
}) => {
  const db_query = `update users set userid=? , username=? , email=? where uuid=?`;
  return fetchDb(db_query, [data.userid, data.username, data.email, data.uuid]);
};
const editUserProfile = (profileUrl: string | null, uuid: string) => {
  const db_query = `update users set profilepic=? where uuid=?`;
  return fetchDb(db_query, [profileUrl, uuid]);
};
const restrictUser = (data:{
    banDuration:"24hr"|"permanent",
    banned_at:string,
    banReason:string,
    uuid:string
}) => {
  const db_query = `update users set blocked=1, banDuration=?,banned_at=? ,sessionId=null , fcmToken=null , banReason=? where uuid=?`;
  return fetchDb(db_query, [data.banDuration,data.banned_at,data.banReason,data.uuid]);
};
const unRestrictUser = (uuid:string) => {
   const db_query = `update users set blocked=0 , banDuration='none',banned_at=null ,banReason=null where uuid=?`;
  return fetchDb(db_query, [uuid]);
};
const getUserStory = async (userid: string, page: number = 1) => {
  const db_query = `select st.* ,
 usr.username,
 usr.profilepic as profile,
 count(distinct sl.userid) as likesCount 
 from story as st left join story_likes as sl on st.id=sl.storyid 
 left join users as usr on st.userid = usr.userid
 where st.userid=? 
 group by st.id order by st.id desc LIMIT 15 OFFSET ?
`;
  const offset = (page - 1) * 15;
  return fetchDb(db_query, [userid, offset]);
}
const getAllPosts = (sort: string = "", page: number = 1) => {
  let orderByClause = "ORDER BY imgpst.postid DESC";
  if (sort === "most_likes") orderByClause = "ORDER BY likesCount DESC";
  if (sort === "most_comments") orderByClause = "ORDER BY commentsCount DESC";
  if (sort === "most_views") orderByClause = "ORDER BY viewsCount DESC";

  const db_query = `
    select imgpst.postid, imgpst.userid, imgpst.imageurl, imgpst.caption,
    imgpst.type, imgpst.created_at,
    usr.username, usr.profilepic as profile,
    count(distinct pl.userid) as likesCount,
    count(distinct pc.commentid) as commentsCount,
    count(distinct pv.viewId) as viewsCount
    from imagepost as imgpst
    left join users as usr on imgpst.userid = usr.userid
    left join post_likes as pl on imgpst.postid = pl.postid
    left join post_comments as pc on imgpst.postid = pc.postid
    left join postview as pv on imgpst.postid = pv.postid
    group by imgpst.postid ${orderByClause} LIMIT 15 OFFSET ?
  `;
  const offset = (page - 1) * 15;
  return fetchDb(db_query, [offset]);
};
const getSinglePost = (postid: number) => {
  const db_query = `
    select imgpst.postid, imgpst.userid, imgpst.imageurl, imgpst.caption,
    imgpst.type, imgpst.created_at,
    usr.username, usr.profilepic as profile,
    count(distinct pl.userid) as likesCount,
    count(distinct pc.commentid) as commentsCount,
    count(distinct pv.viewId) as viewsCount
    from imagepost as imgpst
    left join users as usr on imgpst.userid = usr.userid
    left join post_likes as pl on imgpst.postid = pl.postid
    left join post_comments as pc on imgpst.postid = pc.postid
    left join postview as pv on imgpst.postid = pv.postid
    where imgpst.postid = ?
    group by imgpst.postid
  `;
  return fetchDb(db_query, [postid]);
};

const deletePost = (postid: number) => {
  return fetchDb(`delete from imagepost where postid=?`, [postid]);
};
const deleteComment = (commentid: number) => {
  return fetchDb(`delete from post_comments where commentid=?`, [commentid]);
};
const getReports = (status: string, page: number = 1) => {
  const offset = (page - 1) * 15;
  const db_query = `
    select pr.reportid, pr.postid, pr.reason, pr.status, pr.createdAt,
    imgpst.imageurl, imgpst.caption, imgpst.type,
    reporter.username as reporterUsername,
    owner.username as postOwnerUsername, owner.userid as postOwnerUserid, owner.uuid as postOwnerUuid
    from post_reports as pr
    left join imagepost as imgpst on pr.postid = imgpst.postid
    left join users as reporter on pr.reporterUserid = reporter.userid
    left join users as owner on imgpst.userid = owner.userid
    where pr.status=? order by pr.createdAt desc LIMIT 15 OFFSET ?
  `;
  return fetchDb(db_query, [status, offset]);
};
const updateReportStatus = (reportid: number, status: string) => {
  return fetchDb(`update post_reports set status=? where reportid=?`, [status, reportid]);
};
const reportPost = (userid: string, postid: number, reason: string) => {
  return fetchDb(`insert into post_reports (reporterUserid, postid, reason) values (?,?,?)`, [userid, postid, reason]);
};
const getUserActivityLog = (userid: string, page: number = 1) => {
  const offset = (page - 1) * 20;
  const db_query = `
    (select 'post' as type, imgpst.created_at as time, imgpst.caption as detail, imgpst.imageurl as media, imgpst.postid as relatedId
     from imagepost as imgpst where imgpst.userid=? order by imgpst.created_at desc limit 50)
    union all
    (select 'comment' as type, pc.createdAt as time, pc.comment_text as detail, null as media, pc.postid as relatedId
     from post_comments as pc where pc.userid=? order by pc.createdAt desc limit 50)
    union all
    (select 'like' as type, pl.createdAt as time, concat('liked post #', pl.postid) as detail, null as media, pl.postid as relatedId
     from post_likes as pl where pl.userid=? order by pl.createdAt desc limit 50)
    union all
    (select 'story' as type, st.createdAt as time, null as detail, st.storyUrl as media, null as relatedId
     from story as st where st.userid=? order by st.createdAt desc limit 50)
    order by time desc limit 20 offset ?
  `;
  return fetchDb(db_query, [userid, userid, userid, userid, offset]);
};
const getPlatformActivity = (page: number = 1) => {
  const offset = (page - 1) * 20;
  const db_query = `
    (select 'post' as type, imgpst.created_at as time, imgpst.caption as detail, imgpst.imageurl as media, imgpst.userid, imgpst.postid as relatedId
     from imagepost as imgpst order by imgpst.created_at desc limit 50)
    union all
    (select 'comment' as type, pc.createdAt as time, pc.comment_text as detail, null as media, pc.userid, pc.postid as relatedId
     from post_comments as pc order by pc.createdAt desc limit 50)
    union all
    (select 'like' as type, pl.createdAt as time, concat('liked post #', pl.postid) as detail, null as media, pl.userid, pl.postid as relatedId
     from post_likes as pl order by pl.createdAt desc limit 50)
    union all
    (select 'story' as type, st.createdAt as time, null as detail, st.storyUrl as media, st.userid, null as relatedId
     from story as st order by st.createdAt desc limit 50)
    order by time desc limit 20 offset ?
  `;
  return fetchDb(db_query, [offset]);
};

const softDeleteUser = async (userid: string) => {
  const deleteUserQuery = `UPDATE users SET isDeleted = true WHERE userid = ?`;
  const deletePostsQuery = `UPDATE imagepost SET isDeleted = true WHERE userid = ?`;
  const deleteCommentsQuery = `UPDATE post_comments SET isDeleted = true WHERE userid = ?`;
  await fetchDb(deleteUserQuery, [userid]);
  await fetchDb(deletePostsQuery, [userid]);
  await fetchDb(deleteCommentsQuery, [userid]);
  return true;
};

const unDeleteUser = async (userid: string) => {
  const undeleteUserQuery = `UPDATE users SET isDeleted = 0 WHERE userid = ?`;
  await fetchDb(undeleteUserQuery, [userid]);
  return true;
};

export {
  getCommentsOfPost,
  getUserPost,
  getUsers,
  getUserInfo,
  overridePassword,
  userinfoEdit,
  editUserProfile,
  restrictUser,
  unRestrictUser,
  getUserStory,
  getUserFollowers,
  getUserFollowings,
  getAllPosts,
  deletePost,
  deleteComment,
  getReports,
  updateReportStatus,
  reportPost,
  getUserActivityLog,
  getPlatformActivity,
  softDeleteUser,
  getSinglePost,
  unDeleteUser
};
