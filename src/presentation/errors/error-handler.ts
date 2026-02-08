import { FastifyReply, FastifyRequest } from "fastify";
import { NotFoundError } from "../../domain/errors/not-found.error";
import { DatabaseError } from "../../domain/errors/database.error";

export function errorHandler(
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  request.log.error(error);

  if (error instanceof NotFoundError) {
    reply.status(404).send({
      statusCode: 404,
      error: "Not Found",
      message: error.message,
    });
    return;
  }

  if (error instanceof DatabaseError) {
    reply.status(500).send({
      statusCode: 500,
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "production"
          ? "An internal error occurred."
          : error.message,
    });
    return;
  }

  const statusCode = "statusCode" in error ? (error.statusCode as number) : 500;
  reply.status(statusCode).send({
    statusCode,
    error: error.name || "Internal Server Error",
    message: error.message || "An unexpected error occurred.",
  });
}
