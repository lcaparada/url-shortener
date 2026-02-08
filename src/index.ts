import fastify from "fastify";
import dotenv from "dotenv";
import { prisma } from "./infra/database/prisma";
import { registerRoutes } from "./presentation/routes";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

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

  registerRoutes(app, prisma);
  app.log.info("Routes registered");
  return app;
};

const start = async () => {
  const app = bootstrap();
  try {
    await app.listen({ port: parseInt(process.env.PORT ?? "3000") });
    app.log.info(`Server is running on port ${process.env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
