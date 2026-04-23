import { v4 } from "uuid";
import errorEnum from "../constants/errorsEnum.js";
import UserRepo from "../repo/userRepo.js";
import bcryptUtil from "../utils/bcryptUtil.js";
import { get_CurrentTimeStamp_Sql_Format, verifyAgeAbove18 } from "../utils/helperFunctions.js";
import jwt from "jsonwebtoken";
import RedisHelper from "../redis/operation.js";
import { getJWT_secretToken } from "../utils/envValuesAccessInterface.js";
import ServiceError from "../constants/serviceError.js";
import LoginType from "../constants/loginTypeEnum.js";
import {v4 as UUIDv4} from "uuid"
import user from "../types/user.js";
import registerUserType from "../types/registerUserType.js";

export default class AuthService {
  userRepo: UserRepo;
  constructor(userRepo: UserRepo) {
    this.userRepo = userRepo;
  }
  loginUserId = async (loginType:LoginType,userId: string, password: string) => {
    try {
      let response = await this.userRepo.fetchUserforAuth(loginType, userId);
      if (!(response instanceof Array))
        throw new ServiceError(errorEnum.user_not_exist,"provided user dosent exist");
      if (response.length == 0) throw new ServiceError(errorEnum.user_not_exist,"please provide a valid userid");
      let userdata = response[0];
      let is_match = await bcryptUtil.verifyPassword(userdata.pass, password);
      if (!is_match) throw new ServiceError(errorEnum.invalid_password,"provided password is invalid");
      if (this.isbanned(userdata)) throw new ServiceError(errorEnum.banned,"user is banned from the platform");
      const sessionId = v4();
      await this.userRepo.createSession(sessionId, userId);
      await RedisHelper.addEntry(`UserSession:${userdata.userid}`, sessionId);
      let token = jwt.sign(
        { userid: userdata.userid, sessionId },
        getJWT_secretToken(),
      );
      return {userdata:response,token};
    } catch (error) {
        if(error instanceof ServiceError){
            throw  error;
        }
        throw new ServiceError(errorEnum.internal_error,error as string)

    }
  };

  logoutUser=async(userid:string)=>{
    try {
        await this.userRepo.logoutUser(userid);
        RedisHelper.deleteEntry(`UserSession:${userid}`)
    } catch (error) {
        throw error
        
    }

  }

 
  registerUser=async(userdata:registerUserType)=>{
       try {
         const password = await bcryptUtil.hashPassword(userdata.password);

    // Generate a unique user ID using the username and current timestamp
    let userid = userdata.username.split(" ")[0] + Date.now();
    let uuid = UUIDv4();
    const sessionId = UUIDv4();

    // Verify if the user is an adult based on their date of birth
    let isAdult = verifyAgeAbove18(userdata.dob);
    if (!isAdult) {
     throw new ServiceError(errorEnum.notAdult,"age must be above 18 or 18")
    }
    const data:user={uuid,
        userid,
        username:userdata.username,
        email:userdata.email,
        phone:userdata.phone,
        password,
        bio:userdata.bio,
        dob:userdata.dob,
        sessionId

    }

      await this.userRepo.registerNewUser(data)
      let token = jwt.sign({ userid, sessionId }, getJWT_secretToken());
            return {userdata:data,token}
       } catch (error) {
        if(error instanceof ServiceError){
            throw error;
        }
        throw new ServiceError(errorEnum.internal_error,error as string)
        
       }


}

  //TODO: write test for this function
  isbanned = (userdata: any) => {
    let isBanned: boolean = userdata.blocked;
    let banDuration = userdata.banDuraton;
    let banned_at: string = userdata.banned_at;
    if (!isBanned) return false;
    let date = new Date(banned_at);
    banned_at = date.toISOString();
    banned_at = banned_at.slice(0, 19).replace("T", " ");
    let currentTimeStamp: string = get_CurrentTimeStamp_Sql_Format();
    if (banDuration === "permanent") return true;
    let timeDiff = Math.abs(
      new Date(currentTimeStamp).getTime() - new Date(banned_at).getTime(),
    );
    if (timeDiff >= 24 * 60 * 60 * 1000) return false;
    return true;
  };
}
