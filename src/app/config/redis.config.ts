import { createClient } from "redis";
import config from ".";

export const redisClient = createClient({
  username: config.REDIS.REDIS_USERNAME,
  password: config.REDIS.REDIS_PASSWORD,
  socket: {
    host: config.REDIS.REDIS_HOST,
    port: Number(config.REDIS.REDIS_PORT),
  },
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Redis Connected");
  }
};
