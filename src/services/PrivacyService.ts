import UserRepo from "../repo/userRepo.js";
import logger, { formErrorBody } from "../utils/pino.js";

export default class PrivacyService {
  userRepo: UserRepo;
  constructor(userRepo: UserRepo) {
    this.userRepo = userRepo;
  }

  isUserPrivate = async (userid: string) => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = await this.userRepo.getUserPrivacyInfo(userid);
        if (!(response instanceof Array)) return reject("invalid userid");
        if (response.length == 0) return reject(null);
        const isPrivate = response[0].isPrivate == 1;
        resolve(isPrivate);
      } catch (error) {
        logger.error(formErrorBody(error as string, null, null));
        reject(error);
      }
    });
  };
  setUserPrivacy=(userid:string,status:boolean)=>{
    return this.userRepo.setUserAccountPrivacyStatus(userid,status);
  }
}
