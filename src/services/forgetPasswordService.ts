import UserRepo from "../repo/userRepo.js";
import bcrypt from "bcrypt";
import { v4 } from "uuid";

export default class ForgetPasswordService {
  userRepo: UserRepo;
  constructor(userRepo: UserRepo) {
    this.userRepo = userRepo;
  }

  resetPasswordByPhone = async (phone: string, password: string) => {
    const hashedPassword = await bcrypt.hash(password, 12);
    const sessionId = v4();
    const response: any = await this.userRepo.resetPasswordByPhone(phone, hashedPassword, sessionId);
    return response.affectedRows;
  };

  resetPasswordByEmail = async (email: string, password: string) => {
    const hashedPassword = await bcrypt.hash(password, 12);
    const sessionId = v4();
    const response: any = await this.userRepo.resetPasswordByEmail(email, hashedPassword, sessionId);
    return response.affectedRows;
  };
}
