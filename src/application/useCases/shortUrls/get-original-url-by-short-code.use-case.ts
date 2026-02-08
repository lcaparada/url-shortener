import { ShortUrlRepositoryInterface } from "../../../domain/repositories/short-url.repository.interface";

export class GetOriginalUrlByShortCodeUseCase {
  constructor(
    private readonly shortUrlRepository: ShortUrlRepositoryInterface,
  ) {}

  async execute(shortCode: string): Promise<string> {
    const originalUrl =
      await this.shortUrlRepository.getOriginalUrlByShortCode(shortCode);
    await this.shortUrlRepository.incrementClicks(shortCode);
    return originalUrl;
  }
}
