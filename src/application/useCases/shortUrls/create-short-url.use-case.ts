import { ShortUrlEntity } from "../../../domain/entities/short-urls.entity";
import { ShortCodeGeneratorInterface } from "../../../domain/generators/short-code-generator.interface";
import { ShortUrlRepositoryInterface } from "../../../domain/repositories/short-url.repository.interface";

export class CreateShortUrlUseCase {
  constructor(
    private readonly shortUrlRepository: ShortUrlRepositoryInterface,
    private readonly shortCodeGenerator: ShortCodeGeneratorInterface,
  ) {}

  async execute(originalUrl: string): Promise<string> {
    const shortCode = this.shortCodeGenerator.generate();
    const shortUrl = new ShortUrlEntity({
      originalUrl,
      shortCode,
      createdAt: new Date(),
      clicks: 0,
    });
    await this.shortUrlRepository.create(shortUrl);
    return shortUrl.shortCode;
  }
}
