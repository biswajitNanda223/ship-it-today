"use client";

import {
  Activity,
  BellRing,
  Check,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Database,
  Radio,
  RefreshCw,
  Route,
  Send,
  ShieldCheck,
  Siren,
  Webhook,
} from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { LearnNav } from "../../LearnNav";

type Severity = "critical" | "warning" | "info";
type AlertState = "draft" | "accepted" | "routed" | "delivered" | "acknowledged";

const stages: { id: AlertState; label: string; detail: string }[] = [
  { id: "accepted", label: "Accepted", detail: "202 + alert ID" },
  { id: "routed", label: "Routed", detail: "Policy + dedupe" },
  { id: "delivered", label: "Delivered", detail: "SSE + webhook" },
  { id: "acknowledged", label: "Acknowledged", detail: "Audit event" },
];

const stateOrder: AlertState[] = ["draft", "accepted", "routed", "delivered", "acknowledged"];

const severityConfig: Record<
  Severity,
  { label: string; sla: string; route: string; color: string }
> = {
  critical: { label: "Critical", sla: "60 sec", route: "On-call + SMS", color: "#ff5c35" },
  warning: { label: "Warning", sla: "15 min", route: "Team channel", color: "#ffb800" },
  info: { label: "Info", sla: "Best effort", route: "Alert inbox", color: "#6cf0c2" },
};

const fastApiCode = `from enum import StrEnum
from uuid import UUID, uuid4

from fastapi import FastAPI, Header, status
from pydantic import BaseModel, Field

app = FastAPI(title="Alert API", version="1.0.0")

class Severity(StrEnum):
    critical = "critical"
    warning = "warning"
    info = "info"

class AlertCreate(BaseModel):
    title: str = Field(min_length=3, max_length=120)
    source: str = Field(min_length=2, max_length=60)
    severity: Severity
    dedupe_key: str = Field(min_length=8, max_length=160)
    labels: dict[str, str] = {}

class AlertAccepted(BaseModel):
    id: UUID
    status: str = "accepted"
    event_stream: str

@app.post(
    "/v1/alerts",
    response_model=AlertAccepted,
    status_code=status.HTTP_202_ACCEPTED,
)
async def create_alert(
    body: AlertCreate,
    idempotency_key: str = Header(alias="Idempotency-Key"),
) -> AlertAccepted:
    # 1. Atomically persist alert + outbox event.
    # 2. Reuse result when idempotency_key already exists.
    # 3. Worker routes and delivers outside this request.
    alert_id = uuid4()
    return AlertAccepted(
        id=alert_id,
        event_stream=f"/v1/alerts/{alert_id}/events",
    )`;

const requestCode = `POST /v1/alerts HTTP/1.1
Authorization: Bearer <service-token>
Idempotency-Key: checkout-api:disk:2026-10-12T10
Content-Type: application/json

{
  "title": "Database disk usage above 90%",
  "source": "checkout-api",
  "severity": "critical",
  "dedupe_key": "checkout-api:postgres:disk-high",
  "labels": { "region": "ap-south-1", "env": "prod" }
}`;

export default function NotificationApiPage() {
  const [severity, setSeverity] = useState<Severity>("critical");
  const [source, setSource] = useState("checkout-api");
  const [title, setTitle] = useState("Database disk usage above 90%");
  const [alertState, setAlertState] = useState<AlertState>("draft");
  const [alertId, setAlertId] = useState("—");
  const [events, setEvents] = useState<string[]>([
    "SSE stream ready. Send an alert to inspect its lifecycle.",
  ]);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => timers.current.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const currentIndex = stateOrder.indexOf(alertState);
  const config = severityConfig[severity];

  function schedule(delay: number, action: () => void) {
    timers.current.push(window.setTimeout(action, delay));
  }

  function sendAlert() {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    const id = `alt_${crypto.randomUUID().slice(0, 8)}`;
    setAlertId(id);
    setAlertState("accepted");
    setEvents([`202 accepted · ${id}`, "Idempotency key stored"]);

    schedule(650, () => {
      setAlertState("routed");
      setEvents((value) => [`Policy matched · ${config.route}`, "Dedupe window checked", ...value]);
    });
    schedule(1350, () => {
      setAlertState("delivered");
      setEvents((value) => ["alert.delivered · attempt 1 · 183ms", ...value]);
    });
  }

  function acknowledgeAlert() {
    if (alertState !== "delivered") return;
    setAlertState("acknowledged");
    setEvents((value) => ["alert.acknowledged · operator: you", ...value]);
  }

  return (
    <main className="course-page alert-lesson">
      <LearnNav />

      <header className="alert-hero shell">
        <div>
          <Link className="alert-back" href="/learn/apis">
            ← API academy
          </Link>
          <span className="alert-kicker">
            <BellRing size={16} /> MODERN ALERT API
          </span>
          <h1>
            An alert is a <em>state machine</em>, not just a message.
          </h1>
          <p>
            Build one focused API for operational alerts: accept fast, deduplicate safely, route by
            severity, deliver asynchronously, and expose every transition in real time.
          </p>
          <div className="alert-hero-actions">
            <a href="#alert-lab">Run the API simulation</a>
            <a href="#alert-contract">Read the contract</a>
          </div>
        </div>
        <aside className="alert-status-card">
          <div>
            <span className="alert-live-dot" /> LIVE CONTRACT
            <b>POST /v1/alerts</b>
          </div>
          <dl>
            <div>
              <dt>Response</dt>
              <dd>202 Accepted</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>Async worker</dd>
            </div>
            <div>
              <dt>Updates</dt>
              <dd>SSE events</dd>
            </div>
            <div>
              <dt>Safety</dt>
              <dd>Idempotent</dd>
            </div>
          </dl>
          <p>
            The request never waits for SMS, email, or webhook providers. It commits intent and
            returns an alert ID immediately.
          </p>
        </aside>
      </header>

      <section className="alert-principles shell" aria-label="Alert API principles">
        {[
          [Clock3, "Accept fast", "Return 202 after the alert and outbox event are committed."],
          [
            ShieldCheck,
            "Never duplicate",
            "Idempotency handles retries; dedupe keys group incidents.",
          ],
          [
            Route,
            "Route by policy",
            "Severity, service, tenant, labels, and quiet hours decide channels.",
          ],
          [
            Activity,
            "Show every state",
            "SSE and audit events make delivery observable, not mysterious.",
          ],
        ].map(([Icon, titleText, detail]) => {
          const PrincipleIcon = Icon as typeof Clock3;
          return (
            <article key={titleText as string}>
              <PrincipleIcon size={22} />
              <b>{titleText as string}</b>
              <p>{detail as string}</p>
            </article>
          );
        })}
      </section>

      <section className="alert-lab shell" id="alert-lab">
        <div className="alert-section-heading">
          <span>INTERACTIVE LAB / 01</span>
          <h2>Send one alert. Watch the backend work.</h2>
          <p>This is a deterministic frontend simulation of the production flow described below.</p>
        </div>

        <div className="alert-lab-grid">
          <form
            className="alert-composer"
            onSubmit={(event) => {
              event.preventDefault();
              sendAlert();
            }}
          >
            <div className="alert-panel-title">
              <Siren size={19} /> Alert payload
            </div>
            <label>
              Severity
              <span className="severity-picker">
                {(Object.keys(severityConfig) as Severity[]).map((value) => (
                  <button
                    key={value}
                    type="button"
                    className={severity === value ? "active" : ""}
                    onClick={() => setSeverity(value)}
                  >
                    {severityConfig[value].label}
                  </button>
                ))}
              </span>
            </label>
            <label>
              Source service
              <input value={source} onChange={(event) => setSource(event.target.value)} required />
            </label>
            <label>
              Alert title
              <textarea value={title} onChange={(event) => setTitle(event.target.value)} required />
            </label>
            <div
              className="alert-route-preview"
              style={{ "--severity": config.color } as CSSProperties}
            >
              <span>Policy preview</span>
              <b>{config.route}</b>
              <small>Acknowledge within {config.sla}</small>
            </div>
            <button className="alert-send" type="submit">
              {alertState === "accepted" || alertState === "routed" ? (
                <RefreshCw className="alert-spin" size={18} />
              ) : (
                <Send size={18} />
              )}
              Send alert
            </button>
          </form>

          <div className="alert-pipeline" aria-live="polite">
            <div className="alert-panel-title">
              <Radio size={19} /> Delivery pipeline
              <code>{alertId}</code>
            </div>
            <div className="alert-stage-list">
              {stages.map((stage, index) => {
                const active = currentIndex >= stateOrder.indexOf(stage.id);
                return (
                  <div className={`alert-stage ${active ? "active" : ""}`} key={stage.id}>
                    <span>{active ? <Check size={15} /> : index + 1}</span>
                    <div>
                      <b>{stage.label}</b>
                      <small>{stage.detail}</small>
                    </div>
                    {index < stages.length - 1 && <i />}
                  </div>
                );
              })}
            </div>
            <button
              className="alert-ack"
              type="button"
              disabled={alertState !== "delivered"}
              onClick={acknowledgeAlert}
            >
              <CheckCircle2 size={17} />
              {alertState === "acknowledged" ? "Alert acknowledged" : "Acknowledge alert"}
            </button>
          </div>

          <div className="alert-event-stream">
            <div className="alert-panel-title">
              <Activity size={19} /> SSE event stream
              <span>CONNECTED</span>
            </div>
            <div>
              {events.map((event, index) => (
                <p key={`${event}-${index}`}>
                  <time>{new Date().toLocaleTimeString([], { hour12: false })}</time>
                  <span>{event}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="alert-contract shell" id="alert-contract">
        <div className="alert-section-heading">
          <span>API CONTRACT / 02</span>
          <h2>A small surface with explicit semantics.</h2>
        </div>
        <div className="alert-endpoints">
          {[
            ["POST", "/v1/alerts", "Accept a new alert", "202"],
            ["GET", "/v1/alerts/{id}", "Read current state", "200"],
            ["GET", "/v1/alerts/{id}/events", "Stream state changes with SSE", "200"],
            ["PATCH", "/v1/alerts/{id}/acknowledge", "Record ownership and stop escalation", "200"],
            ["POST", "/v1/alerts/{id}/resolve", "Close the operational incident", "200"],
          ].map(([method, path, purpose, statusCode]) => (
            <article key={path}>
              <b data-method={method}>{method}</b>
              <code>{path}</code>
              <p>{purpose}</p>
              <span>{statusCode}</span>
            </article>
          ))}
        </div>
        <div className="alert-code-grid">
          <article>
            <span>REQUEST EXAMPLE</span>
            <pre>
              <code>{requestCode}</code>
            </pre>
          </article>
          <article>
            <span>FASTAPI IMPLEMENTATION</span>
            <pre>
              <code>{fastApiCode}</code>
            </pre>
          </article>
        </div>
      </section>

      <section className="alert-architecture shell">
        <div className="alert-section-heading">
          <span>PRODUCTION FLOW / 03</span>
          <h2>Reliable by design—even when providers fail.</h2>
        </div>
        <div className="alert-architecture-flow">
          {[
            [Webhook, "Client", "Idempotency key"],
            [ShieldCheck, "Alert API", "Auth + validate"],
            [Database, "Postgres", "Alert + outbox"],
            [Route, "Router worker", "Dedupe + policy"],
            [BellRing, "Channels", "SSE + SMS + hook"],
          ].map(([Icon, name, detail], index) => {
            const FlowIcon = Icon as typeof Webhook;
            return (
              <div className="alert-flow-step" key={name as string}>
                <article>
                  <FlowIcon size={25} />
                  <b>{name as string}</b>
                  <small>{detail as string}</small>
                </article>
                {index < 4 && (
                  <span className="alert-flow-arrow">
                    <i />
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="alert-production-notes">
          <article>
            <CircleAlert size={20} />
            <div>
              <b>Failure policy</b>
              <p>Exponential backoff with jitter, provider circuit breakers, then a DLQ.</p>
            </div>
          </article>
          <article>
            <ShieldCheck size={20} />
            <div>
              <b>Security</b>
              <p>
                Service tokens, <code>alerts:write</code> scope, tenant isolation, and audit logs.
              </p>
            </div>
          </article>
          <article>
            <Activity size={20} />
            <div>
              <b>Golden signals</b>
              <p>
                Acceptance p95, queue age, delivery success, retry count, and acknowledgement SLA.
              </p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
