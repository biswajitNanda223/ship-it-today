"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const tracks = [
  { id: "hld", icon: "⌘", title: "System Design", tag: "HLD", desc: "Turn requirements into scalable architecture.", color: "violet", progress: 72 },
  { id: "lld", icon: "◇", title: "Clean Components", tag: "LLD", desc: "Model objects, boundaries, and patterns.", color: "cyan", progress: 46 },
  { id: "cloud", icon: "☁", title: "Cloud Native", tag: "OPS", desc: "Docker, Kubernetes, CI/CD, and observability.", color: "orange", progress: 28 },
  { id: "data", icon: "▱", title: "Data at Scale", tag: "DB", desc: "Indexes, replicas, sharding, Kafka, and queues.", color: "pink", progress: 18 },
];

const nodeDetails: Record<string, { title: string; role: string; stat: string }> = {
  client: { title: "Edge Client", role: "Creates an authenticated HTTPS request.", stat: "12k req/s" },
  gateway: { title: "API Gateway", role: "Validates tokens, applies quotas, and routes traffic.", stat: "0.04% errors" },
  service: { title: "Order Service", role: "Runs stateless business logic across six replicas.", stat: "61% CPU" },
  cache: { title: "Redis Cache", role: "Serves hot reads without touching the primary database.", stat: "93% hit rate" },
  database: { title: "Postgres", role: "Stores durable state with two read replicas.", stat: "8ms query" },
  queue: { title: "Kafka Stream", role: "Decouples services using durable ordered events.", stat: "42k events/s" },
};

const missionSteps: Record<string, { title: string; brief: string; tasks: string[]; reward: string }> = {
  hld: { title: "Design a global URL shortener", brief: "Your launch went viral. Design for 50M links and 120k redirects per second.", tasks: ["Estimate storage and traffic", "Choose cache and database", "Protect the write path"], reward: "+450 XP" },
  lld: { title: "Model a parking garage", brief: "Create extensible objects without building a class hierarchy maze.", tasks: ["Define core interfaces", "Apply the Strategy pattern", "Test entry and pricing flows"], reward: "+320 XP" },
  cloud: { title: "Recover a failed region", brief: "Your primary region is down. Restore service with safe Kubernetes traffic controls.", tasks: ["Inspect unhealthy pods", "Shift regional traffic", "Verify SLO recovery"], reward: "+520 XP" },
  data: { title: "Shard a social graph", brief: "One database can no longer hold the graph. Migrate without downtime.", tasks: ["Find access patterns", "Select a shard key", "Plan dual-write migration"], reward: "+600 XP" },
};

const roadmap = [
  ["01", "Foundations", "Latency, throughput, availability, CAP theorem"],
  ["02", "API Engineering", "REST, GraphQL, gRPC, WebSockets, webhooks"],
  ["03", "Scale the Core", "Caching, load balancing, queues, rate limits"],
  ["04", "Data Systems", "Indexes, replication, partitioning, consistency"],
  ["05", "Production", "Docker, Kubernetes, tracing, alerts, SLOs"],
];

const apiSamples: Record<string, { method: string; path: string; body: string; response: string; latency: number }> = {
  GET: { method: "GET", path: "/api/v1/orders/ord_82x", body: "No request body", response: '{\n  "id": "ord_82x",\n  "status": "shipped",\n  "total": 2499,\n  "cache": "HIT"\n}', latency: 34 },
  POST: { method: "POST", path: "/api/v1/orders", body: '{\n  "sku": "SYS-DESIGN-01",\n  "quantity": 1\n}', response: '{\n  "id": "ord_a91",\n  "status": "queued",\n  "event": "order.created"\n}', latency: 82 },
  GRAPHQL: { method: "POST", path: "/graphql", body: 'query {\n  course(slug: "system-design") {\n    title progress\n  }\n}', response: '{\n  "data": {\n    "course": { "title": "System Design", "progress": 72 }\n  }\n}', latency: 61 },
  SOCKET: { method: "WS", path: "/realtime", body: 'subscribe("deployment.events")', response: '{\n  "event": "deploy.ready",\n  "region": "ap-south-1",\n  "version": "v1.4.0"\n}', latency: 18 },
};

const apiCatalog = [
  { id: "rest", name: "REST", badge: "HTTP", color: "#6c42ef", summary: "Resource-oriented APIs with predictable verbs, status codes, caching, and broad tooling.", verbs: ["GET", "POST", "PUT", "PATCH", "DELETE"], code: `fastify.get('/api/v1/users/:id', {\n  schema: { params: UserParams }\n}, async (request, reply) => {\n  const cached = await redis.get(request.params.id)\n  if (cached) return JSON.parse(cached)\n  return userService.findById(request.params.id)\n})`, optimize: ["Cursor pagination", "ETag + Cache-Control", "Sparse fieldsets", "Batch database reads"] },
  { id: "graphql", name: "GraphQL", badge: "QUERY", color: "#e34d9c", summary: "A typed graph lets clients request exactly the fields they need through one endpoint.", verbs: ["QUERY", "MUTATION", "SUBSCRIPTION"], code: `type Query {\n  course(id: ID!): Course\n}\n\nquery CourseCard {\n  course(id: "hld-101") {\n    title progress instructor { name }\n  }\n}`, optimize: ["DataLoader batching", "Persisted queries", "Depth limits", "Field-level caching"] },
  { id: "grpc", name: "gRPC", badge: "PROTO", color: "#19a884", summary: "Fast binary contracts and streaming for trusted service-to-service communication.", verbs: ["UNARY", "SERVER STREAM", "BIDI STREAM"], code: `service Inventory {\n  rpc Reserve(ReserveRequest)\n    returns (ReserveResponse);\n}\n\nmessage ReserveRequest {\n  string sku = 1;\n  int32 quantity = 2;\n}`, optimize: ["Reuse channels", "Set deadlines", "Stream large results", "Compress selectively"] },
  { id: "realtime", name: "Realtime", badge: "EVENT", color: "#f4773b", summary: "WebSockets and SSE deliver live updates without repeated client polling.", verbs: ["WEBSOCKET", "SSE", "LONG POLL"], code: `app.get('/events', async (_, reply) => {\n  reply.raw.setHeader(\n    'Content-Type', 'text/event-stream'\n  )\n  broker.on('deploy.ready', event =>\n    reply.raw.write(\`data: \${JSON.stringify(event)}\\n\\n\`)\n  )\n})`, optimize: ["Heartbeat frames", "Backpressure", "Resume tokens", "Connection limits"] },
  { id: "webhook", name: "Webhooks", badge: "PUSH", color: "#d99a10", summary: "Event callbacks connect external systems reliably with signatures and retries.", verbs: ["DELIVERY", "RETRY", "REPLAY"], code: `app.post('/webhooks/stripe', {\n  config: { rawBody: true }\n}, async (request, reply) => {\n  verifySignature(request)\n  await inbox.storeOnce(request.body.id)\n  await queue.publish(request.body)\n  return reply.code(202).send()\n})`, optimize: ["Verify signatures", "Return 2xx quickly", "Idempotency keys", "Exponential retry"] },
];

const patterns = [
  { id: "strategy", name: "Strategy", kind: "BEHAVIORAL", problem: "Swap an algorithm without changing its caller.", code: `interface PricingStrategy {\n  calculate(minutes: number): number\n}\nclass WeekendPricing implements PricingStrategy {\n  calculate(minutes: number) { return minutes * 0.75 }\n}\nclass ParkingTicket {\n  constructor(private pricing: PricingStrategy) {}\n  total(minutes: number) { return this.pricing.calculate(minutes) }\n}` },
  { id: "factory", name: "Factory", kind: "CREATIONAL", problem: "Centralize object creation behind a stable interface.", code: `class NotificationFactory {\n  static create(channel: Channel): Notifier {\n    if (channel === 'email') return new EmailNotifier()\n    if (channel === 'sms') return new SmsNotifier()\n    return new PushNotifier()\n  }\n}` },
  { id: "observer", name: "Observer", kind: "BEHAVIORAL", problem: "Notify many consumers when domain state changes.", code: `class Order {\n  private listeners = new Set<OrderListener>()\n  subscribe(listener: OrderListener) { this.listeners.add(listener) }\n  ship() {\n    this.status = 'shipped'\n    this.listeners.forEach(l => l.onShipped(this))\n  }\n}` },
  { id: "adapter", name: "Adapter", kind: "STRUCTURAL", problem: "Make an external interface fit your domain contract.", code: `class StripePaymentAdapter implements PaymentPort {\n  constructor(private stripe: Stripe) {}\n  async charge(money: Money) {\n    return this.stripe.paymentIntents.create({\n      amount: money.minorUnits, currency: money.currency\n    })\n  }\n}` },
];

export default function Home() {
  const [rps, setRps] = useState(4200);
  const [replicas, setReplicas] = useState(4);
  const [cache, setCache] = useState(true);
  const [activeApi, setActiveApi] = useState("GET");
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [selectedNode, setSelectedNode] = useState("gateway");
  const [mission, setMission] = useState<string | null>(null);
  const [missionStep, setMissionStep] = useState(0);
  const [xp, setXp] = useState(1240);
  const [toast, setToast] = useState("");
  const [services, setServices] = useState(["gateway", "service", "database"]);
  const [apiType, setApiType] = useState("rest");
  const [pattern, setPattern] = useState("strategy");
  const [requestStage, setRequestStage] = useState(0);
  const [copied, setCopied] = useState(false);
  const sample = apiSamples[activeApi];
  const selectedApi = apiCatalog.find(item => item.id === apiType) ?? apiCatalog[0];
  const selectedPattern = patterns.find(item => item.id === pattern) ?? patterns[0];

  const metrics = useMemo(() => {
    const capacity = replicas * 1450 * (cache ? 2.3 : 1);
    const utilization = Math.min(99, Math.round((rps / capacity) * 100));
    const latency = Math.round(22 + Math.pow(rps / capacity, 2.4) * 210 + (cache ? 0 : 48));
    return { capacity: Math.round(capacity), utilization, latency, healthy: utilization < 82 };
  }, [rps, replicas, cache]);

  function runRequest() {
    setRunning(true);
    setCompleted(false);
    window.setTimeout(() => { setRunning(false); setCompleted(true); }, 650);
  }

  function toggleService(id: string) {
    setServices(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  }

  function finishMission() {
    setXp(value => value + 450);
    setToast("Mission complete · +450 XP");
    setMission(null);
    setMissionStep(0);
    window.setTimeout(() => setToast(""), 2800);
  }

  function animateLifecycle() {
    setRequestStage(1);
    [2,3,4,5].forEach((stage, index) => window.setTimeout(() => setRequestStage(stage), (index + 1) * 520));
    window.setTimeout(() => setRequestStage(0), 3200);
  }

  function copyExample() {
    navigator.clipboard?.writeText(selectedApi.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main>
      <nav className="nav shell" aria-label="Primary navigation">
        <a className="brand" href="#top"><span className="brand-mark">S</span><span>ship<span className="dot">.</span>it<span className="dot">.</span>today</span></a>
        <div className="nav-links"><a href="#learn">Learn</a><a href="#api-academy">APIs</a><a href="#patterns">Patterns</a><a href="#lab">Scale Lab</a></div>
        <div className="nav-actions"><span className="xp-pill">⚡ {xp.toLocaleString()} XP</span><a className="nav-cta" href="#learn">Start learning <span>↗</span></a></div>
      </nav>

      <section className="hero shell" id="top">
        <div className="eyebrow"><span className="pulse" /> ENGINEERING IS A CRAFT. PRACTICE IT.</div>
        <h1>Design it. Scale it.<br/><em>Ship it today.</em></h1>
        <p className="hero-copy">A living, interactive world for mastering system design—from your first API to planet-scale architecture.</p>
        <div className="hero-actions"><a className="button primary" href="#learn">Enter the world <span>→</span></a><a className="button ghost" href="#lab"><span className="play">▶</span> Try the playground</a></div>
        <div className="world" aria-label="Animated system architecture preview">
          <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
          <div className="world-grid"/>
          <button className={`node client ${selectedNode==="client"?"selected":""}`} onClick={()=>setSelectedNode("client")}><span className="node-icon">⌁</span><b>Client</b><small>12k req/s</small></button>
          <div className="packet p1"/><div className="packet p2"/><div className="packet p3"/>
          <button className={`node gateway ${selectedNode==="gateway"?"selected":""}`} onClick={()=>setSelectedNode("gateway")}><span className="node-icon">⇆</span><b>API Gateway</b><small>auth · rate limit</small></button>
          <button className={`node service ${selectedNode==="service"?"selected":""}`} onClick={()=>setSelectedNode("service")}><span className="node-icon">⚙</span><b>Services</b><small>6 replicas</small></button>
          <button className={`node cache ${selectedNode==="cache"?"selected":""}`} onClick={()=>setSelectedNode("cache")}><span className="node-icon">ϟ</span><b>Redis</b><small>93% hit rate</small></button>
          <button className={`node database ${selectedNode==="database"?"selected":""}`} onClick={()=>setSelectedNode("database")}><span className="node-icon">◉</span><b>Postgres</b><small>2 replicas</small></button>
          <button className={`node queue ${selectedNode==="queue"?"selected":""}`} onClick={()=>setSelectedNode("queue")}><span className="node-icon">≋</span><b>Kafka</b><small>42k events/s</small></button>
          <div className="node-inspector" key={selectedNode}><small>SELECTED COMPONENT</small><b>{nodeDetails[selectedNode].title}</b><p>{nodeDetails[selectedNode].role}</p><strong>{nodeDetails[selectedNode].stat}</strong></div>
          <div className="world-status"><span/><b>All systems operational</b><small>p95 84ms</small></div>
        </div>
        <div className="proof"><span>LEARN THE STACK BEHIND</span><b>NETFLIX</b><b>Stripe</b><b>uber</b><b>airbnb</b><b>amazon</b></div>
      </section>

      <section className="section shell" id="learn">
        <div className="section-head"><div><span className="kicker">CHOOSE YOUR MISSION</span><h2>Learn by <em>building.</em></h2></div><p>No passive videos. Break systems, fix bottlenecks, and watch every design decision play out.</p></div>
        <div className="track-grid">{tracks.map((track, i) => <article className={`track ${track.color}`} key={track.id}>
          <div className="track-top"><span className="track-icon">{track.icon}</span><span className="tag">{track.tag}</span></div>
          <span className="lesson-count">0{i + 1} / 04</span><h3>{track.title}</h3><p>{track.desc}</p>
          <div className="progress-label"><span>Progress</span><span>{track.progress}%</span></div><div className="progress"><i style={{width: `${track.progress}%`}}/></div>
          <button className="track-link" onClick={() => {setMission(track.id);setMissionStep(0)}}>Launch mission <span>↗</span></button>
        </article>)}</div>
      </section>

      <section className="academy-section" id="api-academy"><div className="shell">
        <div className="section-head"><div><span className="kicker">API ENGINEERING ACADEMY</span><h2>Every API style.<br/><em>One living lab.</em></h2></div><p>Learn when to use each protocol, build it with production-ready code, then trace and optimize the complete request lifecycle.</p></div>
        <div className="api-catalog">{apiCatalog.map(item=><button key={item.id} className={apiType===item.id?"active":""} style={{"--api-color":item.color} as React.CSSProperties} onClick={()=>{setApiType(item.id);setCopied(false)}}><i>{item.badge}</i><b>{item.name}</b><span>{item.verbs.length} modes</span></button>)}</div>
        <div className="api-masterclass" style={{"--api-color":selectedApi.color} as React.CSSProperties}>
          <div className="api-lesson"><small>PROTOCOL / {selectedApi.badge}</small><h3>{selectedApi.name}</h3><p>{selectedApi.summary}</p><div className="verb-list">{selectedApi.verbs.map(verb=><span key={verb}>{verb}</span>)}</div><h4>Production optimization</h4><ul>{selectedApi.optimize.map(item=><li key={item}><i>✓</i>{item}</li>)}</ul></div>
          <div className="code-player"><div className="code-top"><span><i/><i/><i/> TypeScript</span><button onClick={copyExample}>{copied?"Copied ✓":"Copy code"}</button></div><pre><code>{selectedApi.code}</code></pre><div className="code-foot"><span>Production pattern</span><b>Fastify + TypeScript</b></div></div>
        </div>
        <div className="lifecycle-lab"><div className="lifecycle-head"><div><small>LIVE REQUEST LIFECYCLE</small><b>Follow one request end to end</b></div><button onClick={animateLifecycle} disabled={requestStage>0}>{requestStage>0?"Tracing request…":"Run request →"}</button></div><div className="lifecycle-track">{["CLIENT","GATEWAY","VALIDATE","SERVICE","DATABASE"].map((label,index)=><div key={label} className={requestStage>index?"stage active":"stage"}><i>{index+1}</i><b>{label}</b><small>{["HTTP/2","JWT + LIMIT","SCHEMA","BUSINESS LOGIC","INDEX LOOKUP"][index]}</small>{index<4&&<span/>}</div>)}</div><div className="trace-console"><span className={requestStage>0?"trace-dot moving":"trace-dot"}/><code>{requestStage===0?"Ready to trace":requestStage===5?"200 OK · 34ms · cache HIT":`Processing stage ${requestStage} of 5…`}</code></div></div>
      </div></section>

      <section className="patterns-section" id="patterns"><div className="shell">
        <div className="section-head light"><div><span className="kicker">LLD PATTERN LAB</span><h2>Model the code.<br/><em>Change the behavior.</em></h2></div><p>Explore proven object-oriented patterns, understand the problem each solves, and inspect concise TypeScript implementations.</p></div>
        <div className="pattern-lab"><div className="pattern-menu">{patterns.map((item,index)=><button key={item.id} className={pattern===item.id?"active":""} onClick={()=>setPattern(item.id)}><span>0{index+1}</span><div><small>{item.kind}</small><b>{item.name}</b></div><i>→</i></button>)}</div><div className="pattern-stage" key={pattern}><div className="pattern-visual"><div className="pattern-ring one"/><div className="pattern-ring two"/><div className="pattern-core">{selectedPattern.name}<small>PATTERN</small></div><div className="satellite s-one">CONTEXT</div><div className="satellite s-two">INTERFACE</div><div className="satellite s-three">IMPLEMENTATION</div></div><div className="pattern-explain"><small>{selectedPattern.kind} PATTERN</small><h3>{selectedPattern.name}</h3><p>{selectedPattern.problem}</p><pre>{selectedPattern.code}</pre><div className="principle"><b>SOLID CONNECTION</b><span>Open for extension, closed for modification.</span></div></div></div></div>
      </div></section>

      <section className="builder-section"><div className="shell">
        <div className="section-head light"><div><span className="kicker">ARCHITECTURE BUILDER</span><h2>Compose the stack.<br/><em>Watch traffic move.</em></h2></div><p>Enable and remove components. The topology, request path, and reliability score update as you design.</p></div>
        <div className="builder-layout">
          <div className="component-tray"><small>COMPONENT LIBRARY</small>{["gateway","cache","service","queue","database"].map(id=><button key={id} className={services.includes(id)?"installed":""} onClick={()=>toggleService(id)}><i>{services.includes(id)?"✓":"+"}</i><span><b>{nodeDetails[id].title}</b><small>{services.includes(id)?"ACTIVE IN SYSTEM":"CLICK TO ADD"}</small></span></button>)}</div>
          <div className="canvas"><div className="canvas-grid"/><div className="canvas-title"><span>LIVE TOPOLOGY</span><b>{services.length + 1} components</b></div><div className="canvas-client">USER<span>10K RPS</span></div><div className="flow-line"/><div className="topology">{services.map((id,index)=><div className={`topology-node t-${id}`} key={id} style={{animationDelay:`${index*80}ms`}}><i>{id==="cache"?"ϟ":id==="database"?"◉":id==="queue"?"≋":id==="gateway"?"⇆":"⚙"}</i><span>{nodeDetails[id].title}</span><u/></div>)}</div><div className="reliability"><span>RELIABILITY SCORE</span><b>{Math.min(99,62 + services.length*7)}<small>/100</small></b><div><i style={{width:`${Math.min(99,62 + services.length*7)}%`}}/></div><p>{services.includes("cache")&&services.includes("queue")?"Resilient under traffic spikes":"Add cache and queue isolation to improve resilience"}</p></div></div>
        </div>
      </div></section>

      <section className="lab-section" id="lab">
        <div className="shell">
          <div className="section-head light"><div><span className="kicker">THE SCALE LAB</span><h2>Make the call.<br/><em>See what breaks.</em></h2></div><p>Change traffic, compute, and caching. The model predicts capacity, utilization, and p95 latency instantly.</p></div>
          <div className="simulator">
            <div className="controls">
              <div className="panel-title"><span>⌁</span><div><b>Traffic Controller</b><small>LIVE SIMULATION</small></div><i/></div>
              <label><span>Incoming traffic <b>{rps.toLocaleString()} req/s</b></span><input type="range" min="500" max="12000" step="100" value={rps} onChange={e=>setRps(Number(e.target.value))}/></label>
              <label><span>Service replicas <b>{replicas} pods</b></span><input type="range" min="1" max="10" value={replicas} onChange={e=>setReplicas(Number(e.target.value))}/></label>
              <button className={`toggle-row ${cache ? "on" : ""}`} onClick={()=>setCache(!cache)}><span><b>Redis edge cache</b><small>Reduce repeated database reads</small></span><i><u/></i></button>
              <div className="tip"><b>ENGINEERING TIP</b><p>{metrics.healthy ? "You have healthy headroom. Keep utilization below 80% for traffic spikes." : "Your system is saturated. Add replicas or enable caching before latency compounds."}</p></div>
            </div>
            <div className="chart-panel">
              <div className="chart-head"><div><span>P95 LATENCY</span><b>{metrics.latency} <small>ms</small></b></div><span className={metrics.healthy ? "healthy" : "danger"}>{metrics.healthy ? "HEALTHY" : "SATURATED"}</span></div>
              <div className="chart" style={{"--load": `${metrics.utilization}%`} as React.CSSProperties}>
                <div className="threshold">200ms threshold</div><div className="area-chart"/><div className="chart-dot"/>
                <div className="y-axis"><span>300</span><span>200</span><span>100</span><span>0</span></div>
                <div className="x-axis"><span>1k</span><span>3k</span><span>6k</span><span>9k</span><span>12k req/s</span></div>
              </div>
              <div className="metric-row"><div><small>UTILIZATION</small><b>{metrics.utilization}%</b></div><div><small>MAX CAPACITY</small><b>{metrics.capacity.toLocaleString()}</b></div><div><small>CACHE</small><b>{cache ? "93% HIT" : "OFF"}</b></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section shell api-section">
        <div className="section-head"><div><span className="kicker">API DOJO</span><h2>Request. Inspect.<br/><em>Understand.</em></h2></div><p>Compare API styles and follow each request through validation, cache, service, and database layers.</p></div>
        <div className="api-window">
          <div className="window-bar"><span/><span/><span/><b>api.ship-it.today</b><i>● Connected</i></div>
          <div className="api-tabs">{Object.keys(apiSamples).map(key=><button key={key} className={activeApi===key?"active":""} onClick={()=>{setActiveApi(key);setCompleted(false)}}>{key}</button>)}</div>
          <div className="request-bar"><span className={`method m-${sample.method}`}>{sample.method}</span><code>{sample.path}</code><button onClick={runRequest} disabled={running}>{running ? "Sending…" : "Send request"} <span>→</span></button></div>
          <div className="code-grid"><div><small>REQUEST</small><pre>{sample.body}</pre></div><div className={completed?"response flash":"response"}><span><small>RESPONSE</small><b>200 OK · {sample.latency}ms</b></span><pre>{running ? "Routing request through the stack…" : sample.response}</pre></div></div>
          <div className="request-flow"><span>CLIENT</span><i>→</i><span>GATEWAY</span><i>→</i><span>CACHE</span><i>→</i><span>SERVICE</span><i>→</i><span>DATABASE</span></div>
        </div>
      </section>

      <section className="roadmap-section" id="roadmap"><div className="shell">
        <div className="roadmap-copy"><span className="kicker">YOUR FLIGHT PLAN</span><h2>From zero to<br/><em>systems thinker.</em></h2><p>A deliberately sequenced path. Every mission unlocks the mental model needed for the next.</p><div className="roadmap-stat"><b>36</b><span>HANDS-ON<br/>MISSIONS</span><b>12</b><span>PRODUCTION<br/>BLUEPRINTS</span></div></div>
        <div className="roadmap-list">{roadmap.map((item,i)=><div className={i===0?"road active":"road"} key={item[0]}><span>{item[0]}</span><i>{i===0?"●":"○"}</i><div><b>{item[1]}</b><small>{item[2]}</small></div><u>{i===0?"START":"LOCKED"}</u></div>)}</div>
      </div></section>

      <section className="deep-dives shell"><span className="kicker">COMPLETE CURRICULUM</span><h2>Go deeper. Build the mental model.</h2><div><Link href="/learn"><small>ACADEMY / 00</small><b>Visual System Design Academy</b><p>20 separate HLD, LLD, diagram, and REST lessons.</p><span>Open academy →</span></Link><Link href="/learn/hld"><small>HLD / 01</small><b>End-to-End System Design</b><p>Case studies from requirements to rollout.</p><span>Open track →</span></Link><Link href="/learn/lld"><small>LLD / 02</small><b>Object &amp; Pattern Design</b><p>UML, SOLID, patterns, and TypeScript.</p><span>Open track →</span></Link><Link href="/learn/diagrams"><small>MODELS / 03</small><b>Diagram Studio</b><p>Class, sequence, DFD, ERD, and state models.</p><span>Open track →</span></Link><Link href="/learn/apis"><small>REST / 04</small><b>Complete API Laboratory</b><p>Every method, security, testing, and graphs.</p><span>Open track →</span></Link><Link href="/learn/ddia"><small>DATA / 05</small><b>DDIA Study Guide</b><p>Storage, replication, transactions, streams.</p><span>Open guide →</span></Link><Link href="/learn/genai"><small>GENAI / 06</small><b>GenAI Backend Design</b><p>RAG, agents, streaming, safety, and evals.</p><span>Open studio →</span></Link></div></section>

      <section className="final-cta shell"><span className="kicker">READY WHEN YOU ARE</span><h2>Great systems aren&apos;t guessed.<br/><em>They&apos;re engineered.</em></h2><p>Build the instinct to make smart tradeoffs before production makes them for you.</p><a className="button primary" href="#learn">Start your first mission <span>→</span></a><div className="mini-proof"><span>✓ No signup required</span><span>✓ Free interactive labs</span><span>✓ Built for real engineers</span></div></section>
      <footer className="shell"><a className="brand" href="#top"><span className="brand-mark">S</span><span>ship<span className="dot">.</span>it<span className="dot">.</span>today</span></a><p>Learn deeply. Design boldly. Ship today.</p><span>© 2026 SHIP IT TODAY</span></footer>
      {mission && <div className="mission-overlay" role="dialog" aria-modal="true" aria-label="Interactive mission"><button className="overlay-close" onClick={()=>setMission(null)} aria-label="Close mission">×</button><div className="mission-modal"><div className="mission-side"><span>MISSION 01</span><b>{missionSteps[mission].reward}</b><div className="mission-orb"><i/><i/><i/><strong>{mission.toUpperCase()}</strong></div><p>Interactive challenge</p></div><div className="mission-content"><small>FIELD EXERCISE · {missionStep+1}/3</small><h2>{missionSteps[mission].title}</h2><p>{missionSteps[mission].brief}</p><div className="mission-progress"><i style={{width:`${((missionStep+1)/3)*100}%`}}/></div><div className="task-list">{missionSteps[mission].tasks.map((task,index)=><button key={task} className={index<=missionStep?"done":""} onClick={()=>setMissionStep(index)}><i>{index<missionStep?"✓":index===missionStep?"→":index+1}</i><span><b>{task}</b><small>{index===missionStep?"CURRENT OBJECTIVE":index<missionStep?"COMPLETE":"LOCKED"}</small></span></button>)}</div><button className="mission-next" onClick={()=>missionStep<2?setMissionStep(value=>value+1):finishMission()}>{missionStep<2?"Complete objective":"Finish mission"}<span>→</span></button></div></div></div>}
      {toast && <div className="achievement"><i>★</i><span><small>ACHIEVEMENT UNLOCKED</small><b>{toast}</b></span></div>}
    </main>
  );
}
