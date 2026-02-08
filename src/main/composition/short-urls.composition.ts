import { PrismaClient } from "@prisma/client";
import { ShortUrlsController } from "../../presentation/controllers/short-urls.controller";
import { CreateShortUrlUseCase } from "../../application/useCases/shortUrls/create-short-url.use-case";
import { GetOriginalUrlByShortCodeUseCase } from "../../application/useCases/shortUrls/get-original-url-by-short-code.use-case";
import { ShortUrlsRepository } from "../../infra/repositories/short-urls.repository";
import { ShortCodeGenerator } from "../../infra/generators/short-code.generator";

export function makeShortUrlsController(
  prisma: PrismaClient,
): ShortUrlsController {
  const shortUrlRepository = new ShortUrlsRepository(prisma);
  return new ShortUrlsController(
    new CreateShortUrlUseCase(shortUrlRepository, new ShortCodeGenerator()),
    new GetOriginalUrlByShortCodeUseCase(shortUrlRepository),
  );
}
