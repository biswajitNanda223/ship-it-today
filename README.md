# Ship It Today

An animated, interactive engineering world for learning high-level design, low-level design, APIs, databases, cloud infrastructure, Docker, Kubernetes, Kafka, queues, sharding, observability, and design patterns by doing.

## What is included

- Interactive capacity lab with live traffic, replica, cache, utilization, and p95-latency predictions
- REST, GraphQL, and WebSocket API dojo with animated request flow
- GenAI backend studio covering AI gateways, RAG, streaming, tool execution, semantic caching, fallbacks, safety, evaluation, and cost controls
- A 26-page visual academy with separate HLD case studies, LLD exercises, UML/DFD/ERD lessons, REST API deep dives, and Netflix/Tinder/Zomato designs
- Seven dedicated REST method playgrounds for GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS
- Animated architecture players with play, pause, replay, highlighted stages, code examples, and chapter navigation
- Scroll-triggered reveals, live architecture flows, and dependency-free performance graphs
- Guided HLD, LLD, cloud, and data-engineering mission tracks
- Production-minded Fastify API with validation, request IDs, structured errors, and tests
- Responsive UI, reduced-motion support, and GPU-friendly animation primitives
- Detailed architecture and scaling notes in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

## Stack

- Web: Next.js 16, React 19, TypeScript, CSS
- API: Fastify, TypeScript, `@fastify/cors`
- Hosting: Vercel (web) with a standalone Fastify service ready for container hosting
- Testing: Node test runner and Fastify injection

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

In a second terminal, start the learning API:

```bash
npm run api:dev
```

Web runs at `http://localhost:3000`; the API defaults to `http://localhost:4000`.

## Quality checks

```bash
npm run build
npm run lint
npm run api:test
```

## API examples

```bash
curl http://localhost:4000/health
curl http://localhost:4000/api/v1/courses
curl -X POST http://localhost:4000/api/v1/simulations/capacity \
  -H "content-type: application/json" \
  -d '{"requestsPerSecond":4200,"replicas":4,"cacheEnabled":true}'
curl -X POST http://localhost:4000/api/v1/ai/inference \
  -H "content-type: application/json" \
  -d '{"prompt":"Design a global feed","model":"quality","useRag":true,"maxTokens":1200}'
```

## Repository structure

```text
app/                    Next.js UI, learning routes, and global motion system
  learn/                Academy hubs and statically generated lesson pages
apps/api/src/           Fastify application
  modules/              Feature-owned routes
  plugins/              Cross-cutting behavior
apps/api/test/          API integration tests
docs/                   Architecture and operational guidance
public/                 Static assets
```

## Production roadmap

The demo API intentionally uses in-memory course data. For production, add Postgres behind a repository layer, Redis for cached reads and rate limiting, Kafka for domain events, OpenTelemetry traces, and Kubernetes health/readiness probes. Keep secrets in the deployment platform, never in the repository.

## License

MIT
