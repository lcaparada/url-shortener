import { ShortUrlRedisCache } from "../short-url-cache.redis";

const mockGet = jest.fn();
const mockSet = jest.fn();

jest.mock("../redis", () => ({
  redis: {
    get: (...args: unknown[]) => mockGet(...args),
    set: (...args: unknown[]) => mockSet(...args),
  },
}));

describe("ShortUrlRedisCache", () => {
  let cache: ShortUrlRedisCache;

  beforeEach(() => {
    jest.clearAllMocks();
    cache = new ShortUrlRedisCache();
  });

  describe("get", () => {
    it("should call redis.get with prefixed key and return value", async () => {
      const shortCode = "abc123";
      const originalUrl = "https://example.com/page";
      mockGet.mockResolvedValue(originalUrl);

      const result = await cache.get(shortCode);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith("shorturl:abc123");
      expect(result).toBe(originalUrl);
    });

    it("should return null when key does not exist", async () => {
      mockGet.mockResolvedValue(null);

      const result = await cache.get("nonexistent");

      expect(result).toBeNull();
    });

    it("should return null when redis.get throws", async () => {
      mockGet.mockRejectedValue(new Error("Connection refused"));

      const result = await cache.get("any");

      expect(result).toBeNull();
    });
  });

  describe("set", () => {
    it("should call redis.set with prefixed key, value and TTL", async () => {
      const shortCode = "xyz789";
      const originalUrl = "https://foo.com/path";
      mockSet.mockResolvedValue("OK");

      await cache.set(shortCode, originalUrl);

      expect(mockSet).toHaveBeenCalledTimes(1);
      expect(mockSet).toHaveBeenCalledWith(
        "shorturl:xyz789",
        originalUrl,
        "EX",
        3600,
      );
    });

    it("should not throw when redis.set throws", async () => {
      mockSet.mockRejectedValue(new Error("Redis error"));

      await expect(cache.set("code", "https://url.com")).resolves.toBeUndefined();
    });
  });
});
