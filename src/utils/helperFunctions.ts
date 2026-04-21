import Response from "../constants/Response.js";
import message from "../types/message.type.js";
import logger, { formErrorBody } from "./pino.js";
import fetchDb from "./dbQueryHelper.js";



const get_CurrentTimeStamp_Sql_Format=()=>{
  const date=new Date();
  return date.toISOString().slice(0,19).replace("T"," ");
}

export {get_CurrentTimeStamp_Sql_Format };
