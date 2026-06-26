from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.api import admin, auth, catalog, content, orders
from app.config import get_settings
from app.services.upload_service import ensure_media_dirs

settings = get_settings()

app = FastAPI(
    title=f"{settings.app_name} API",
    description="Premium luxury gifting e-commerce platform",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ensure_media_dirs()
media_path = Path(settings.media_root)
media_path.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=str(media_path)), name="media")

app.include_router(auth.router, prefix="/api")
app.include_router(catalog.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(content.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


@app.get("/")
def root():
    return {"message": f"Welcome to {settings.app_name} API", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}
