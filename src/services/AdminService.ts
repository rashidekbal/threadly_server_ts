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