# FastAPI learning service

This Python service powers the public API and object-oriented design labs. It includes Pydantic validation, generated OpenAPI docs, a bounded multipart image upload, GenAI transport examples, and eleven original OOD scenarios.

```bash
python -m venv .venv
pip install -r requirements.txt
uvicorn main:app --reload --port 4100
```

Open `http://localhost:4100/docs` for Swagger UI.

## OOD interview lab

```bash
curl http://localhost:4100/api/v1/ood/scenarios

curl -X POST http://localhost:4100/api/v1/ood/scenarios/parking-lot/commands \
  -H "Content-Type: application/json" \
  -d '{"command":"enter","payload":{"vehicle_id":"car-42"},"idempotency_key":"entry-000042"}'
```

The lessons and API examples are original educational material. ByteByteGo is an external study reference; this project is not affiliated with ByteByteGo.
