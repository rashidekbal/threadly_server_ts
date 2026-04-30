import Response from "../constants/Response.js";
import message from "../types/message.type.js";
import logger, { formErrorBody } from "./pino.js";
import fetchDb from "./dbQueryHelper.js";



const get_CurrentTimeStamp_Sql_Format = () => {
  const date = new Date();

  const istDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  const yyyy = istDate.getFullYear();
  const mm = String(istDate.getMonth() + 1).padStart(2, "0");
  const dd = String(istDate.getDate()).padStart(2, "0");

  const hh = String(istDate.getHours()).padStart(2, "0");
  const min = String(istDate.getMinutes()).padStart(2, "0");
  const ss = String(istDate.getSeconds()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};
//TODO: write test for this function
const verifyAgeAbove18=(dob:string)=>{
  // implements age checking
  return true;
}

export {get_CurrentTimeStamp_Sql_Format ,verifyAgeAbove18};
