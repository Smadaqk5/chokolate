from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.auth.security import get_current_user, require_admin, require_staff
from app.database import get_db
from app.models import Category, Occasion, Product, ProductStatus, Review, User
from app.schemas.catalog import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
    OccasionResponse,
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductUpdate,
)
from app.services.order_service import product_to_response
from app.utils.helpers import slugify

router = APIRouter(prefix="/catalog", tags=["Catalog"])


@router.get("/categories", response_model=list[CategoryResponse])
def list_categories(
    db: Annotated[Session, Depends(get_db)],
    active_only: bool = True,
    featured_only: bool = False,
):
    query = db.query(Category)
    if active_only:
        query = query.filter(Category.is_active == True)
    if featured_only:
        query = query.filter(Category.is_featured == True)
    categories = query.order_by(Category.display_order, Category.name).all()
    result = []
    for cat in categories:
        resp = CategoryResponse.model_validate(cat)
        resp.product_count = db.query(Product).filter(Product.category_id == cat.id, Product.status == ProductStatus.ACTIVE).count()
        result.append(resp)
    return result


@router.get("/categories/{slug}", response_model=CategoryResponse)
def get_category(slug: str, db: Annotated[Session, Depends(get_db)]):
    cat = db.query(Category).filter(Category.slug == slug).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    resp = CategoryResponse.model_validate(cat)
    resp.product_count = db.query(Product).filter(Product.category_id == cat.id, Product.status == ProductStatus.ACTIVE).count()
    return resp


@router.post("/categories", response_model=CategoryResponse)
def create_category(
    data: CategoryCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_staff)],
):
    slug = data.slug or slugify(data.name)
    if db.query(Category).filter(Category.slug == slug).first():
        raise HTTPException(status_code=400, detail="Slug already exists")
    cat = Category(**{**data.model_dump(exclude={"slug"}), "slug": slug})
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return CategoryResponse.model_validate(cat)


@router.put("/categories/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: str,
    data: CategoryUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_staff)],
):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(cat, field, value)
    db.commit()
    db.refresh(cat)
    return CategoryResponse.model_validate(cat)


@router.delete("/categories/{category_id}")
def delete_category(
    category_id: str,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(cat)
    db.commit()
    return {"message": "Category deleted"}


@router.get("/occasions", response_model=list[OccasionResponse])
def list_occasions(db: Annotated[Session, Depends(get_db)], active_only: bool = True):
    query = db.query(Occasion)
    if active_only:
        query = query.filter(Occasion.is_active == True)
    occasions = query.order_by(Occasion.display_order, Occasion.name).all()
    result = []
    for occ in occasions:
        resp = OccasionResponse.model_validate(occ)
        resp.product_count = len(occ.products)
        result.append(resp)
    return result


@router.get("/products", response_model=ProductListResponse)
def list_products(
    db: Annotated[Session, Depends(get_db)],
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    category: str | None = None,
    occasion: str | None = None,
    search: str | None = None,
    featured: bool | None = None,
    best_seller: bool | None = None,
    new_arrival: bool | None = None,
    gift_box_item: bool | None = None,
    status: str | None = "active",
    sort: str = "newest",
):
    query = db.query(Product).options(
        joinedload(Product.images),
        joinedload(Product.variations),
        joinedload(Product.category),
        joinedload(Product.occasions),
    )

    if status:
        query = query.filter(Product.status == ProductStatus(status))
    if category:
        cat = db.query(Category).filter(Category.slug == category).first()
        if cat:
            query = query.filter(Product.category_id == cat.id)
    if occasion:
        occ = db.query(Occasion).filter(Occasion.slug == occasion).first()
        if occ:
            query = query.filter(Product.occasions.contains(occ))
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    if featured is not None:
        query = query.filter(Product.featured == featured)
    if best_seller is not None:
        query = query.filter(Product.best_seller == best_seller)
    if new_arrival is not None:
        query = query.filter(Product.new_arrival == new_arrival)
    if gift_box_item is not None:
        query = query.filter(Product.gift_box_item == gift_box_item)

    sort_map = {
        "newest": Product.created_at.desc(),
        "price_asc": Product.regular_price.asc(),
        "price_desc": Product.regular_price.desc(),
        "name": Product.name.asc(),
    }
    query = query.order_by(sort_map.get(sort, Product.created_at.desc()))

    total = query.count()
    products = query.offset((page - 1) * page_size).limit(page_size).all()
    items = [product_to_response(p, db) for p in products]
    pages = (total + page_size - 1) // page_size

    return ProductListResponse(items=items, total=total, page=page, page_size=page_size, pages=pages)


@router.get("/products/{slug}", response_model=ProductResponse)
def get_product(slug: str, db: Annotated[Session, Depends(get_db)]):
    product = db.query(Product).options(
        joinedload(Product.images),
        joinedload(Product.variations),
        joinedload(Product.category),
        joinedload(Product.occasions),
    ).filter(Product.slug == slug).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product_to_response(product, db)


@router.post("/products", response_model=ProductResponse)
def create_product(
    data: ProductCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_staff)],
):
    slug = data.slug or slugify(data.name)
    if db.query(Product).filter(Product.slug == slug).first():
        raise HTTPException(status_code=400, detail="Slug already exists")
    if db.query(Product).filter(Product.sku == data.sku).first():
        raise HTTPException(status_code=400, detail="SKU already exists")

    occasion_ids = data.occasion_ids
    product_data = data.model_dump(exclude={"occasion_ids", "slug"})
    product = Product(**product_data, slug=slug, status=ProductStatus(data.status))

    if occasion_ids:
        occasions = db.query(Occasion).filter(Occasion.id.in_(occasion_ids)).all()
        product.occasions = occasions

    db.add(product)
    db.commit()
    db.refresh(product)
    return product_to_response(product, db)


@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: str,
    data: ProductUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_staff)],
):
    product = db.query(Product).options(joinedload(Product.occasions)).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = data.model_dump(exclude_unset=True)
    occasion_ids = update_data.pop("occasion_ids", None)

    for field, value in update_data.items():
        if field == "status":
            setattr(product, field, ProductStatus(value))
        else:
            setattr(product, field, value)

    if occasion_ids is not None:
        occasions = db.query(Occasion).filter(Occasion.id.in_(occasion_ids)).all()
        product.occasions = occasions

    db.commit()
    db.refresh(product)
    return product_to_response(product, db)


@router.delete("/products/{product_id}")
def delete_product(
    product_id: str,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.status = ProductStatus.ARCHIVED
    db.commit()
    return {"message": "Product archived"}
