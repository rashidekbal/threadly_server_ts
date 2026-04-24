import fetchDb from "../utils/dbQueryHelper.js";

export default class PostRepo {
  addPost = (userid: string, url: any, caption: string | null, type: string) => {
    let query = `insert into imagepost (userid,imageurl,caption,type) values (?,?,?,?)`;
    return fetchDb(query, [userid, url, caption, type]);
  };

  removePost = (userid: string, postid: number) => {
    let query = `delete from imagepost where userid=? and postid=?`;
    return fetchDb(query, [userid, postid]);
  };

  getPostInfo = (userid: string, postid: string) => {
    let query = `SELECT 
    p.*,
    u.username,
    u.profilepic,
    pl.userid AS likedBy,
    COUNT(DISTINCT pl.userid) AS likeCount,
    COUNT(DISTINCT post_comments.commentid) AS commentCount,
    COUNT(DISTINCT ps.shareid) AS shareCount,
    COUNT(DISTINCT plp.likeid) AS isLiked,
    COUNT(DISTINCT flw.followid) AS isFollowed,
    COUNT(DISTINCT pv.viewId) as viewCount
FROM imagepost AS p
JOIN users AS u 
      ON p.userid = u.userid
LEFT JOIN post_likes AS pl 
      ON p.postid = pl.postid
LEFT JOIN post_comments 
      ON p.postid = post_comments.postid
LEFT JOIN post_shares AS ps 
      ON p.postid = ps.postid
LEFT JOIN post_likes AS plp 
      ON p.postid = plp.postid AND plp.userid = ?
LEFT JOIN followers AS flw 
      ON p.userid = flw.followingid AND flw.followerid = ?
LEFT JOIN postview as pv on p.postid=pv.postid

WHERE 
    p.postid = ?
    AND ((u.isPrivate = 0 OR (flw.followid IS NOT NULL and flw.isApproved=true)) or u.userid=?)
GROUP BY p.postid;
`;
    return fetchDb(query, [userid, userid, postid, userid]);
  };

  getImageFeed = (userid: string) => {
    let query = `
    SELECT
      p.*,
      u.username,
      u.profilepic,

     
      (
        SELECT pl2.userid
        FROM post_likes pl2
        WHERE pl2.postid = p.postid
        ORDER BY pl2.likeid ASC LIMIT 1
      ) AS likedBy,

      COUNT(DISTINCT pl.userid) AS likeCount,
      COUNT(DISTINCT post_comments.commentid) AS commentCount,
      COUNT(DISTINCT ps.shareid) AS shareCount,
      COUNT(DISTINCT plp.likeid) AS isLiked,
      COUNT(DISTINCT flw.followid) AS isFollowed,
      COUNT(DISTINCT pv.viewId) as viewCount
      

    FROM imagepost AS p
           JOIN users AS u ON p.userid = u.userid

           LEFT JOIN post_likes AS pl ON p.postid = pl.postid
           LEFT JOIN post_comments ON p.postid = post_comments.postid
           LEFT JOIN post_shares AS ps ON p.postid = ps.postid

           LEFT JOIN post_likes AS plp
                     ON p.postid = plp.postid AND plp.userid = ?

           LEFT JOIN followers AS flw
                     ON p.userid = flw.followingid AND flw.followerid = ?
          LEFT JOIN postview as pv on p.postid=pv.postid
          

    WHERE
      p.type = "image"
      AND (u.isPrivate = 0 OR (flw.followid IS NOT NULL and flw.isApproved=true))

    GROUP BY p.postid
    ORDER BY RAND() asc
    LIMIT 100
  `;
    return fetchDb(query, [userid, userid]);
  };

  getVideoFeed = (userid: string, limit: number) => {
    let query = ` SELECT 
    p.*,
    u.username,
    u.profilepic,

    pl.userid AS likedBy,
    COUNT(DISTINCT pl.userid) AS likeCount,
    COUNT(DISTINCT post_comments.commentid) AS commentCount,
    COUNT(DISTINCT ps.shareid) AS shareCount,
    COUNT(DISTINCT plp.likeid) AS isLiked,
    COUNT(DISTINCT flw.followid) AS isFollowed,
    COUNT(DISTINCT pv.viewId) as viewCount

FROM imagepost AS p
JOIN users AS u ON p.userid = u.userid

LEFT JOIN post_likes AS pl ON p.postid = pl.postid
LEFT JOIN post_comments ON p.postid = post_comments.postid
LEFT JOIN post_shares AS ps ON p.postid = ps.postid

LEFT JOIN post_likes AS plp 
        ON p.postid = plp.postid AND plp.userid = ?

LEFT JOIN followers AS flw 
        ON p.userid = flw.followingid AND flw.followerid = ?
LEFT JOIN postview as pv on p.postid=pv.postid


WHERE 
    p.type = "video"
    AND (u.isPrivate = 0 OR( flw.followid IS NOT NULL and flw.isApproved=true))

GROUP BY p.postid
ORDER BY RAND() + (p.postid * 0.0001)
LIMIT ?
`;
    return fetchDb(query, [userid, userid, limit]);
  };

  getUserPosts = (reqMakerUserId: string, userid: string, limit: number, offset: number) => {
    let query = `
SELECT 
    p.*, u.username, u.profilepic,
    pl.userid AS likedBy,
    COUNT(DISTINCT pl.userid) AS likeCount,
    COUNT(DISTINCT post_comments.commentid) AS commentCount,
    COUNT(DISTINCT ps.shareid) AS shareCount,
    COUNT(DISTINCT plp.likeid) AS isLiked,
    COUNT(DISTINCT flw.followid) AS isFollowed,
    count(DISTINCT pv.viewId) as viewCount
   

FROM imagepost AS p
JOIN users AS u ON p.userid = u.userid
LEFT JOIN post_likes AS pl ON p.postid = pl.postid
LEFT JOIN post_comments ON p.postid = post_comments.postid
LEFT JOIN post_shares AS ps ON p.postid = ps.postid
LEFT JOIN post_likes AS plp ON p.postid = plp.postid AND plp.userid = ?
LEFT JOIN followers AS flw ON p.userid = flw.followingid AND flw.followerid = ?
LEFT JOIN postview as pv on p.postid=pv.postid
WHERE p.userid = ?
GROUP BY p.postid
ORDER BY p.created_at DESC
limit ?
offset ?

`;
    return fetchDb(query, [userid, reqMakerUserId, userid, limit, offset]);
  };

  recordPostView = (userid: string, uuid: string, postid: string) => {
    const query = `insert into postview (userid,uuid,postid) values(?,?,?)`;
    return fetchDb(query, [userid, uuid, postid]);
  };
}
