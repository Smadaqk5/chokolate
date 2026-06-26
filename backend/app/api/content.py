from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.auth.security import require_admin, require_staff
from app.database import get_db
from app.models import (
    BusinessSettings,
    ContactMessage,
    GalleryCategory,
    GalleryImage,
    HomepageBanner,
    Product,
    ProductImage,
    Review,
    User,
)
from app.schemas.misc import (
    BannerResponse,
    BusinessSettingsResponse,
    BusinessSettingsUpdate,
    ContactMessageCreate,
    ContactMessageResponse,
    GalleryImageResponse,
    ReviewCreate,
    ReviewResponse,
    ReviewUpdate,
)
from app.services.upload_service import delete_file, save_upload

router = APIRouter(tags=["Content"])


@router.get("/settings", response_model=BusinessSettingsResponse)
def get_settings(db: Annotated[Session, Depends(get_db)]):
    settings = db.query(BusinessSettings).first()
    if not settings:
        settings = BusinessSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return BusinessSettingsResponse.model_validate(settings)


@router.put("/settings", response_model=BusinessSettingsResponse)
def update_settings(
    data: BusinessSettingsUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
):
    settings = db.query(BusinessSettings).first()
    if not settings:
        settings = BusinessSettings()
        db.add(settings)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(settings, field, value)
    db.commit()
    db.refresh(settings)
    return BusinessSettingsResponse.model_validate(settings)


@router.get("/banners", response_model=list[BannerResponse])
def list_banners(db: Annotated[Session, Depends(get_db)]):
    return db.query(HomepageBanner).filter(HomepageBanner.is_active == True).order_by(HomepageBanner.display_order).all()


@router.get("/gallery", response_model=list[GalleryImageResponse])
def list_gallery(db: Annotated[Session, Depends(get_db)]):
    return db.query(GalleryImage).filter(GalleryImage.is_visible == True).order_by(GalleryImage.display_order).all()


@router.get("/reviews", response_model=list[ReviewResponse])
def list_reviews(db: Annotated[Session, Depends(get_db)], product_id: str | None = None):
    query = db.query(Review).filter(Review.is_approved == True, Review.is_visible == True)
    if product_id:
        query = query.filter(Review.product_id == product_id)
    reviews = query.order_by(Review.created_at.desc()).limit(50).all()
    result = []
    for r in reviews:
        resp = ReviewResponse.model_validate(r)
        if r.user:
            resp.user_name = f"{r.user.first_name} {r.user.last_name}"
        if r.product:
            resp.product_name = r.product.name
        result.append(resp)
    return result


@router.post("/reviews", response_model=ReviewResponse)
def create_review(
    data: ReviewCreate,
    db: Annotated[Session, Depends(get_db)],
):
    if data.rating < 1 or data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    review = Review(
        product_id=data.product_id,
        rating=data.rating,
        comment=data.comment,
        guest_name=data.guest_name,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return ReviewResponse.model_validate(review)


@router.post("/contact", response_model=ContactMessageResponse)
def submit_contact(data: ContactMessageCreate, db: Annotated[Session, Depends(get_db)]):
    msg = ContactMessage(**data.model_dump())
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return ContactMessageResponse.model_validate(msg)


@router.post("/upload/{folder}")
async def upload_file(
    folder: str,
    file: UploadFile = File(...),
    _: Annotated[User, Depends(require_staff)] = None,
):
    allowed = {"products", "categories", "gallery", "banners", "logos", "uploads", "reviews"}
    if folder not in allowed:
        raise HTTPException(status_code=400, detail="Invalid upload folder")
    path = await save_upload(file, folder)
    return {"path": path, "url": f"/media/{path}"}


@router.post("/products/{product_id}/images")
async def upload_product_image(
    product_id: str,
    file: UploadFile = File(...),
    is_cover: bool = False,
    db: Annotated[Session, Depends(get_db)] = None,
    _: Annotated[User, Depends(require_staff)] = None,
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    path = await save_upload(file, "products")
    if is_cover:
        for img in product.images:
            img.is_cover = False
    image = ProductImage(product_id=product_id, image_path=path, is_cover=is_cover, display_order=len(product.images))
    db.add(image)
    db.commit()
    db.refresh(image)
    return {"id": image.id, "path": path, "url": f"/media/{path}"}
