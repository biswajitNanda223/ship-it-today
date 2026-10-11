"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { JointArchitecture } from "../JointArchitecture";
import { LearnNav } from "../LearnNav";

type Transport = "rest" | "sse" | "websocket" | "job";

const layers = [
  {
    name: "API Edge",
    detail: "Identity, quotas, idempotency, schema validation",
  },
  {
    name: "AI Gateway",
    detail: "Provider routing, fallbacks, budgets, semantic cache",
  },
  {
    name: "Safety",
    detail: "PII redaction, moderation, injection defense",
  },
  {
    name: "Context Engine",
    detail: "Hybrid retrieval, reranking, citations",
  },
  {
    name: "Inference",
    detail: "Streaming, tool calls, structured output, cancellation",
  },
  {
    name: "Evaluation",
    detail: "Traces, quality, latency, cost, and drift",
  },
];

const transports: Record<
  Transport,
  {
    label: string;
    route: string;
    contract: string;
    use: string;
    code: string;
    events: string[];
  }
> = {
  rest: {
    label: "REST JSON",
    route: "POST /api/v1/ai/inference",
    contract: "application/json",
    use: "Short, complete responses and structured output.",
    code: `const result = await fetch("/api/v1/ai/inference", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    prompt,
    model: "quality",
    useRag: true,
  }),
});

const response = await result.json();`,
    events: ["request.accepted", "retrieval.completed", "inference.completed", "response.json"],
  },
  sse: {
    label: "SSE STREAM",
    route: "POST /api/v1/ai/stream",
    contract: "text/event-stream",
    use: "Gemini-style server-to-client token and tool events.",
    code: `const response = await fetch("/api/v1/ai/stream", {
  method: "POST",
  body: JSON.stringify({ prompt }),
});

for await (const event of parseSse(response.body)) {
  if (event.type === "content.delta") append(event.text);
  if (event.type === "tool.call") showTool(event);
}`,
    events: [
      "response.created",
      "content.delta",
      "tool.call",
      "tool.result",
      "content.delta",
      "response.completed",
    ],
  },
  websocket: {
    label: "WEBSOCKET",
    route: "WS /api/v1/ai/realtime",
    contract: "bidirectional events",
    use: "Voice, interruption, live agents, and continuous sessions.",
    code: `const socket = new WebSocket(
  "wss://api.example.com/api/v1/ai/realtime",
);

socket.onopen = () => socket.send(JSON.stringify({
  type: "input.text",
  text: prompt,
}));

socket.onmessage = ({ data }) => applyEvent(JSON.parse(data));`,
    events: [
      "session.created",
      "input.accepted",
      "response.delta",
      "audio.delta",
      "response.completed",
    ],
  },
  job: {
    label: "BACKGROUND JOB",
    route: "POST /api/v1/ai/jobs",
    contract: "202 + status resource",
    use: "Long generations, batch work, retries, and cancellation.",
    code: `const { data: job } = await createJob({ prompt });

while (!isTerminal(job.status)) {
  await wait(backoff.next());
  job = await getJob(job.id);
}

// DELETE /ai/jobs/:id cancels pending work.`,
    events: [
      "job.queued",
      "worker.claimed",
      "retrieval.completed",
      "generation.progress",
      "artifact.persisted",
      "job.completed",
    ],
  },
};

const patterns = [
  ["AI Gateway", "Own provider routing, budget, retries, and fallback policy."],
  ["RAG Pipeline", "Retrieve, rerank, bound context, and verify citations."],
  ["Tool Agent", "Allowlist tools while the application owns state and effects."],
  ["Semantic Cache", "Reuse safe equivalent responses with explicit freshness."],
  ["Fallback Chain", "Degrade to fast models, search, or deterministic output."],
  ["Async Job", "Use durable queues for long generations and retries."],
];

export default function GenAiPage() {
  const [activeLayer, setActiveLayer] = useState(1);
  const [quality, setQuality] = useState(64);
  const [rag, setRag] = useState(true);
  const [transport, setTransport] = useState<Transport>("sse");
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [pattern, setPattern] = useState(0);
  const timers = useRef<number[]>([]);

  const selectedTransport = transports[transport];
  const metrics = useMemo(
    () => ({
      latency: Math.round(240 + quality * 8 + (rag ? 90 : 0)),
      cost: (0.0012 + quality * 0.00008 + (rag ? 0.0004 : 0)).toFixed(4),
      tokens: Math.round(220 + quality * 13 + (rag ? 900 : 0)),
      quality: Math.min(98, 55 + Math.round(quality * 0.36) + (rag ? 12 : 0)),
    }),
    [quality, rag],
  );

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  function runDemo() {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    setRunning(true);
    setStage(0);
    setEventCount(0);
    selectedTransport.events.forEach((_, index) => {
      const timer = window.setTimeout(
        () => {
          setStage(Math.min(index, layers.length - 1));
          setEventCount(index + 1);
          if (index === selectedTransport.events.length - 1) setRunning(false);
        },
        430 * (index + 1),
      );
      timers.current.push(timer);
    });
  }

  return (
    <main className="course-page ai-page">
      <LearnNav />
      <header className="course-hero shell ai-hero ai-hero-modern">
        <span className="course-index">GENAI / BACKEND SYSTEMS</span>
        <h1>
          Ship AI systems.
          <br />
          <em>Not model demos.</em>
        </h1>
        <p>
          Design production GenAI backends with REST, Gemini-style SSE, bidirectional WebSockets,
          background jobs, RAG, tools, safety, evaluation, and cost controls.
        </p>
        <div className="ai-transport-pills">
          <span>REST</span>
          <span>SSE</span>
          <span>WEBSOCKET</span>
          <span>ASYNC JOBS</span>
        </div>
      </header>

      <section className="ai-architecture shell">
        <header>
          <div>
            <span className="kicker">PRODUCTION REQUEST PATH</span>
            <h2>Every layer stays visible.</h2>
          </div>
          <p>
            The application owns reliability, context, tools, and measurement. The model remains a
            replaceable dependency.
          </p>
        </header>
        <JointArchitecture
          nodes={layers}
          kind="sequence"
          activeFrame={running ? stage : undefined}
        />
        <div className="ai-layer-inspector">
          {layers.map((layer, index) => (
            <button
              className={activeLayer === index ? "active" : ""}
              key={layer.name}
              onClick={() => setActiveLayer(index)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <b>{layer.name}</b>
              <small>{layer.detail}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="ai-api-studio">
        <div className="shell">
          <div className="section-head light">
            <div>
              <span className="kicker">GENAI TRANSPORT LAB</span>
              <h2>
                Choose the protocol.
                <br />
                <em>Trace every event.</em>
              </h2>
            </div>
            <p>
              Compare request contracts, streaming behavior, background work, and the operational
              controls each transport requires.
            </p>
          </div>

          <div className="ai-transport-tabs">
            {(Object.keys(transports) as Transport[]).map((item) => (
              <button
                className={transport === item ? "active" : ""}
                key={item}
                onClick={() => {
                  setTransport(item);
                  setEventCount(0);
                  setRunning(false);
                }}
              >
                <span>{transports[item].label}</span>
                <small>{transports[item].contract}</small>
              </button>
            ))}
          </div>

          <div className="ai-api-workbench">
            <aside className="ai-route-contract">
              <span>ENDPOINT</span>
              <code>{selectedTransport.route}</code>
              <p>{selectedTransport.use}</p>
              <label>
                <span>
                  Model quality <b>{quality}%</b>
                </span>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(event) => setQuality(Number(event.target.value))}
                />
              </label>
              <button
                className={rag ? "ai-toggle on" : "ai-toggle"}
                onClick={() => setRag((value) => !value)}
              >
                <span>
                  <b>RAG + citations</b>
                  <small>Hybrid search and reranking</small>
                </span>
                <i>
                  <u />
                </i>
              </button>
              <div className="ai-metric-grid">
                <div>
                  <small>P95</small>
                  <b>{metrics.latency}ms</b>
                </div>
                <div>
                  <small>COST</small>
                  <b>${metrics.cost}</b>
                </div>
                <div>
                  <small>TOKENS</small>
                  <b>{metrics.tokens}</b>
                </div>
                <div>
                  <small>QUALITY</small>
                  <b>{metrics.quality}</b>
                </div>
              </div>
            </aside>

            <article className="ai-code-contract">
              <header>
                <span>CLIENT IMPLEMENTATION</span>
                <b>TypeScript</b>
              </header>
              <pre>{selectedTransport.code}</pre>
            </article>

            <aside className="ai-event-console">
              <header>
                <span>LIVE EVENTS</span>
                <i>{running ? "STREAMING" : "READY"}</i>
              </header>
              <div>
                {selectedTransport.events.map((item, index) => (
                  <article
                    className={index < eventCount ? "received" : ""}
                    key={`${transport}-${item}-${index}`}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <b>{item}</b>
                    <small>{index < eventCount ? "received" : "waiting"}</small>
                  </article>
                ))}
              </div>
              <button onClick={runDemo} disabled={running}>
                {running ? "Receiving events…" : `Run ${selectedTransport.label} demo →`}
              </button>
            </aside>
          </div>
        </div>
      </section>

      <section className="ai-patterns shell">
        <div className="section-head">
          <div>
            <span className="kicker">BACKEND PATTERN CATALOG</span>
            <h2>
              Six patterns for
              <br />
              <em>production AI.</em>
            </h2>
          </div>
          <p>
            Apply the patterns where they solve a measured reliability, quality, or cost problem.
          </p>
        </div>
        <div className="ai-pattern-layout">
          <div>
            {patterns.map((item, index) => (
              <button
                className={pattern === index ? "active" : ""}
                key={item[0]}
                onClick={() => setPattern(index)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <b>{item[0]}</b>
                <i>→</i>
              </button>
            ))}
          </div>
          <article key={pattern}>
            <small>GENAI BACKEND PATTERN</small>
            <h3>{patterns[pattern][0]}</h3>
            <p>{patterns[pattern][1]}</p>
            <div className="ai-pattern-flow">
              <span>CLIENT</span>
              <i>validated request →</i>
              <b>{patterns[pattern][0].toUpperCase()}</b>
              <i>bounded call →</i>
              <span>MODEL / TOOL</span>
            </div>
            <ul>
              <li>Explicit timeout and cancellation</li>
              <li>Trace every decision and model call</li>
              <li>Budget tokens and concurrency</li>
              <li>Test quality with versioned eval sets</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="ai-checklist shell">
        <h2>Production readiness</h2>
        <div>
          {[
            "Threat model",
            "PII boundary",
            "Prompt versioning",
            "Eval dataset",
            "Model fallback",
            "Vector index",
            "Citation checks",
            "Tool allowlist",
            "Rate limits",
            "Token budget",
            "Semantic cache",
            "Trace sampling",
            "Cost alerts",
            "Human escalation",
            "Rollback plan",
          ].map((item, index) => (
            <article key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <b>{item}</b>
              <i>✓</i>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
