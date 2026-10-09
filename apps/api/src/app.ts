import Fastify from "fastify";
import cors from "@fastify/cors";
import { courseRoutes } from "./modules/courses/course.routes.js";
import { simulatorRoutes } from "./modules/simulator/simulator.routes.js";
import { registerErrorHandler } from "./plugins/error-handler.js";
import { aiRoutes } from "./modules/ai/ai.routes.js";

export function buildApp() {
  const app = Fastify({ logger: { level: process.env.LOG_LEVEL ?? "info" }, requestIdHeader: "x-request-id" });
  app.register(cors, { origin: process.env.CORS_ORIGIN ?? "http://localhost:3000" });
  app.register(registerErrorHandler);
  app.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));
  app.register(courseRoutes, { prefix: "/api/v1" });
  app.register(simulatorRoutes, { prefix: "/api/v1" });
  app.register(aiRoutes, { prefix: "/api/v1" });
  return app;
}
