# Ship It Today architecture

## Product surfaces

- `app/`: Next.js 16-compatible interactive learning experience, built with React and TypeScript.
- `apps/api/`: Fastify service organized by feature modules, plugins, and integration tests.
- `docs/`: architecture decisions and production guidance.

## Production reference architecture

```text
Browser → CDN/WAF → Next.js web
                    ↓
               API Gateway
                    ↓
             Fastify services → Redis
                    ↓              ↓
                 Kafka ← workers / Celery-compatible job consumers
                    ↓
          Postgres primary → read replicas
                    ↓
          shard router → regional shards
```

Run stateless web and API containers in Kubernetes with horizontal pod autoscaling. Send durable domain events through Kafka. Use a task queue for retriable background jobs, idempotency keys for writes, and transactional outbox records to avoid dual-write loss.

## Performance choices

- Motion uses `transform`, `opacity`, and CSS-only layers to avoid layout thrashing.
- Interactive predictions are memoized and require no network round trip.
- The API uses schema validation, structured logging, request IDs, versioned routes, and consistent errors.
- Charts are CSS-rendered, so there is no large charting bundle on the critical path.
- `prefers-reduced-motion` is honored for accessibility and lower-power devices.

## Scaling sequence

1. Measure with RED metrics: request rate, errors, and duration.
2. Add indexes and fix query plans before adding database hardware.
3. Cache hot, safe-to-stale reads with explicit TTLs.
4. Scale stateless services horizontally and protect them with rate limits.
5. Move slow work to queues and make consumers idempotent.
6. Add read replicas, then partition or shard only after simpler options are exhausted.
