import {Redis} from "ioredis"
import { getRedisUrl } from "../utils/envValuesAccessInterface.js";
const redisConnectionUrl=getRedisUrl();
let redisClient:Redis;
if(!redisConnectionUrl){
    redisClient=new Redis();
}
else{
    redisClient=new Redis(redisConnectionUrl);
}

export default redisClient;