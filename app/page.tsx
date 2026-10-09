"use client";

import { useMemo, useState } from "react";

const tracks = [
  { id: "hld", icon: "⌘", title: "System Design", tag: "HLD", desc: "Turn requirements into scalable architecture.", color: "violet", progress: 72 },
  { id: "lld", icon: "◇", title: "Clean Components", tag: "LLD", desc: "Model objects, boundaries, and patterns.", color: "cyan", progress: 46 },
  { id: "cloud", icon: "☁", title: "Cloud Native", tag: "OPS", desc: "Docker, Kubernetes, CI/CD, and observability.", color: "orange", progress: 28 },
  { id: "data", icon: "▱", title: "Data at Scale", tag: "DB", desc: "Indexes, replicas, sharding, Kafka, and queues.", color: "pink", progress: 18 },
];

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

export default function Home() {
  const [rps, setRps] = useState(4200);
  const [replicas, setReplicas] = useState(4);
  const [cache, setCache] = useState(true);
  const [activeApi, setActiveApi] = useState("GET");
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const sample = apiSamples[activeApi];

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

  return (
    <main>
      <nav className="nav shell" aria-label="Primary navigation">
        <a className="brand" href="#top"><span className="brand-mark">S</span><span>ship<span className="dot">.</span>it<span className="dot">.</span>today</span></a>
        <div className="nav-links"><a href="#learn">Learn</a><a href="#lab">Playground</a><a href="#roadmap">Roadmap</a></div>
        <a className="nav-cta" href="#learn">Start learning <span>↗</span></a>
      </nav>

      <section className="hero shell" id="top">
        <div className="eyebrow"><span className="pulse" /> ENGINEERING IS A CRAFT. PRACTICE IT.</div>
        <h1>Design it. Scale it.<br/><em>Ship it today.</em></h1>
        <p className="hero-copy">A living, interactive world for mastering system design—from your first API to planet-scale architecture.</p>
        <div className="hero-actions"><a className="button primary" href="#learn">Enter the world <span>→</span></a><a className="button ghost" href="#lab"><span className="play">▶</span> Try the playground</a></div>
        <div className="world" aria-label="Animated system architecture preview">
          <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
          <div className="world-grid"/>
          <div className="node client"><span className="node-icon">⌁</span><b>Client</b><small>12k req/s</small></div>
          <div className="packet p1"/><div className="packet p2"/><div className="packet p3"/>
          <div className="node gateway"><span className="node-icon">⇆</span><b>API Gateway</b><small>auth · rate limit</small></div>
          <div className="node service"><span className="node-icon">⚙</span><b>Services</b><small>6 replicas</small></div>
          <div className="node cache"><span className="node-icon">ϟ</span><b>Redis</b><small>93% hit rate</small></div>
          <div className="node database"><span className="node-icon">◉</span><b>Postgres</b><small>2 replicas</small></div>
          <div className="node queue"><span className="node-icon">≋</span><b>Kafka</b><small>42k events/s</small></div>
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
          <button className="track-link" onClick={() => document.querySelector("#lab")?.scrollIntoView({behavior:"smooth"})}>Continue mission <span>↗</span></button>
        </article>)}</div>
      </section>

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

      <section className="final-cta shell"><span className="kicker">READY WHEN YOU ARE</span><h2>Great systems aren&apos;t guessed.<br/><em>They&apos;re engineered.</em></h2><p>Build the instinct to make smart tradeoffs before production makes them for you.</p><a className="button primary" href="#learn">Start your first mission <span>→</span></a><div className="mini-proof"><span>✓ No signup required</span><span>✓ Free interactive labs</span><span>✓ Built for real engineers</span></div></section>
      <footer className="shell"><a className="brand" href="#top"><span className="brand-mark">S</span><span>ship<span className="dot">.</span>it<span className="dot">.</span>today</span></a><p>Learn deeply. Design boldly. Ship today.</p><span>© 2026 SHIP IT TODAY</span></footer>
    </main>
  );
}
