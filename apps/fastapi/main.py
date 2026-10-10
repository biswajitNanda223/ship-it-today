from typing import Any, Literal

from fastapi import FastAPI, File, HTTPException, UploadFile, status
from pydantic import BaseModel, Field

app = FastAPI(title="Ship It Today Public API Lab", version="1.0.0")


class ExecuteRequest(BaseModel):
    method: Literal["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]
    path: str = Field(min_length=1, max_length=180)
    payload: Any | None = None


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
