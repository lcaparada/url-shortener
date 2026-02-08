import { PrismaClient } from "@prisma/client";
import { FastifyInstance } from "fastify";
import { shortUrlsRoutes } from "./short-urls.routes";

export const registerRoutes = (app: FastifyInstance, prisma: PrismaClient) => {
  app.register(() => shortUrlsRoutes(app, prisma), { prefix: "v1/" });
};
