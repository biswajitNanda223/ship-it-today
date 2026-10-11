import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";

type InferenceBody = {
  prompt: string;
  model?: "fast" | "quality";
  useRag?: boolean;
  maxTokens?: number;
};

type Job = {
  id: string;
  status: "queued" | "running" | "completed" | "cancelled";
  progress: number;
  prompt: string;
  result?: string;
};

const jobs = new Map<string, Job>();

const inferenceBodySchema = {
  type: "object",
  required: ["prompt"],
  properties: {
    prompt: { type: "string", minLength: 1, maxLength: 4000 },
    model: { type: "string", enum: ["fast", "quality"] },
    useRag: { type: "boolean" },
    maxTokens: { type: "integer", minimum: 16, maximum: 4096 },
  },
} as const;

function event(type: string, data: Record<string, unknown>) {
  return `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function aiRoutes(app: FastifyInstance) {
  app.post<{ Body: InferenceBody }>(
    "/ai/inference",
    { schema: { body: inferenceBodySchema } },
    async (request) => {
      const { prompt, model = "fast", useRag = true, maxTokens = 512 } = request.body;
      const inputTokens = Math.ceil(prompt.length / 4);
      const retrievedChunks = useRag ? 4 : 0;

      return {
        data: {
          requestId: request.id,
          route: model,
          stream: false,
          inputTokens,
          maxTokens,
          retrievedChunks,
          estimatedLatencyMs: (model === "fast" ? 420 : 980) + (useRag ? 85 : 0),
          estimatedCostUsd: Number(((inputTokens + maxTokens) * 0.000002).toFixed(5)),
          safety: "passed",
        },
      };
    },
  );

  app.post<{ Body: InferenceBody }>(
    "/ai/stream",
    { schema: { body: inferenceBodySchema } },
    async (request, reply) => {
      reply.hijack();
      reply.raw.writeHead(200, {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-cache, no-transform",
        connection: "keep-alive",
        "x-accel-buffering": "no",
      });

      const stream = [
        ["response.created", { requestId: request.id, model: "gemini-style" }],
        ["content.delta", { text: "A scalable GenAI backend " }],
        ["content.delta", { text: "streams tokens through SSE, " }],
        ["tool.call", { name: "search_architecture", arguments: { limit: 4 } }],
        ["tool.result", { name: "search_architecture", documents: 4 }],
        ["content.delta", { text: "while the application owns tools and state." }],
        ["response.completed", { finishReason: "stop", usage: { input: 18, output: 31 } }],
      ] as const;
      let index = 0;
      const timer = setInterval(() => {
        const item = stream[index];
        if (!item) {
          clearInterval(timer);
          reply.raw.end();
          return;
        }
        reply.raw.write(event(item[0], item[1]));
        index += 1;
      }, 220);
      request.raw.on("close", () => clearInterval(timer));
    },
  );

  app.get("/ai/realtime", { websocket: true }, (socket) => {
    socket.send(JSON.stringify({ type: "session.created", transport: "websocket" }));
    socket.on("message", (message) => {
      const input = message.toString();
      socket.send(JSON.stringify({ type: "input.accepted", bytes: input.length }));
      socket.send(
        JSON.stringify({
          type: "response.delta",
          text: "Bidirectional token and audio events belong on WebSocket.",
        }),
      );
      socket.send(JSON.stringify({ type: "response.completed" }));
    });
  });

  app.post<{ Body: Pick<InferenceBody, "prompt"> }>(
    "/ai/jobs",
    {
      schema: {
        body: {
          type: "object",
          required: ["prompt"],
          properties: {
            prompt: { type: "string", minLength: 1, maxLength: 4000 },
          },
        },
      },
    },
    async (request, reply) => {
      const id = `job_${randomUUID().slice(0, 8)}`;
      const job: Job = {
        id,
        status: "queued",
        progress: 0,
        prompt: request.body.prompt,
      };
      jobs.set(id, job);

      setTimeout(() => {
        if (job.status === "cancelled") return;
        Object.assign(job, { status: "running", progress: 45 });
      }, 300);
      setTimeout(() => {
        if (job.status === "cancelled") return;
        Object.assign(job, {
          status: "completed",
          progress: 100,
          result: "Background generation completed and stored durably.",
        });
      }, 1200);
      setTimeout(() => jobs.delete(id), 60_000).unref();

      return reply.code(202).send({
        data: job,
        links: { status: `/api/v1/ai/jobs/${id}` },
      });
    },
  );

  app.get<{ Params: { jobId: string } }>("/ai/jobs/:jobId", async (request, reply) => {
    const job = jobs.get(request.params.jobId);
    if (!job) {
      return reply.code(404).send({
        error: { code: "JOB_NOT_FOUND", message: "Generation job not found" },
      });
    }
    return { data: job };
  });

  app.delete<{ Params: { jobId: string } }>("/ai/jobs/:jobId", async (request, reply) => {
    const job = jobs.get(request.params.jobId);
    if (!job) return reply.code(204).send();
    job.status = "cancelled";
    job.progress = 0;
    return reply.code(202).send({ data: job });
  });
}
