"use client";

/* eslint-disable jsx-a11y/label-has-associated-control, @next/next/no-img-element */

import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { JointArchitecture } from "./JointArchitecture";
import { LearnNav } from "./LearnNav";
import type { ApiCategory, ApiEndpoint } from "./public-api-data";
import { publicApiCategories } from "./public-api-data";

const requestNodes = [
  { name: "Client", detail: "fetch / form-data" },
  { name: "Network Edge", detail: "TLS + WAF + CORS" },
  { name: "Router", detail: "schema + auth" },
  { name: "Use Case", detail: "business policy" },
  { name: "Repository", detail: "cache + database" },
  { name: "Envelope", detail: "status + data + trace" },
];

function routeName(path: string) { return path.replace(/:([A-Za-z]+)/g, "{$1}"); }

function codeFor(endpoint: ApiEndpoint, framework: "fastify" | "fastapi") {
  if (endpoint.bodyKind === "multipart") {
    return framework === "fastify"
      ? `import multipart from '@fastify/multipart'\n\nawait app.register(multipart, {\n  limits: { fileSize: 5_000_000, files: 1 }\n})\n\napp.post('${endpoint.path}', async (request, reply) => {\n  const image = await request.file()\n  if (!image?.mimetype.startsWith('image/')) {\n    return reply.code(415).send({ message: 'Image required' })\n  }\n  const bytes = await image.toBuffer()\n  const asset = await media.store({ bytes, name: image.filename })\n  return reply.code(201).send({ success: true, data: asset })\n})`
      : `from fastapi import APIRouter, File, HTTPException, UploadFile\n\nrouter = APIRouter(prefix="/media")\n\n@router.post("/images", status_code=201)\nasync def upload_image(image: UploadFile = File(...)):\n    if not image.content_type.startswith("image/"):\n        raise HTTPException(415, "Image required")\n    content = await image.read()\n    asset = await media.store(content, image.filename)\n    return {"success": True, "data": asset}`;
  }
  const method = endpoint.method.toLowerCase();
  if (framework === "fastify") {
    return `app.${method}('${endpoint.path}', {\n  schema: {\n    ${endpoint.body ? "body: requestSchema," : "querystring: querySchema,"}\n    response: { 200: responseSchema }\n  },\n  preHandler: [${endpoint.auth ? "app.authenticate" : "app.rateLimit"}]\n}, async (request, reply) => {\n  const result = await service.execute({\n    ${endpoint.body ? "input: request.body," : "query: request.query,"}\n    actor: request.user\n  })\n  return reply.code(${endpoint.method === "POST" ? 201 : endpoint.method === "DELETE" ? 204 : 200}).send({\n    success: true, message: '${endpoint.title}', data: result\n  })\n})`;
  }
  return `from fastapi import APIRouter, Depends, status\nfrom pydantic import BaseModel\n\nrouter = APIRouter(prefix="/api/v1")\n\n@router.${method}(\n    "${routeName(endpoint.path)}",\n    status_code=status.HTTP_${endpoint.method === "POST" ? "201_CREATED" : endpoint.method === "DELETE" ? "204_NO_CONTENT" : "200_OK"}\n)\nasync def handler(${endpoint.body ? "payload: RequestModel, " : ""}actor = Depends(${endpoint.auth ? "current_user" : "rate_limited_client"})):\n    result = await service.execute(${endpoint.body ? "payload.model_dump(), " : ""}actor)\n    return {"success": True, "message": "${endpoint.title}", "data": result}`;
}

export function PublicApiLab({ category }: { category: ApiCategory }) {
  const [selected, setSelected] = useState(0);
  const [framework, setFramework] = useState<"fastify" | "fastapi">("fastify");
  const [running, setRunning] = useState(false);
  const [frame, setFrame] = useState(0);
  const [latencies, setLatencies] = useState([32, 41, 28, 55, 37, 44, 35]);
  const [preview, setPreview] = useState<string | null>(null);
  const endpoint = category.endpoints[selected];
  const p95 = useMemo(() => Math.max(...latencies), [latencies]);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function selectImage(file?: File) {
    if (!file) return;
    setPreview(value => { if (value) URL.revokeObjectURL(value); return URL.createObjectURL(file); });
  }

  function run() {
    if (running) return;
    setRunning(true); setFrame(0);
    requestNodes.slice(1).forEach((_, index) => window.setTimeout(() => setFrame(index + 1), 380 * (index + 1)));
    window.setTimeout(() => { setLatencies(values => [...values.slice(-11), Math.round(24 + Math.random() * 56)]); setRunning(false); }, 2450);
  }

  return <main className="course-page public-api-page" style={{ "--lane": category.color } as CSSProperties}>
    <LearnNav/>
    <header className="public-api-hero shell"><div className="academy-breadcrumb"><Link href="/learn/public-apis">PUBLIC API LAB</Link><span>/</span><b>{category.index}</b></div><div><span>{category.icon}</span><article><small>LANE {category.index} · {category.endpoints.length} ENDPOINTS</small><h1>{category.title}</h1><p>{category.description}</p></article><aside><i/><b>SIMULATOR ONLINE</b><span>Fastify + FastAPI</span></aside></div></header>
    <section className="public-api-workbench shell">
      <aside className="endpoint-list"><header><span>ENDPOINTS</span><b>{category.endpoints.length}</b></header>{category.endpoints.map((item, index) => <button className={selected === index ? "active" : ""} onClick={() => setSelected(index)} key={`${item.method}-${item.path}`}><i className={`verb-${item.method.toLowerCase()}`}>{item.method}</i><span><b>{item.title}</b><small>{item.path}</small></span><u>→</u></button>)}</aside>
      <article className="endpoint-stage"><header><span className={`verb-${endpoint.method.toLowerCase()}`}>{endpoint.method}</span><code>{endpoint.path}</code><i>{endpoint.auth ? "AUTH REQUIRED" : "PUBLIC"}</i></header><div className="request-editor"><label>REQUEST BODY</label>{endpoint.bodyKind === "multipart" ? <div className="image-drop"><input id="api-image" type="file" accept="image/*" onChange={event => selectImage(event.target.files?.[0])}/>{preview ? <img src={preview} alt="Selected upload preview"/> : <div><b>▧</b><span>Choose an image to simulate multipart upload</span><small>PNG, JPEG, WebP · maximum 5 MB</small></div>}<label htmlFor="api-image">{preview ? "Replace image" : "Select image"}</label></div> : <pre>{endpoint.body ?? "No body for this request"}</pre>}<button onClick={run} disabled={running}>{running ? `Travelling through stage ${frame + 1}/6…` : `Send ${endpoint.method} request →`}</button></div><div className="response-editor"><header><span>RESPONSE</span><b>{endpoint.method === "POST" ? "201 CREATED" : endpoint.method === "DELETE" ? "204 NO CONTENT" : "200 OK"} · {latencies.at(-1)}ms</b></header><pre>{running ? '{\n  "status": "processing",\n  "stage": "' + requestNodes[frame].name + '"\n}' : endpoint.response}</pre></div>
      </article><aside className="framework-code"><header><button className={framework === "fastify" ? "active" : ""} onClick={() => setFramework("fastify")}>Fastify + TS</button><button className={framework === "fastapi" ? "active" : ""} onClick={() => setFramework("fastapi")}>FastAPI + Python</button></header><pre>{codeFor(endpoint, framework)}</pre></aside>
    </section>
    <section className="public-network shell"><header><div><span className="kicker">REAL REQUEST LIFECYCLE</span><h2>From network edge to durable data.</h2></div><p>Animated arrows show direction; the active component explains exactly where the request is being processed.</p></header><JointArchitecture nodes={requestNodes} kind="sequence" activeFrame={frame}/><footer>{requestNodes.map((node, index) => <div className={frame === index ? "active" : ""} key={node.name}><span>{String(index + 1).padStart(2,"0")}</span><b>{node.name}</b><small>{node.detail}</small></div>)}</footer></section>
    <section className="api-observability shell"><article><span className="kicker">LIVE LATENCY</span><h2>{p95}ms <small>p95</small></h2><p>Each simulated request appends a new sample.</p></article><div className="api-spark-bars">{latencies.map((latency, index) => <i key={`${index}-${latency}`} style={{ height: `${Math.max(14, latency)}%` }}><b>{latency}</b></i>)}</div><aside><span>PRODUCTION CHECKS</span>{["Schema validation","Rate limit + auth","Timeout budget","Idempotency","Structured errors","Metrics + trace"].map(item => <b key={item}>✓ {item}</b>)}</aside></section>
    <nav className="public-lane-nav shell">{publicApiCategories.map(lane => <Link className={lane.slug === category.slug ? "active" : ""} href={`/learn/public-apis/${lane.slug}`} key={lane.slug}><span>{lane.icon}</span><b>{lane.title}</b><small>{lane.endpoints.length} endpoints</small></Link>)}</nav>
  </main>;
}
