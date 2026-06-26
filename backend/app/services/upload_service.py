import os
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile
from PIL import Image

from app.config import get_settings

settings = get_settings()
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_SIZE = settings.max_upload_size_mb * 1024 * 1024


def ensure_media_dirs():
    base = Path(settings.media_root)
    for subdir in ["products", "categories", "gallery", "banners", "logos", "uploads", "reviews"]:
        (base / subdir).mkdir(parents=True, exist_ok=True)


def validate_image(file: UploadFile) -> None:
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")


async def save_upload(file: UploadFile, subfolder: str, optimize: bool = True) -> str:
    validate_image(file)
    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail=f"File too large. Max {settings.max_upload_size_mb}MB")

    ensure_media_dirs()
    ext = Path(file.filename or "image.jpg").suffix.lower()
    filename = f"{uuid.uuid4().hex}{ext}"
    relative_path = f"{subfolder}/{filename}"
    full_path = Path(settings.media_root) / relative_path
    full_path.parent.mkdir(parents=True, exist_ok=True)

    if optimize and ext in {".jpg", ".jpeg", ".png", ".webp"}:
        try:
            from io import BytesIO

            img = Image.open(BytesIO(content))
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            max_dim = 1920
            if max(img.size) > max_dim:
                img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
            img.save(full_path, quality=85, optimize=True)
        except Exception:
            full_path.write_bytes(content)
    else:
        full_path.write_bytes(content)

    return relative_path.replace("\\", "/")


def delete_file(relative_path: str | None) -> None:
    if not relative_path:
        return
    full_path = Path(settings.media_root) / relative_path
    if full_path.exists():
        full_path.unlink()
