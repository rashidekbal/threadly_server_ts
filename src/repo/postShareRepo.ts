import fetchDb from "../utils/dbQueryHelper.js";

export default class PostShareRepo {
  addShareRecord = (senderId: string, receiverId: string, postid: string) => {
    const query = `insert into post_shares (sharerid,sharedto,postid) values(?,?,?)`;
    return fetchDb(query, [senderId, receiverId, postid]);
  };
}
