import redisClient from "./redis.js";
export default class RedisHelper{
    static deleteEntry=async(key:string)=>{
    redisClient.del(key);
}

}