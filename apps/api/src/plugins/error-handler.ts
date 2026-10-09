import type { FastifyInstance } from "fastify";

export async function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error, requestId: request.id }, "request failed");
    const statusCode = error.statusCode && error.statusCode >= 400 ? error.statusCode : 500;
    reply.code(statusCode).send({ error: statusCode === 500 ? "INTERNAL_ERROR" : error.code, message: statusCode === 500 ? "Something went wrong" : error.message, requestId: request.id });
  });
}
