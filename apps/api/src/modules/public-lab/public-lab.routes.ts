import type { FastifyInstance } from "fastify";

type ExecuteBody = { method: string; path: string; payload?: unknown };

export async function publicLabRoutes(app: FastifyInstance) {
  app.get("/public-lab/catalog", async () => ({
    success: true,
    message: "Public API learning catalog",
    data: { lanes: ["public", "authentication", "ecommerce", "todos", "social", "files", "http"], framework: "fastify" },
  }));

  app.post<{ Body: ExecuteBody }>("/public-lab/execute", {
    schema: { body: { type: "object", required: ["method", "path"], additionalProperties: false, properties: { method: { type: "string", enum: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] }, path: { type: "string", minLength: 1, maxLength: 180 }, payload: {} } } },
  }, async (request) => ({ success: true, message: `${request.body.method} simulation completed`, data: { path: request.body.path, payload: request.body.payload ?? null, requestId: request.id, processedBy: "fastify" } }));

  app.post("/public-lab/images", async (request, reply) => {
    const image = await request.file({ limits: { fileSize: 5_000_000, files: 1 } });
    if (!image || !image.mimetype.startsWith("image/")) return reply.code(415).send({ success: false, message: "An image file is required" });
    const bytes = await image.toBuffer();
    return reply.code(201).send({ success: true, message: "Image accepted", data: { id: `img_${request.id}`, filename: image.filename, mimetype: image.mimetype, size: bytes.length } });
  });
}
