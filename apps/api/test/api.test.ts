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
  const response = await app.inject({ method: "POST", url: "/api/v1/simulations/capacity", payload: { requestsPerSecond: 4000, replicas: 4, cacheEnabled: true } });
  assert.equal(response.statusCode, 200);
  assert.equal(response.json().data.status, "healthy");
  await app.close();
});
