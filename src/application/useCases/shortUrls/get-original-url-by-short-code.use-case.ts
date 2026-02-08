import { ShortUrlCacheInterface } from "../../../domain/cache/short-url-cache.interface";
import { ShortUrlRepositoryInterface } from "../../../domain/repositories/short-url.repository.interface";

export class GetOriginalUrlByShortCodeUseCase {
  constructor(
    private readonly shortUrlRepository: ShortUrlRepositoryInterface,
    private readonly shortUrlCache: ShortUrlCacheInterface,
  ) {}

  async execute(shortCode: string): Promise<string> {
    const cached = await this.shortUrlCache.get(shortCode);
    if (cached) {
      await this.shortUrlRepository.incrementClicks(shortCode);
      return cached;
    }

    const originalUrl =
      await this.shortUrlRepository.getOriginalUrlByShortCode(shortCode);
    await this.shortUrlCache.set(shortCode, originalUrl);
    await this.shortUrlRepository.incrementClicks(shortCode);
    return originalUrl;
  }
}
