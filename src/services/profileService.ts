import UserRepo from "../repo/userRepo.js";
import {
  uploadOnColudinaryFromRam,
  uploadOnColudinaryviaLocalPath,
} from "./cloudinary.js";
import jwt from "jsonwebtoken";
import { v4 } from "uuid";
import RedisHelper from "../redis/operation.js";
import { getJWT_secretToken } from "../utils/envValuesAccessInterface.js";

export default class ProfileService {
  userRepo: UserRepo;
  constructor(userRepo: UserRepo) {
    this.userRepo = userRepo;
  }

  editName = (userid: string, name: string) => {
    return this.userRepo.updateUsername(userid, name);
  };

  editUserId = async (userid: string, newUserid: string) => {
    const existance: any = await this.userRepo.checkUserIdExists(newUserid);
    if (existance.length > 0) return { conflict: true };
    const sessionId = v4();
    await this.userRepo.updateUserId(userid, newUserid, sessionId);
    await RedisHelper.addEntry(`UserSession:${newUserid}`, sessionId);
    let token = jwt.sign({ userid: newUserid, sessionId }, getJWT_secretToken());
    return { conflict: false, token, userid: newUserid };
  };

  editBio = (userid: string, bio: string) => {
    return this.userRepo.updateBio(userid, bio);
  };

  editProfilePic = async (userid: string, file: any, isProduction: boolean) => {
    let url;
    if (isProduction) {
      const buffer = file?.buffer;
      if (!buffer) return null;
      url = await uploadOnColudinaryFromRam(buffer);
    } else {
      const path = file?.path;
      if (!path) return null;
      url = await uploadOnColudinaryviaLocalPath(path);
    }
    if (!url) return null;
    await this.userRepo.updateProfilePic(userid, url);
    return url;
  };
}
