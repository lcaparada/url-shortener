import { GetOriginalUrlByShortCodeUseCase } from "../get-original-url-by-short-code.use-case";
import { ShortUrlCacheInterface } from "../../../../domain/cache/short-url-cache.interface";
import { ShortUrlRepositoryInterface } from "../../../../domain/repositories/short-url.repository.interface";

function makeRepositoryMock(): jest.Mocked<ShortUrlRepositoryInterface> {
  return {
    create: jest.fn(),
    getOriginalUrlByShortCode: jest.fn(),
    incrementClicks: jest.fn().mockResolvedValue(undefined),
  };
}

function makeCacheMock(): jest.Mocked<ShortUrlCacheInterface> {
  return {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
  };
}

describe("GetOriginalUrlByShortCodeUseCase", () => {
  let repository: jest.Mocked<ShortUrlRepositoryInterface>;
  let cache: jest.Mocked<ShortUrlCacheInterface>;
  let useCase: GetOriginalUrlByShortCodeUseCase;

  beforeEach(() => {
    repository = makeRepositoryMock();
    cache = makeCacheMock();
    useCase = new GetOriginalUrlByShortCodeUseCase(repository, cache);
  });

  it("should return originalUrl from repo, set cache and call incrementClicks on cache miss", async () => {
    const shortCode = "abc123";
    const originalUrl = "https://example.com/long-page";
    repository.getOriginalUrlByShortCode.mockResolvedValue(originalUrl);

    const result = await useCase.execute(shortCode);

    expect(cache.get).toHaveBeenCalledWith(shortCode);
    expect(repository.getOriginalUrlByShortCode).toHaveBeenCalledWith(shortCode);
    expect(cache.set).toHaveBeenCalledWith(shortCode, originalUrl);
    expect(repository.incrementClicks).toHaveBeenCalledWith(shortCode);
    expect(result).toBe(originalUrl);
  });

  it("should return from cache and call only incrementClicks on cache hit", async () => {
    const shortCode = "abc123";
    const originalUrl = "https://example.com/cached";
    cache.get.mockResolvedValue(originalUrl);

    const result = await useCase.execute(shortCode);

    expect(cache.get).toHaveBeenCalledWith(shortCode);
    expect(repository.getOriginalUrlByShortCode).not.toHaveBeenCalled();
    expect(cache.set).not.toHaveBeenCalled();
    expect(repository.incrementClicks).toHaveBeenCalledWith(shortCode);
    expect(result).toBe(originalUrl);
  });

  it("should rethrow error when getOriginalUrlByShortCode throws", async () => {
    const error = new Error("Original URL not found");
    repository.getOriginalUrlByShortCode.mockRejectedValue(error);

    await expect(useCase.execute("nonexistent")).rejects.toThrow(
      "Original URL not found",
    );
    expect(repository.incrementClicks).not.toHaveBeenCalled();
  });

  it("should rethrow error when incrementClicks throws", async () => {
    repository.getOriginalUrlByShortCode.mockResolvedValue("https://ok.com");
    repository.incrementClicks.mockRejectedValue(new Error("Update failed"));

    await expect(useCase.execute("code")).rejects.toThrow("Update failed");
  });
});
