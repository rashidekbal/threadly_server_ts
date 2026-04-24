import fetchDb from "../utils/dbQueryHelper.js";

export default class SearchRepo {
  searchAccounts = (target: string) => {
    const query = `SELECT 
  uuid,username,
    userid,
    profilepic,
    CASE 
        WHEN LOWER(userid) = LOWER(?) THEN 1
        WHEN LOWER(userid) LIKE LOWER(concat(?,'%')) THEN 2
        WHEN LOWER(userid) LIKE LOWER(concat('%',?,'%')) THEN 3
        ELSE 4
        END
        as priority
    FROM users WHERE LOWER(userid) LIKE LOWER(CONCAT('%',?,'%')) 
    order by priority asc, userid asc limit 30
    `;
    return fetchDb(query, [target, target, target, target]);
  };

  searchReels = (target: string, userid: string) => {
    const query = ` SELECT 
    p.*,
    u.username,
    u.profilepic,

    pl.userid AS likedBy,
    COUNT(DISTINCT pl.userid) AS likeCount,
    COUNT(DISTINCT post_comments.commentid) AS commentCount,
    COUNT(DISTINCT ps.shareid) AS shareCount,
    COUNT(DISTINCT plp.likeid) AS isLiked,
    COUNT(DISTINCT flw.followid) AS isFollowed,
    COUNT(DISTINCT pv.viewId) as viewCount,
    case 
    when lower(p.caption) like lower(?) then 1
    when lower(p.caption) like lower(concat(?,'%')) then 2
    when lower(p.caption) like lower(concat('%',?,'%')) then 3
    else 4
    end as 'rank'


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

    lower(p.caption) like lower(concat('%',?,'%'))
    AND (u.isPrivate = 0 OR( flw.followid IS NOT NULL and flw.isApproved=true))

GROUP BY p.postid
ORDER by 'rank' ASC ,p.caption asc 
LIMIT 30;`;
    return fetchDb(query, [target, target, target, userid, userid, target]);
  };
}
