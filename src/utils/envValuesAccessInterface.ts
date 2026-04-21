import "dotenv/config"
const getJWT_secretToken=()=>{
    return process.env.SECRET_KEY as string
}
export {getJWT_secretToken}