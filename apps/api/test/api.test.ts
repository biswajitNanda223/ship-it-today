import assert from "node:assert/strict";
import test from "node:test";
import { buildApp } from "../src/app.js";

test("health endpoint reports ready", async () => {
  const app = buildApp();
  const response = await app.inject({ method: "GET", url: "/health" });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().status, "ok");
  await app.close();
});

test("capacity simulator returns a prediction", async () => {
  const app = buildApp();
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/simulations/capacity",
    payload: { requestsPerSecond: 4000, replicas: 4, cacheEnabled: true },
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().data.status, "healthy");
  await app.close();
});

test("GenAI inference simulator returns routing metrics", async () => {
  const app = buildApp();
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/ai/inference",
    payload: { prompt: "Explain consistent hashing", model: "quality", useRag: true },
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().data.retrievedChunks, 4);
  assert.equal(response.json().data.route, "quality");
  await app.close();
});

test("GenAI background jobs return a status resource", async () => {
  const app = buildApp();
  const created = await app.inject({
    method: "POST",
    url: "/api/v1/ai/jobs",
    payload: { prompt: "Generate a migration plan" },
  });
  assert.equal(created.statusCode, 202);
  const jobId = created.json().data.id;
  const status = await app.inject({
    method: "GET",
    url: `/api/v1/ai/jobs/${jobId}`,
  });
  assert.equal(status.statusCode, 200);
  assert.equal(status.json().data.status, "queued");
  await app.close();
});

test("proximity search filters and ranks vector matches", async () => {
  const app = buildApp();
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/ai/search/proximity",
    payload: { query: "background work", limit: 2, maxDistance: 0.2 },
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().data.matches.length, 2);
  assert.ok(response.json().data.matches[0].score > response.json().data.matches[1].score);
  await app.close();
});

test("public API lab executes a typed request simulation", async () => {
  const app = buildApp();
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/public-lab/execute",
    payload: { method: "PATCH", path: "/todos/todo_42", payload: { completed: true } },
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().data.processedBy, "fastify");
  await app.close();
});
