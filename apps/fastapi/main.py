import asyncio
import json
from typing import Any, AsyncIterator, Literal
from uuid import uuid4

from fastapi import (
    BackgroundTasks,
    FastAPI,
    File,
    HTTPException,
    UploadFile,
    WebSocket,
    status,
)
from pydantic import BaseModel, Field
from starlette.responses import StreamingResponse

app = FastAPI(title="Ship It Today Public API Lab", version="1.0.0")


class ExecuteRequest(BaseModel):
    method: Literal["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]
    path: str = Field(min_length=1, max_length=180)
    payload: Any | None = None


class InferenceRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=4000)
    model: Literal["fast", "quality"] = "fast"
    use_rag: bool = True
    max_tokens: int = Field(default=512, ge=16, le=4096)


jobs: dict[str, dict[str, Any]] = {}


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ready", "framework": "fastapi"}


@app.get("/api/v1/public-lab/catalog")
async def catalog() -> dict[str, Any]:
    return {"success": True, "message": "Public API learning catalog", "data": {"lanes": ["public", "authentication", "ecommerce", "todos", "social", "files", "http"], "framework": "fastapi"}}


@app.post("/api/v1/public-lab/execute")
async def execute(command: ExecuteRequest) -> dict[str, Any]:
    return {"success": True, "message": f"{command.method} simulation completed", "data": {"path": command.path, "payload": command.payload, "processedBy": "fastapi"}}


@app.post("/api/v1/public-lab/images", status_code=status.HTTP_201_CREATED)
async def upload_image(image: UploadFile = File(...)) -> dict[str, Any]:
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=415, detail="An image file is required")
    content = await image.read()
    if len(content) > 5_000_000:
        raise HTTPException(status_code=413, detail="Image exceeds 5 MB")
    return {"success": True, "message": "Image accepted", "data": {"filename": image.filename, "mimetype": image.content_type, "size": len(content)}}


@app.post("/api/v1/ai/inference")
async def inference(command: InferenceRequest) -> dict[str, Any]:
    return {
        "data": {
            "route": command.model,
            "stream": False,
            "retrievedChunks": 4 if command.use_rag else 0,
            "maxTokens": command.max_tokens,
            "safety": "passed",
        }
    }


@app.post("/api/v1/ai/stream")
async def stream_inference(command: InferenceRequest) -> StreamingResponse:
    async def events() -> AsyncIterator[str]:
        stream = [
            ("response.created", {"model": command.model}),
            ("content.delta", {"text": "A scalable GenAI backend "}),
            ("tool.call", {"name": "search_architecture"}),
            ("tool.result", {"documents": 4}),
            ("content.delta", {"text": "streams typed events over SSE."}),
            ("response.completed", {"finishReason": "stop"}),
        ]
        for event_type, payload in stream:
            yield f"event: {event_type}\ndata: {json.dumps(payload)}\n\n"
            await asyncio.sleep(0.22)

    return StreamingResponse(
        events(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.websocket("/api/v1/ai/realtime")
async def realtime(websocket: WebSocket) -> None:
    await websocket.accept()
    await websocket.send_json({"type": "session.created", "transport": "websocket"})
    while True:
        message = await websocket.receive_text()
        await websocket.send_json({"type": "input.accepted", "bytes": len(message)})
        await websocket.send_json(
            {
                "type": "response.delta",
                "text": "Bidirectional events belong on WebSocket.",
            }
        )


async def complete_job(job_id: str) -> None:
    jobs[job_id]["status"] = "running"
    jobs[job_id]["progress"] = 45
    await asyncio.sleep(1.2)
    if jobs[job_id]["status"] != "cancelled":
        jobs[job_id].update(
            status="completed",
            progress=100,
            result="Background generation completed and stored durably.",
        )


@app.post("/api/v1/ai/jobs", status_code=status.HTTP_202_ACCEPTED)
async def create_job(
    command: InferenceRequest,
    background_tasks: BackgroundTasks,
) -> dict[str, Any]:
    job_id = f"job_{uuid4().hex[:8]}"
    jobs[job_id] = {
        "id": job_id,
        "status": "queued",
        "progress": 0,
        "prompt": command.prompt,
    }
    background_tasks.add_task(complete_job, job_id)
    return {
        "data": jobs[job_id],
        "links": {"status": f"/api/v1/ai/jobs/{job_id}"},
    }


@app.get("/api/v1/ai/jobs/{job_id}")
async def get_job(job_id: str) -> dict[str, Any]:
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Generation job not found")
    return {"data": jobs[job_id]}


@app.delete("/api/v1/ai/jobs/{job_id}", status_code=status.HTTP_202_ACCEPTED)
async def cancel_job(job_id: str) -> dict[str, Any]:
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Generation job not found")
    jobs[job_id].update(status="cancelled", progress=0)
    return {"data": jobs[job_id]}
