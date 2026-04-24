import "dotenv/config"
const getJWT_secretToken=()=>{
    return process.env.SECRET_KEY as string
}
const getEazyOtpApiKey=()=>{
    return process.env.EAZY_OTP_API_KEY as string;
}
const isProductionMode=()=>{
    return process.env.PRODUCTION === "true";
}
const getDbUrl=()=>{
    return process.env.DB_URL as string;
}
const getPort=()=>{
    return process.env.PORT as string;
}
const getRedisUrl=()=>{
    return process.env.RedisUrl || null;
}
const getCloudinaryCloudName=()=>{
    return process.env.CLOUDINARY_CLOUD_NAME as string;
}
const getCloudinaryApiKey=()=>{
    return process.env.CLOUDINARY_API_KEY as string;
}
const getCloudinarySecretKey=()=>{
    return process.env.CLOUDINARY_SECRET_KEY as string;
}
const getFirebaseAdmin=()=>{
    return process.env.FIREBASE_ADMIN as string;
}
const getAdminEmail=()=>{
    return process.env.ADMIN_EMAIL as string;
}
const getAdminPassword=()=>{
    return process.env.ADMIN_PASSWORD as string;
}
export {
    getJWT_secretToken,
    getEazyOtpApiKey,
    isProductionMode,
    getDbUrl,
    getPort,
    getRedisUrl,
    getCloudinaryCloudName,
    getCloudinaryApiKey,
    getCloudinarySecretKey,
    getFirebaseAdmin,
    getAdminEmail,
    getAdminPassword,
}