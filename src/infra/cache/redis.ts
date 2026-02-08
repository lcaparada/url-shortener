import "dotenv/config";
import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis };

function createRedisClient(): Redis {
  const url = process.env.REDIS_URL ?? "redis://localhost:6379";
  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 100, 3000);
      return delay;
    },
    lazyConnect: true,
  });

  client.on("error", (err) => {
    console.error("[Redis] error:", err.message);
  });

  client.on("connect", () => {
    console.log("[Redis] connected");
  });

  return client;
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
