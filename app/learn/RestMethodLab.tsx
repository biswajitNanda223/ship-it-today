"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { JointArchitecture } from "./JointArchitecture";
import { LearnNav } from "./LearnNav";
import type { RestMethod } from "./rest-method-data";
import { restMethods } from "./rest-method-data";

const networkNodes = [
  { name: "Browser", detail: "DNS + connection" },
  { name: "CDN / WAF", detail: "TLS + protection" },
  { name: "API Gateway", detail: "Auth + rate limit" },
  { name: "Fastify Route", detail: "Parse + validate" },
  { name: "Domain Service", detail: "Business rules" },
  { name: "Database", detail: "Transaction + index" },
];

export function RestMethodLab({ item }: { item: RestMethod }) {
  const [running, setRunning] = useState(false);
  const [frame, setFrame] = useState(0);
  const [samples, setSamples] = useState<number[]>([38, 44, 35, 51, 42, 47, 39, 45]);
  const activeIndex = restMethods.findIndex(method => method.slug === item.slug);
  const p95 = useMemo(() => [...samples].sort((a, b) => a - b)[Math.floor(samples.length * .95)] ?? 0, [samples]);

  function send() {
    if (running) return;
    setRunning(true);
    setFrame(0);
    networkNodes.slice(1).forEach((_, index) => window.setTimeout(() => setFrame(index + 1), (index + 1) * 430));
    window.setTimeout(() => {
      setSamples(values => [...values.slice(-11), Math.round(24 + Math.random() * 48)]);
      setRunning(false);
    }, 2800);
  }

  return <main className="course-page rest-method-page" style={{ "--method-color": item.color } as CSSProperties}>
    <LearnNav/>
    <header className="rest-method-hero shell"><div className="academy-breadcrumb"><Link href="/learn/apis">REST API LAB</Link><span>/</span><b>{item.method}</b></div><div><span>{item.method}</span><article><small>HTTP METHOD / {String(activeIndex + 1).padStart(2, "0")}</small><h1>{item.title}</h1><p>{item.semantics}</p></article><aside><b>{item.status}</b><span>Idempotent: {item.idempotency}</span><span>Cache: {item.cacheability}</span></aside></div></header>
    <nav className="rest-method-nav shell" aria-label="REST method pages">{restMethods.map(method => <Link className={method.slug === item.slug ? "active" : ""} href={`/learn/apis/methods/${method.slug}`} key={method.slug}>{method.method}</Link>)}</nav>
    <section className="network-request shell"><header><div><i/><b>END-TO-END NETWORK TRACE</b></div><span>{running ? `PROCESSING STAGE ${frame + 1}/6` : "READY TO SEND"}</span></header><JointArchitecture nodes={networkNodes} kind="sequence" activeFrame={frame}/><footer><button onClick={send} disabled={running}>{running ? "Request travelling through the stack…" : `Send ${item.method} request →`}</button><div><span>DNS <b>4ms</b></span><span>TLS <b>11ms</b></span><span>EDGE <b>5ms</b></span><span>APP <b>18ms</b></span><span>DB <b>9ms</b></span></div></footer></section>
    <section className="rest-contract shell"><article><span>01 / REQUEST</span><label>ENDPOINT<code><b>{item.method}</b> {item.endpoint}</code></label><label>HEADERS<pre>{item.headers.join("\n")}</pre></label><label>BODY<pre>{item.request}</pre></label></article><article><span>02 / RESPONSE</span><b className="rest-status">{item.status}</b><pre>{item.response}</pre><div className="response-meta"><span>content-type <b>application/json</b></span><span>x-request-id <b>req_7fa2</b></span><span>server-timing <b>app;dur=18, db;dur=9</b></span></div></article></section>
    <section className="rest-performance shell"><article><span>LIVE LATENCY PLOT</span><h2>Every request becomes a measurable trace.</h2><p>Run the example repeatedly. The chart records response time while the network diagram shows exactly where the request travels.</p><div><b>p95 {p95}ms</b><span>{samples.length} samples</span></div></article><div className="rest-chart"><div className="chart-slo">SLO 80ms</div>{samples.map((value, index) => <i key={`${index}-${value}`} style={{ height: `${Math.max(12, value)}%`, animationDelay: `${index * 35}ms` }}><b>{value}</b></i>)}<footer><span>older</span><span>requests over time</span><span>latest</span></footer></div><aside><span>USE {item.method} FOR</span>{item.uses.map((use, index) => <div key={use}><i>{String(index + 1).padStart(2, "0")}</i><b>{use}</b></div>)}</aside></section>
    <nav className="method-pagination shell">{restMethods.map(method => <Link href={`/learn/apis/methods/${method.slug}`} key={method.slug} className={method.slug === item.slug ? "active" : ""}><span>{method.method}</span><small>{method.title}</small></Link>)}</nav>
  </main>;
}
