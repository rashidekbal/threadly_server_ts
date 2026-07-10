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
where imgpst.userid=? group by imgpst.postid order by imgpst.postid desc
`;
  return fetchDb(db_query, [userid]);
};
const getUsers = (page: number) => {
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
   left join imagepost as imgpst on usr.userid=imgpst.userid group by usr.userid `;
  return fetchDb(db_query, null);
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
const getUserStory=async(userid:string)=>{
  const db_query = `
select st.*,
 count(distinct sl.userid) as likesCount 
 from story as st left join story_likes as sl on st.id=sl.storyid 
 where st.userid=? 
 group by st.id order by st.id desc
`;
return fetchDb(db_query,[userid]);
}
const getAllPosts = () => {
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
    group by imgpst.postid order by imgpst.postid desc
  `;
  return fetchDb(db_query, null);
};
const deletePost = (postid: number) => {
  return fetchDb(`delete from imagepost where postid=?`, [postid]);
};
const deleteComment = (commentid: number) => {
  return fetchDb(`delete from post_comments where commentid=?`, [commentid]);
};
const getReports = (status: string) => {
  const db_query = `
    select pr.reportid, pr.postid, pr.reason, pr.status, pr.createdAt,
    imgpst.imageurl, imgpst.caption, imgpst.type,
    reporter.username as reporterUsername,
    owner.username as postOwnerUsername, owner.userid as postOwnerUserid, owner.uuid as postOwnerUuid
    from post_reports as pr
    left join imagepost as imgpst on pr.postid = imgpst.postid
    left join users as reporter on pr.reporterUserid = reporter.userid
    left join users as owner on imgpst.userid = owner.userid
    where pr.status=? order by pr.createdAt desc
  `;
  return fetchDb(db_query, [status]);
};
const updateReportStatus = (reportid: number, status: string) => {
  return fetchDb(`update post_reports set status=? where reportid=?`, [status, reportid]);
};
const reportPost = (userid: string, postid: number, reason: string) => {
  return fetchDb(`insert into post_reports (reporterUserid, postid, reason) values (?,?,?)`, [userid, postid, reason]);
};
const getUserActivityLog = (userid: string) => {
  const db_query = `
    (select 'post' as type, imgpst.created_at as time, imgpst.caption as detail, imgpst.imageurl as media
     from imagepost as imgpst where imgpst.userid=? order by imgpst.created_at desc limit 10)
    union all
    (select 'comment' as type, pc.createdAt as time, pc.comment_text as detail, null as media
     from post_comments as pc where pc.userid=? order by pc.createdAt desc limit 10)
    union all
    (select 'like' as type, pl.createdAt as time, concat('liked post #', pl.postid) as detail, null as media
     from post_likes as pl where pl.userid=? order by pl.createdAt desc limit 10)
    union all
    (select 'story' as type, st.createdAt as time, null as detail, st.storyUrl as media
     from story as st where st.userid=? order by st.createdAt desc limit 10)
    order by time desc limit 30
  `;
  return fetchDb(db_query, [userid, userid, userid, userid]);
};
const getPlatformActivity = () => {
  const db_query = `
    (select 'post' as type, imgpst.created_at as time, imgpst.caption as detail, imgpst.imageurl as media, imgpst.userid
     from imagepost as imgpst order by imgpst.created_at desc limit 15)
    union all
    (select 'comment' as type, pc.createdAt as time, pc.comment_text as detail, null as media, pc.userid
     from post_comments as pc order by pc.createdAt desc limit 15)
    union all
    (select 'like' as type, pl.createdAt as time, concat('liked post #', pl.postid) as detail, null as media, pl.userid
     from post_likes as pl order by pl.createdAt desc limit 10)
    union all
    (select 'story' as type, st.createdAt as time, null as detail, st.storyUrl as media, st.userid
     from story as st order by st.createdAt desc limit 10)
    order by time desc limit 50
  `;
  return fetchDb(db_query, null);
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
  getAllPosts,
  deletePost,
  deleteComment,
  getReports,
  updateReportStatus,
  reportPost,
  getUserActivityLog,
  getPlatformActivity,
};
