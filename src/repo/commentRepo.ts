import fetchDb from "../utils/dbQueryHelper.js";

export default class CommentRepo {
  addComment = (userid: string, postid: number, comment: string) => {
    let query = "insert into post_comments (userid,postid,comment_text) values (?,?,?)";
    return fetchDb(query, [userid, postid, comment]);
  };

  removeComment = (userid: string, postid: number, commentid: number) => {
    let query = "delete from post_comments where userid = ? and postid=? and commentid=?";
    return fetchDb(query, [userid, postid, commentid]);
  };

  getComments = (userid: string, postid: number) => {
    let query = `
select pc.*,
u.username,
u.profilepic,
count(distinct cl.userid) as comment_likes_count,
 count(distinct clc.comment_like_id) as isLiked,
 count(distinct rply.commentid) as replyCount
  from post_comments  as pc join users as u on pc.userid=u.userid left join comment_likes as cl on pc.commentid=cl.commentid 
  left join comment_likes as clc on pc.commentid=clc.commentid and clc.userid=?
  left join post_comments as rply on pc.commentid=rply.replyToCommentId 
  where pc.postid =? and pc.replyToCommentId is null group by pc.commentid order by pc.commentid desc
`;
    return fetchDb(query, [userid, postid]);
  };

  addReply = (userid: string, postId: number, reply: string, replyToCommentId: string) => {
    let query = "insert into post_comments (userid,postid,comment_text,replyToCommentId) values (?,?,?,?)";
    return fetchDb(query, [userid, postId, reply, replyToCommentId]);
  };

  getCommentReplies = (userid: string, commentId: number) => {
    let query = `
select pc.*,
u.username,
u.profilepic,
count(distinct cl.userid) as comment_likes_count,
 count(distinct clc.comment_like_id) as isLiked 
  from post_comments  as pc join users as u on pc.userid=u.userid left join comment_likes as cl on pc.commentid=cl.commentid 
  left join comment_likes as clc on pc.commentid=clc.commentid and clc.userid=?
  where pc.replyToCommentId=? group by pc.commentid order by pc.commentid desc limit 5

`;
    return fetchDb(query, [userid, commentId]);
  };
}
