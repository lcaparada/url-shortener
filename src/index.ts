import fastify from "fastify";
import dotenv from "dotenv";
import { prisma } from "./infra/database/prisma";
import { registerRoutes } from "./presentation/routes";
import { errorHandler } from "./presentation/errors/error-handler";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import rateLimit from "@fastify/rate-limit";

dotenv.config();

const bootstrap = () => {
  const app = fastify({
    logger: {
      transport: {
        target: "pino-pretty",
        options: {
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      },
    },
  }).withTypeProvider<ZodTypeProvider>();
  app.log.info("Fastify instance created");
  app.setSerializerCompiler(serializerCompiler);
  app.setValidatorCompiler(validatorCompiler);
  app.log.info("Serializer and validator compiler set");
  app.register(swagger, {
    openapi: {
      info: {
        title: "URL Shortener API",
        description: "URL Shortener API",
        version: "1.0.0",
      },
    },
    transform: jsonSchemaTransform,
  });

  app.log.info("Swagger registered");

  app.register(swaggerUi, {
    routePrefix: "/docs",
  });
  app.log.info("Swagger UI registered");

  app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });
  app.log.info("Rate limit registered");

  app.setErrorHandler(errorHandler);

  registerRoutes(app, prisma);
  app.log.info("Routes registered");
  return app;
};

const start = async () => {
  const app = bootstrap();
  const port = parseInt(process.env.PORT ?? "3000", 10);
  try {
    const address = await app.listen({ port, host: "0.0.0.0" });
    app.log.info(`Server is running at ${address}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
