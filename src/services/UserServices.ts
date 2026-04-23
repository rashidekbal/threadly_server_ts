import UserRepo from "../repo/userRepo.js";

export default class UserService {
  userRepo: UserRepo;
  constructor(userRepo: UserRepo) {
    this.userRepo = userRepo;
  }
  getSuggestedUsers = (userid: string, page: number = 1) => {
   return this.userRepo.getSuggestedUsers(userid,page);
  };
  getUserinfo=(requestedUserId:string,requesterUserid:string)=>{
    return this.userRepo.getUser(requestedUserId,requesterUserid)
  }
  getUserWithUUid=(uuid:string)=>{
    return this.userRepo.getBasicUserDetailsByUUid(uuid);
  }
  getLoggedInUserData=(userid:string)=>{
    return this.userRepo.getLoggedInUserData(userid);
  }
}
