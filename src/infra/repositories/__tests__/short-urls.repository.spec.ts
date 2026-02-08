import { PrismaClient } from "@prisma/client";
import { ShortUrlsRepository } from "../short-urls.repository";
import { ShortUrlEntity } from "../../../domain/entities/short-urls.entity";
import { DatabaseError } from "../../../domain/errors/database.error";
import { NotFoundError } from "../../../domain/errors/not-found.error";

type ShortUrlRow = {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: Date;
  clicks: number;
};

function makeEntity(
  overrides?: Partial<{
    id: string;
    originalUrl: string;
    shortCode: string;
    createdAt: Date;
    clicks: number;
  }>,
) {
  const props = {
    originalUrl: "https://example.com/page",
    shortCode: "abc123",
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    clicks: 0,
    ...overrides,
  };
  const id = overrides?.id ?? "entity-id-1";
  return new ShortUrlEntity(props, id);
}

function createPrismaMock() {
  return {
    shortUrl: {
      create: jest.fn().mockResolvedValue(undefined),
      findUnique: jest.fn() as jest.Mock<Promise<ShortUrlRow | null>>,
      update: jest.fn().mockResolvedValue(undefined),
    },
  };
}

describe("ShortUrlsRepository", () => {
  let prismaMock: ReturnType<typeof createPrismaMock>;
  let prisma: PrismaClient;

  beforeEach(() => {
    prismaMock = createPrismaMock();
    prisma = prismaMock as unknown as PrismaClient;
  });

  describe("create", () => {
    it("should call prisma.shortUrl.create with entity data", async () => {
      const entity = makeEntity({
        id: "id-1",
        originalUrl: "https://foo.com",
        shortCode: "xyz",
        createdAt: new Date("2025-06-01T12:00:00.000Z"),
        clicks: 0,
      });
      const repo = new ShortUrlsRepository(prisma);

      await repo.create(entity);

      expect(prismaMock.shortUrl.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.shortUrl.create).toHaveBeenCalledWith({
        data: {
          id: entity.id,
          originalUrl: entity.originalUrl,
          shortCode: entity.shortCode,
          createdAt: entity.createdAt,
          clicks: entity.clicks,
        },
      });
    });
  });

  describe("getOriginalUrlByShortCode", () => {
    it("should return originalUrl when shortUrl exists", async () => {
      const shortCode = "abc123";
      prismaMock.shortUrl.findUnique.mockResolvedValue({
        id: "id-1",
        originalUrl: "https://example.com/long",
        shortCode,
        createdAt: new Date(),
        clicks: 0,
      });
      const repo = new ShortUrlsRepository(prisma);

      const result = await repo.getOriginalUrlByShortCode(shortCode);

      expect(prismaMock.shortUrl.findUnique).toHaveBeenCalledWith({
        where: { shortCode },
      });
      expect(result).toBe("https://example.com/long");
    });

    it("should throw NotFoundError when shortUrl does not exist", async () => {
      prismaMock.shortUrl.findUnique.mockResolvedValue(null);
      const repo = new ShortUrlsRepository(prisma);
      expect.assertions(2);

      try {
        await repo.getOriginalUrlByShortCode("nonexistent");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect((error as Error).message).toBe("Original URL not found");
      }
    });
  });

  describe("incrementClicks", () => {
    it("should call prisma.shortUrl.update with increment 1", async () => {
      const shortCode = "abc123";
      const repo = new ShortUrlsRepository(prisma);

      await repo.incrementClicks(shortCode);

      expect(prismaMock.shortUrl.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.shortUrl.update).toHaveBeenCalledWith({
        where: { shortCode },
        data: { clicks: { increment: 1 } },
      });
    });
  });
});
