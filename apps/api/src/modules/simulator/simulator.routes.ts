import type { FastifyInstance } from "fastify";

type SimulationBody = { requestsPerSecond: number; replicas: number; cacheEnabled: boolean };

export async function simulatorRoutes(app: FastifyInstance) {
  app.post<{ Body: SimulationBody }>("/simulations/capacity", {
    schema: { body: { type: "object", required: ["requestsPerSecond", "replicas", "cacheEnabled"], properties: { requestsPerSecond: { type: "number", minimum: 1 }, replicas: { type: "integer", minimum: 1, maximum: 100 }, cacheEnabled: { type: "boolean" } } } },
  }, async request => {
    const { requestsPerSecond, replicas, cacheEnabled } = request.body;
    const capacity = replicas * 1450 * (cacheEnabled ? 2.3 : 1);
    const utilization = Math.min(99, Math.round((requestsPerSecond / capacity) * 100));
    const p95LatencyMs = Math.round(22 + Math.pow(requestsPerSecond / capacity, 2.4) * 210 + (cacheEnabled ? 0 : 48));
    return { data: { capacity: Math.round(capacity), utilization, p95LatencyMs, status: utilization < 82 ? "healthy" : "saturated" } };
  });
}
