# FastAPI learning service

This service mirrors the public API simulator implemented in Fastify. It includes Pydantic validation, generated OpenAPI docs, and a bounded multipart image upload.

```bash
python -m venv .venv
pip install -r requirements.txt
uvicorn main:app --reload --port 4100
```

Open `http://localhost:4100/docs` for Swagger UI.
