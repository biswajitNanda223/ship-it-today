export type Pattern = { name: string; family: "Creational" | "Structural" | "Behavioral" | "Enterprise"; intent: string; use: string; code: string };

export const patterns: Pattern[] = [
  { name:"Singleton",family:"Creational",intent:"Guarantee one shared instance.",use:"Configuration, process-wide registries",code:"class Config {\n  private static instance: Config\n  private constructor() {}\n  static get() { return this.instance ??= new Config() }\n}" },
  { name:"Factory Method",family:"Creational",intent:"Let subclasses choose the product.",use:"Transport or parser selection",code:"abstract class Transport {\n  abstract create(): Sender\n  ship() { return this.create().send() }\n}" },
  { name:"Abstract Factory",family:"Creational",intent:"Create related object families.",use:"Cloud provider adapters",code:"interface CloudFactory {\n  queue(): Queue\n  storage(): Storage\n}" },
  { name:"Builder",family:"Creational",intent:"Construct complex objects step by step.",use:"Queries and request objects",code:"const query = new QueryBuilder()\n  .select('id','name').where({active:true}).limit(20).build()" },
  { name:"Prototype",family:"Creational",intent:"Clone from a configured template.",use:"Document and workflow templates",code:"const draft = Object.assign(\n  Object.create(Object.getPrototypeOf(template)), template\n)" },
  { name:"Adapter",family:"Structural",intent:"Fit an external API to your domain port.",use:"Payment and vendor integrations",code:"class StripeAdapter implements PaymentPort {\n  charge(m: Money) { return stripe.pay(m.cents) }\n}" },
  { name:"Bridge",family:"Structural",intent:"Vary abstraction and implementation separately.",use:"Notifications across channels",code:"class Alert { constructor(private sender: Sender) {}\n  publish(msg:string) { this.sender.send(msg) }\n}" },
  { name:"Composite",family:"Structural",intent:"Treat individual and grouped objects uniformly.",use:"File trees and permissions",code:"class Folder implements Node {\n  constructor(private children: Node[]) {}\n  size(){ return this.children.reduce((n,c)=>n+c.size(),0) }\n}" },
  { name:"Decorator",family:"Structural",intent:"Add behavior without changing the object.",use:"Caching, logging, authorization",code:"const cached: UserRepo = new CachedRepo(\n  new PostgresUserRepo(db), redis\n)" },
  { name:"Facade",family:"Structural",intent:"Expose a simple front to a complex subsystem.",use:"Checkout and deployment workflows",code:"class CheckoutFacade {\n  place(cmd: OrderCmd){ return reserve().then(pay).then(ship) }\n}" },
  { name:"Flyweight",family:"Structural",intent:"Share repeated immutable state.",use:"Large maps and text rendering",code:"const style = stylePool.get('warning')\nreturn new Label(text, style)" },
  { name:"Proxy",family:"Structural",intent:"Control access to another object.",use:"Lazy loading and remote calls",code:"class RetryingClient implements Api {\n  get(id:string){ return retry(()=>remote.get(id)) }\n}" },
  { name:"Chain of Responsibility",family:"Behavioral",intent:"Pass work through ordered handlers.",use:"HTTP middleware pipelines",code:"const pipeline = auth(rateLimit(validate(handler)))" },
  { name:"Command",family:"Behavioral",intent:"Represent an action as data.",use:"Queues, undo, audit trails",code:"type Command = { execute(): Promise<void> }\nawait bus.dispatch(new ShipOrder(id))" },
  { name:"Interpreter",family:"Behavioral",intent:"Evaluate a small domain language.",use:"Rules and filter expressions",code:"const rule = and(isActive(), hasRole('admin'))\nrule.evaluate(user)" },
  { name:"Iterator",family:"Behavioral",intent:"Traverse without exposing representation.",use:"Pagination and collections",code:"for await (const page of cursor.pages()) {\n  await index(page)\n}" },
  { name:"Mediator",family:"Behavioral",intent:"Centralize communication between peers.",use:"UI controls and workflows",code:"mediator.on('payment.ok', () => inventory.reserve())" },
  { name:"Memento",family:"Behavioral",intent:"Capture state for later restoration.",use:"Undo and workflow snapshots",code:"history.push(editor.snapshot())\neditor.restore(history.pop())" },
  { name:"Observer",family:"Behavioral",intent:"Notify subscribers when state changes.",use:"Events and reactive interfaces",code:"order.on('shipped', emailCustomer)\norder.on('shipped', updateAnalytics)" },
  { name:"State",family:"Behavioral",intent:"Change behavior when internal state changes.",use:"Order and connection lifecycles",code:"order.transition(new ShippedState())\norder.cancel() // rejected by state" },
  { name:"Strategy",family:"Behavioral",intent:"Swap an algorithm behind one interface.",use:"Pricing and routing policies",code:"class Checkout {\n  constructor(private pricing: PricingStrategy) {}\n  total(cart:Cart){ return this.pricing.calculate(cart) }\n}" },
  { name:"Template Method",family:"Behavioral",intent:"Define a workflow with overridable steps.",use:"Imports and report generation",code:"abstract class Importer {\n  run(){ return this.read().then(this.validate).then(this.save) }\n}" },
  { name:"Visitor",family:"Behavioral",intent:"Add operations without changing element classes.",use:"ASTs and document exporters",code:"document.accept(new HtmlExportVisitor())" },
  { name:"Repository",family:"Enterprise",intent:"Separate domain logic from persistence.",use:"Testable database boundaries",code:"interface OrderRepo {\n  byId(id:string): Promise<Order|null>\n  save(order:Order): Promise<void>\n}" },
  { name:"Unit of Work",family:"Enterprise",intent:"Commit related changes atomically.",use:"Transactional application services",code:"await uow.run(async tx => {\n  await tx.orders.save(order)\n  await tx.outbox.add(event)\n})" },
];

export const hldModules = [
  { title:"1. Frame the problem", body:"Clarify users, functional requirements, non-functional requirements, constraints, scope, and explicit non-goals.", exercise:"Define the five most important requirements for a URL shortener." },
  { title:"2. Estimate scale", body:"Quantify reads, writes, storage, bandwidth, object size, peak multiplier, and growth. Estimates guide decisions; they are not decoration.", exercise:"Calculate peak RPS for 100M daily reads with a 4× peak." },
  { title:"3. Define contracts", body:"Model core entities and design external APIs before choosing infrastructure. Add pagination, idempotency, versioning, and error semantics.", exercise:"Design POST /links and GET /:alias." },
  { title:"4. Draw the high-level flow", body:"Start with client, edge, load balancer, stateless compute, cache, durable data, async events, and observability.", exercise:"Trace the write and read paths independently." },
  { title:"5. Choose data models", body:"Select relational, document, key-value, graph, search, or time-series storage from access patterns and consistency needs.", exercise:"Choose a store and primary key for alias lookup." },
  { title:"6. Scale reads and writes", body:"Apply caching, CDN, replicas, partitioning, batching, and queues only where the measured bottleneck demands them.", exercise:"Compare cache-aside and write-through behavior." },
  { title:"7. Design for failure", body:"Use timeouts, bounded retries, circuit breakers, bulkheads, idempotency, backpressure, failover, and graceful degradation.", exercise:"Handle database unavailability without duplicate links." },
  { title:"8. Prove operability", body:"Define SLIs, SLOs, dashboards, alerts, tracing, capacity thresholds, runbooks, backup restore tests, and rollout strategy.", exercise:"Write a 99.95% availability SLO and error budget." },
];

export const ddiaModules = [
  ["Reliable, scalable, maintainable", "Measure load with domain-specific parameters; evaluate latency using percentiles; design for hardware, software, and human failure."],
  ["Data models and queries", "Choose relational, document, graph, or key-value models by relationships, access patterns, evolvability, and query needs."],
  ["Storage and retrieval", "Understand logs, hash indexes, B-trees, LSM trees, compaction, column stores, materialized views, and OLTP versus analytics."],
  ["Encoding and evolution", "Evolve schemas with backward and forward compatibility across databases, services, queues, and rolling deployments."],
  ["Replication", "Compare leader-follower, multi-leader, and leaderless replication; reason about lag, conflicts, quorums, and failover."],
  ["Partitioning", "Select keys to distribute load, avoid hotspots, route requests, rebalance safely, and coordinate secondary indexes."],
  ["Transactions", "Know isolation levels, anomalies, serializability, distributed transactions, and when application invariants require coordination."],
  ["Distributed systems", "Assume partial failure, unreliable clocks, process pauses, and network delay; use fencing tokens and consensus where necessary."],
  ["Batch processing", "Build repeatable dataflows with immutable input, partitioned work, joins, materialized outputs, and recovery from failed tasks."],
  ["Stream processing", "Model events as durable logs; handle event time, windows, joins, replay, change-data capture, and exactly-once effects."],
];
