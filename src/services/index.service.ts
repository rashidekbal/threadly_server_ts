import UserRepo from "../repo/userRepo.js";
import AdminService from "./AdminService.js";
import AuthService from "./authService.js";
import UserService from "./UserServices.js";


const adminService:AdminService=new AdminService();
const userService:UserService=new UserService(new UserRepo())
const authService:AuthService=new AuthService(new UserRepo());
export{adminService,
    userService,
    authService
}