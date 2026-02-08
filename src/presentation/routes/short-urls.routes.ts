import { FastifyInstance } from "fastify";
import { ShortUrlsController } from "../controllers/short-urls.controller";
import { CreateShortUrlUseCase } from "../../application/useCases/shortUrls/create-short-url.use-case";
import { ShortUrlsRepository } from "../../infra/repositories/short-urls.repository";
import { ShortCodeGenerator } from "../../infra/generators/short-code.generator";
import { GetOriginalUrlByShortCodeUseCase } from "../../application/useCases/shortUrls/get-original-url-by-short-code.use-case";
import { PrismaClient } from "@prisma/client";
import z from "zod";

export const shortUrlsRoutes = (app: FastifyInstance, prisma: PrismaClient) => {
  const shortUrlsController = new ShortUrlsController(
    new CreateShortUrlUseCase(
      new ShortUrlsRepository(prisma),
      new ShortCodeGenerator(),
    ),
    new GetOriginalUrlByShortCodeUseCase(new ShortUrlsRepository(prisma)),
  );

  app.post(
    "/short-urls",
    {
      schema: {
        body: z.object({ originalUrl: z.string() }),
        tags: ["short-urls"],
        summary: "Create short URL",
        responses: {
          201: {
            description: "Short URL created",
            type: "string",
          },
          400: {
            description: "Bad request",
            type: "string",
          },
          500: {
            description: "Internal server error",
            type: "string",
          },
        },
      },
    },
    shortUrlsController.create.bind(shortUrlsController),
  );

  app.get(
    "/:shortCode",
    {
      schema: {
        params: z.object({ shortCode: z.string() }),
        tags: ["short-urls"],
        summary: "Get original URL by short code",
        responses: {
          200: {
            description: "Original URL",
            type: "string",
          },
          404: {
            description: "Original URL not found",
            type: "string",
          },
        },
      },
    },
    shortUrlsController.getOriginalUrlByShortCode.bind(shortUrlsController),
  );
};
