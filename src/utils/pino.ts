
import pino from "pino"
import express from "express"

const logger=pino({
    transport:{
        target:"pino/file",
        options:{destination:"./src/public/errorLogs/log.txt",mkdir:true}
    }
});
import { logAnomaly } from "../repo/anomalyRepo.js";
import { socketIo } from "../app.js";

export const formErrorBody=(error:string,errCode:number|null,req:express.Request|null)=>{
    const apiPath=req?req.route.path:"no path";
    const errorCodeStr = errCode ? String(errCode) : "0000";
    
    // Log to DB and alert admins asynchronously
    logAnomaly(error, errorCodeStr, apiPath).then(() => {
      if (socketIo) {
        socketIo.to("admin_room").emit("anomaly_alert", {
          error_message: error,
          error_code: errorCodeStr,
          api_path: apiPath,
          timestamp: new Date().toISOString()
        });
      }
    }).catch((e: any) => console.error("Failed to log anomaly:", e));

    return ({errorCode: errorCodeStr,err: error,Apipath:apiPath});
}
export default logger