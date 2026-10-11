import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Ship It Today learning world", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Ship It Today/);
  assert.match(html, /Design it.*Scale it.*Ship it/s);
  assert.match(html, /Go deeper\. Build the mental model\./);
  assert.match(html, /class="motion-spotlight"/);
  assert.doesNotMatch(html, /codex-preview|Building your site/);
});

test("server-renders the enhanced lesson experience", async () => {
  const response = await render("/learn/hld/design-framework");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /MENTAL MODEL/);
  assert.match(html, /YOU WILL DESIGN/);
  assert.match(html, /REVIEW STANDARD/);
  assert.match(html, /chapter-progress-rail/);
  assert.match(html, /COPY CODE|PRODUCTION EXAMPLE/);
});

test("server-renders bounded latency markers", async () => {
  const response = await render("/learn/apis");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /class="live-graph"/);
  assert.match(html, /class="graph-marker/);
  assert.match(html, /ms p95/);
  assert.doesNotMatch(html, /class="chart-dot"/);
});

test("server-renders the Python FastAPI OOD lab", async () => {
  const response = await render("/learn/ood/parking-lot");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Design a parking lot/);
  assert.match(html, /FASTAPI SURFACE/);
  assert.match(html, /Strategy/);
  assert.match(html, /LIVE CONTRACT SIMULATOR/);
  assert.match(html, /class="ood-blueprint/);
});
