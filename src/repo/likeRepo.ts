import fetchDb from "../utils/dbQueryHelper.js";

export default class LikeRepo {
  likePost = (userid: string, postid: number) => {
    let query = "insert into post_likes (userid,postid) values (?,?)";
    return fetchDb(query, [userid, postid]);
  };

  unlikePost = (userid: string, postid: number) => {
    let query = "delete from post_likes where  userid = ? and postid=?";
    return fetchDb(query, [userid, postid]);
  };

  likeComment = (userid: string, commentid: string) => {
    let query = `insert into comment_likes (userid,commentid) value(?,?)`;
    return fetchDb(query, [userid, commentid]);
  };

  unlikeComment = (userid: string, commentid: string) => {
    let query = `delete from comment_likes where userid= ? and commentid= ?`;
    return fetchDb(query, [userid, commentid]);
  };

  likeStory = (userid: string, storyid: string) => {
    const query = `insert into story_likes (userid,storyid) values(?,?)`;
    return fetchDb(query, [userid, storyid]);
  };

  unlikeStory = (userid: string, storyid: string) => {
    const query = `delete from story_likes where userid=? and storyid=?`;
    return fetchDb(query, [userid, storyid]);
  };

  getPostOwnerDetails = (postid: string) => {
    const query = `select usr.fcmToken,usr.userid from imagepost as imgpst left join users as usr on imgpst.userid = usr.userid where postid=? limit 1`;
    return fetchDb(query, [postid]);
  };

  getPostOwnerDetailsWithLink = (postid: string) => {
    const query = `select imgpst.*,usr.userid,usr.fcmToken from imagepost as imgpst left join users as usr on imgpst.userid = usr.userid where postid=? limit 1`;
    return fetchDb(query, [postid]);
  };

  getUserBasicDetails = (userid: string) => {
    const query = `select username,profilepic from users where userid=? limit 1`;
    return fetchDb(query, [userid]);
  };

  getCommentOwnerDetails = (commentid: string) => {
    const query = `select usr.fcmToken,usr.userid,cmt.postid,imp.imageurl from post_comments as cmt left join users as usr on cmt.userid=usr.userid left join imagepost as imp on cmt.postid = imp.postid where commentid=? limit 1`;
    return fetchDb(query, [commentid]);
  };

  getCommentOwnerBasicDetails = (commentid: string) => {
    const query = `select usr.fcmToken ,usr.userid from post_comments as cmt left join users as usr on cmt.userid=usr.userid where commentid=? limit 1`;
    return fetchDb(query, [commentid]);
  };
}
