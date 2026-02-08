import { ShortUrlCacheInterface } from "../../domain/cache/short-url-cache.interface";
import { redis } from "./redis";

const KEY_PREFIX = "shorturl:";
const TTL_SECONDS = 3600;

export class ShortUrlRedisCache implements ShortUrlCacheInterface {
  private key(shortCode: string): string {
    return `${KEY_PREFIX}${shortCode}`;
  }

  async get(shortCode: string): Promise<string | null> {
    try {
      const value = await redis.get(this.key(shortCode));
      return value;
    } catch {
      return null;
    }
  }

  async set(shortCode: string, originalUrl: string): Promise<void> {
    try {
      await redis.set(this.key(shortCode), originalUrl, "EX", TTL_SECONDS);
    } catch {}
  }
}
