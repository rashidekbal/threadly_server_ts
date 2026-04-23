import { sessionIdExpireTime } from "../constants/redisConstants.js";
import redisClient from "./redis.js";
export default class RedisHelper{
    static deleteEntry=async(key:string)=>{
   return redisClient.del(key);
}

static addEntry=async(key:string,value:string|number)=>{
    return await redisClient.set(key,value,"EX",sessionIdExpireTime);

}
static getEntry=async(key:string)=>{
    return await redisClient.get(key);
}

}