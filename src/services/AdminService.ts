import adminDashBoardStats from "../types/adminDashBoardStats.js";
import fetchDb from "../utils/dbQueryHelper.js";
import logger, { formErrorBody } from "../utils/pino.js";

export default class AdminService{
    constructor(){}

     getLikesStats=async():Promise<null|adminDashBoardStats>=> {
  try {
    const totalView = await fetchDb(
      `select count(distinct likeid)as totalValue from post_likes `,null
    );
    const weekBeforeLastWeek = await fetchDb(
      `select count(distinct likeid)as value   from post_likes where createdAt <=NOW() - interval 336 hour`,null
    );
    const lastWeek = await fetchDb(
      `select count(distinct likeid)as value   from post_likes where createdAt <=NOW() - interval 168 hour `,null
    );
    const currentWeek = await fetchDb(
      `select count(distinct likeid)as value   from post_likes where createdAt >=NOW() - interval 168 hour `,null
    );
    if(!(lastWeek instanceof Array)||!(weekBeforeLastWeek instanceof Array)||!(totalView instanceof Array)||!(currentWeek instanceof Array
    ) )return null;
    return this.calculateStats(lastWeek,weekBeforeLastWeek,totalView,currentWeek);
  } catch (error) {
    logger.error(formErrorBody(error as string ,null,null));
    return null;
  }
}




  getCommentsStats=async():Promise<adminDashBoardStats|null> => {
  try {
    const totalView = await fetchDb(
      `select count(distinct commentid)as totalValue from post_comments `,null
    );
    const weekBeforeLastWeek = await fetchDb(
      `select count(distinct commentid)as value   from post_comments where createdAt <=NOW() - interval 336 hour`,null
    );
    const lastWeek = await fetchDb(
      `select count(distinct commentid)as value   from post_comments where createdAt <=NOW() - interval 168 hour `,null
    );
    const currentWeek = await fetchDb(
      `select count(distinct commentid)as value   from post_comments where createdAt >=NOW() - interval 168 hour `,null
    );

   if(!(lastWeek instanceof Array)||!(weekBeforeLastWeek instanceof Array)||!(totalView instanceof Array)||!(currentWeek instanceof Array
    ) )return null;
    return this.calculateStats(lastWeek,weekBeforeLastWeek,totalView,currentWeek);
  } catch (error) {
    logger.error(formErrorBody(error as string ,null,null));
    return null;
  }
}
 getUsersStats=async():Promise<adminDashBoardStats|null> => {
  try {
    const totalView = await fetchDb(
      `select count(distinct userid)as totalValue from users `,null
    );
    const weekBeforeLastWeek = await fetchDb(
      `select count(distinct userid)as value   from users where createdAt <=NOW() - interval 336 hour`,null
    );
    const lastWeek = await fetchDb(
      `select count(distinct userid)as value   from users where createdAt <=NOW() - interval 168 hour `,null
    );
    const currentWeek = await fetchDb(
      `select count(distinct userid)as value   from users where createdAt >=NOW() - interval 168 hour `,null
    );


   if(!(lastWeek instanceof Array)||!(weekBeforeLastWeek instanceof Array)||!(totalView instanceof Array)||!(currentWeek instanceof Array
    ) )return null;
    return this.calculateStats(lastWeek,weekBeforeLastWeek,totalView,currentWeek);
  } catch (error) {
    logger.error(formErrorBody(error as string ,null,null));
    return null;
  }
}
 getPostViewStats=async():Promise<adminDashBoardStats|null> => {
  try {
     const totalView = await fetchDb(
      `select count(distinct viewId)as totalValue from postview `,null
    );

    const weekBeforeLastWeek = await fetchDb(
      `select count(distinct viewId)as value   from postview where created_at <=NOW() - interval 336 hour`,null
    );
    const lastWeek = await fetchDb(
      `select count(distinct viewId)as value   from postview where created_at <=NOW() - interval 168 hour `,null
    );
    const currentWeek = await fetchDb(
      `select count(distinct viewId)as value   from postview where created_at >=NOW() - interval 168 hour `,null
    );



   if(!(lastWeek instanceof Array)||!(weekBeforeLastWeek instanceof Array)||!(totalView instanceof Array)||!(currentWeek instanceof Array
    ) )return null;
    return this.calculateStats(lastWeek,weekBeforeLastWeek,totalView,currentWeek);
  } catch (error) {
    logger.error(formErrorBody(error as string ,null,null));
    return null;
  }
}



getSystemScan = async () => {
  try {
    const [
      totalUsers, restrictedUsers, pendingReports,
      totalPosts, totalComments, postsLast24h,
      signupsLast24h, recentSignupSpike,
    ] = await Promise.all([
      fetchDb(`select count(distinct userid) as value from users`, null),
      fetchDb(`select count(distinct userid) as value from users where blocked=1`, null),
      fetchDb(`select count(*) as value from post_reports where status='pending'`, null),
      fetchDb(`select count(distinct postid) as value from imagepost`, null),
      fetchDb(`select count(distinct commentid) as value from post_comments`, null),
      fetchDb(`select count(distinct postid) as value from imagepost where created_at >= now() - interval 24 hour`, null),
      fetchDb(`select count(distinct userid) as value from users where createdAt >= now() - interval 24 hour`, null),
      fetchDb(`select count(distinct userid) as value from users where createdAt >= now() - interval 1 hour`, null),
    ]);
    const extract = (r: any) => (r instanceof Array && r[0] ? Number(r[0].value) : 0);
    const spike = extract(recentSignupSpike);
    const checks = [
      { label: "Total registered users", value: extract(totalUsers), status: "ok" },
      { label: "Restricted accounts", value: extract(restrictedUsers), status: extract(restrictedUsers) > 0 ? "warn" : "ok" },
      { label: "Pending reports", value: extract(pendingReports), status: extract(pendingReports) > 5 ? "warn" : "ok" },
      { label: "Total posts", value: extract(totalPosts), status: "ok" },
      { label: "Total comments", value: extract(totalComments), status: "ok" },
      { label: "Posts in last 24 hours", value: extract(postsLast24h), status: "ok" },
      { label: "Signups in last 24 hours", value: extract(signupsLast24h), status: "ok" },
      { label: "Signups in last 1 hour (spike check)", value: spike, status: spike > 20 ? "alert" : "ok" },
    ];
    const overallStatus = checks.some(c => c.status === "alert") ? "alert" : checks.some(c => c.status === "warn") ? "warn" : "ok";
    return { checks, overallStatus, scannedAt: new Date().toISOString() };
  } catch (error) {
    logger.error(formErrorBody(error as string, null, null));
    return null;
  }
};

getDashboardReport = async () => {
  try {
    const [users, likes, comments, views, posts, pendingReports, restrictedUsers] = await Promise.all([
      fetchDb(`select count(distinct userid) as value from users`, null),
      fetchDb(`select count(distinct likeid) as value from post_likes`, null),
      fetchDb(`select count(distinct commentid) as value from post_comments`, null),
      fetchDb(`select count(distinct viewId) as value from postview`, null),
      fetchDb(`select count(distinct postid) as value from imagepost`, null),
      fetchDb(`select count(*) as value from post_reports where status='pending'`, null),
      fetchDb(`select count(distinct userid) as value from users where blocked=1`, null),
    ]);
    const extract = (r: any) => (r instanceof Array && r[0] ? Number(r[0].value) : 0);
    return {
      generatedAt: new Date().toISOString(),
      totalUsers: extract(users),
      totalPosts: extract(posts),
      totalLikes: extract(likes),
      totalComments: extract(comments),
      totalViews: extract(views),
      pendingReports: extract(pendingReports),
      restrictedAccounts: extract(restrictedUsers),
    };
  } catch (error) {
    logger.error(formErrorBody(error as string, null, null));
    return null;
  }
};

 getSignupsTrend = async (): Promise<any[] | null> => {
  try {
    const result = await fetchDb(
      `select date(createdAt) as day, count(distinct userid) as signups
       from users where createdAt >= now() - interval 30 day
       group by day order by day asc`,
      null
    );
    if (!(result instanceof Array)) return null;
    return result;
  } catch (error) {
    logger.error(formErrorBody(error as string, null, null));
    return null;
  }
};

getPostsTrend = async (): Promise<any[] | null> => {
  try {
    const result = await fetchDb(
      `select date(created_at) as day, count(distinct postid) as posts
       from imagepost where created_at >= now() - interval 30 day
       group by day order by day asc`,
      null
    );
    if (!(result instanceof Array)) return null;
    return result;
  } catch (error) {
    logger.error(formErrorBody(error as string, null, null));
    return null;
  }
};

getTopUsers = async (page: number = 1): Promise<any[] | null> => {
  try {
    const offset = (page - 1) * 10;
    const result = await fetchDb(
      `select usr.userid, usr.username, usr.profilepic as profile,
       count(distinct fl.followid) as followers
       from users as usr
       left join followers as fl on usr.userid = fl.followingid and fl.isApproved = 1
       group by usr.userid order by followers desc limit 10 offset ?`,
      [offset]
    );
    if (!(result instanceof Array)) return null;
    return result;
  } catch (error) {
    logger.error(formErrorBody(error as string, null, null));
    return null;
  }
};

getTopPosts = async (page: number = 1): Promise<any[] | null> => {
  try {
    const offset = (page - 1) * 10;
    const result = await fetchDb(
      `select imgpst.postid, imgpst.imageurl, imgpst.caption,
       imgpst.type, usr.username, usr.userid, usr.profilepic as profile,
       count(distinct pl.likeid) as likes
       from imagepost as imgpst
       left join post_likes as pl on imgpst.postid = pl.postid
       left join users as usr on imgpst.userid = usr.userid
       group by imgpst.postid order by likes desc limit 10 offset ?`,
      [offset]
    );
    if (!(result instanceof Array)) return null;
    return result;
  } catch (error) {
    logger.error(formErrorBody(error as string, null, null));
    return null;
  }
};

 calculateStats=(lastWeek:any[],weekBeforeLastWeek:any[],totalView:any[],currentWeek:any[]):adminDashBoardStats=>{

    let lastChange =
      (lastWeek[0].value * 100) / weekBeforeLastWeek[0].value - 100;

    let currentChange =
      (totalView[0].totalValue * 100) / lastWeek[0].value - 100;
    lastChange = isNaN(lastChange) ? 0 : lastChange;
    currentChange = isNaN(currentChange) ? 0 : currentChange;
    const trendChange = lastChange - currentChange;
    const data:adminDashBoardStats = {
      totalValue: totalView[0].totalValue,
      last7Days: currentWeek[0].value,
      change: Math.abs(trendChange).toFixed(2)=="Infinity"?100+"%": Math.abs(trendChange).toFixed(2)+ "%",
      trend: trendChange > 0 ? "down" : "up",
    };
    return data;

 }
    
    
}