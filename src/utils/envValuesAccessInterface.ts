import "dotenv/config"
const getJWT_secretToken=()=>{
    return process.env.SECRET_KEY as string
}
const getEazyOtpApiKey=()=>{
    return process.env.EAZY_OTP_API_KEY as string;
}
export {getJWT_secretToken,getEazyOtpApiKey}