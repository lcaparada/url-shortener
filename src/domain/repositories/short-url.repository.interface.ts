import { ShortUrlEntity } from "../entities/short-urls.entity";

export interface ShortUrlRepositoryInterface {
  create(shortUrl: ShortUrlEntity): Promise<void>;
  getOriginalUrlByShortCode(shortCode: string): Promise<string>;
  incrementClicks(shortCode: string): Promise<void>;
}
