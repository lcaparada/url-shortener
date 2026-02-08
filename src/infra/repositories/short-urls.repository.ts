import { PrismaClient } from "@prisma/client";
import { ShortUrlRepositoryInterface } from "../../domain/repositories/short-url.repository.interface";
import { ShortUrlEntity } from "../../domain/entities/short-urls.entity";
import { NotFoundError } from "../../domain/errors/not-found.error";
import { DatabaseError } from "../../domain/errors/database.error";

export class ShortUrlsRepository implements ShortUrlRepositoryInterface {
  constructor(private readonly prisma: PrismaClient) {}

  async create(shortUrl: ShortUrlEntity): Promise<void> {
    try {
      await this.prisma.shortUrl.create({
        data: {
          id: shortUrl.id,
          originalUrl: shortUrl.originalUrl,
          shortCode: shortUrl.shortCode,
          createdAt: shortUrl.createdAt,
          clicks: shortUrl.clicks,
        },
      });
    } catch (error) {
      throw new DatabaseError(
        `Failed to create short URL: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async getOriginalUrlByShortCode(shortCode: string): Promise<string> {
    try {
      const url = await this.prisma.shortUrl.findUnique({
        where: { shortCode },
      });
      if (!url) {
        throw new NotFoundError("Original URL not found");
      }
      return url.originalUrl;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(
        `Failed to get original URL by short code: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async incrementClicks(shortCode: string): Promise<void> {
    try {
      await this.prisma.shortUrl.update({
        where: { shortCode },
        data: { clicks: { increment: 1 } },
      });
    } catch (error) {
      throw new DatabaseError(
        `Failed to increment clicks: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
