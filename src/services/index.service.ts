import FollowRepo from "../repo/followRepo.js";
import UserRepo from "../repo/userRepo.js";
import AdminService from "./AdminService.js";
import AuthService from "./authService.js";
import FcmService from "./fcmService.js";
import FollowService from "./followService.js";
import PrivacyService from "./PrivacyService.js";
import UserService from "./UserServices.js";


const adminService:AdminService=new AdminService();
const userService:UserService=new UserService(new UserRepo())
const authService:AuthService=new AuthService(new UserRepo());
const privacyService:PrivacyService=new PrivacyService(new UserRepo());
const followService:FollowService=new FollowService(new FollowRepo());
const fcmService:FcmService=new FcmService();
export{adminService,
    userService,
    authService,
    privacyService,
    followService,
    fcmService,
}