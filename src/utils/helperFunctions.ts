import Response from "../constants/Response.js";
import message from "../types/message.type.js";
import logger, { formErrorBody } from "./pino.js";
import fetchDb from "./dbQueryHelper.js";



const get_CurrentTimeStamp_Sql_Format=()=>{
  const date=new Date();
  return date.toISOString().slice(0,19).replace("T"," ");
}
//TODO: write test for this function
const verifyAgeAbove18=(dob:string)=>{
  // implements age checking
  return true;
}

export {get_CurrentTimeStamp_Sql_Format ,verifyAgeAbove18};
