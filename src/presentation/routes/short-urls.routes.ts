import { FastifyInstance } from "fastify";
import { PrismaClient } from "@prisma/client";
import z from "zod";
import { makeShortUrlsController } from "../../main/composition/short-urls.composition";

export const shortUrlsRoutes = (app: FastifyInstance, prisma: PrismaClient) => {
  const shortUrlsController = makeShortUrlsController(prisma);

  app.post(
    "/short-urls",
    {
      schema: {
        body: z.object({ originalUrl: z.url() }),
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
