import bcrypt from "bcrypt";
const hashPassword=async (password:string)=>{
        const hashedPassword=await bcrypt.hash(password,12);
        return hashedPassword;
}
const verifyPassword=async(serverHashedPassword:string,rawPassword:string)=>{
    const isVerified=await bcrypt.compare(rawPassword,serverHashedPassword);
    return isVerified;
    
}
const bcryptUtil={
    hashPassword,verifyPassword
}
export default bcryptUtil;