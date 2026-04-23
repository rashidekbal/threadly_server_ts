import UserRepo from "../repo/userRepo.js";
import fetchDb from "../utils/dbQueryHelper.js";

export default class UserService {
  userRepo: UserRepo;
  constructor(userRepo: UserRepo) {
    this.userRepo = userRepo;
  }
  getSuggestedUsers = (userid: string, page: number = 1) => {
   return this.userRepo.getSuggestedUsers(userid,page);
  };
}
