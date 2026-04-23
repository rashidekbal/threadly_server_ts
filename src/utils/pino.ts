
import pino from "pino"
import express from "express"

const logger=pino({
    transport:{
        target:"pino/file",
        options:{destination:"./src/public/errorLogs/log.txt",mkdir:true}
    }
});
export const formErrorBody=(error:string,errCode:number|null,req:express.Request|null)=>{
    const apiPath=req?req.route.path:"no path"
     return ({errorCode: errCode?errCode:"0000",err: error,Apipath:apiPath});
}
export default logger