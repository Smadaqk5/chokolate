from datetime import datetime

from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    name: str
    slug: str | None = None
    description: str | None = None
    image: str | None = None
    banner_image: str | None = None
    icon: str | None = None
    parent_category_id: str | None = None
    display_order: int = 0
    is_featured: bool = False
    is_active: bool = True
    seo_title: str | None = None
    seo_description: str | None = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    image: str | None = None
    banner_image: str | None = None
    icon: str | None = None
    parent_category_id: str | None = None
    display_order: int | None = None
    is_featured: bool | None = None
    is_active: bool | None = None
    seo_title: str | None = None
    seo_description: str | None = None


class CategoryResponse(CategoryBase):
    id: str
    slug: str
    created_at: datetime
    updated_at: datetime
    product_count: int = 0

    model_config = {"from_attributes": True}


class ProductImageResponse(BaseModel):
    id: str
    image_path: str
    display_order: int
    is_cover: bool

    model_config = {"from_attributes": True}


class ProductVariationResponse(BaseModel):
    id: str
    variation_name: str
    price: float
    stock: int
    sku: str

    model_config = {"from_attributes": True}


class ProductBase(BaseModel):
    category_id: str
    name: str
    slug: str | None = None
    short_description: str | None = None
    full_description: str | None = None
    sku: str
    barcode: str | None = None
    regular_price: float
    sale_price: float | None = None
    stock_quantity: int = 0
    low_stock_level: int = 5
    weight: float | None = None
    preparation_time: int | None = None
    featured: bool = False
    best_seller: bool = False
    new_arrival: bool = False
    customizable: bool = False
    gift_box_item: bool = True
    pickup_available: bool = True
    delivery_available: bool = True
    status: str = "active"
    seo_title: str | None = None
    seo_description: str | None = None
    occasion_ids: list[str] = []


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    category_id: str | None = None
    name: str | None = None
    slug: str | None = None
    short_description: str | None = None
    full_description: str | None = None
    sku: str | None = None
    barcode: str | None = None
    regular_price: float | None = None
    sale_price: float | None = None
    stock_quantity: int | None = None
    low_stock_level: int | None = None
    weight: float | None = None
    preparation_time: int | None = None
    featured: bool | None = None
    best_seller: bool | None = None
    new_arrival: bool | None = None
    customizable: bool | None = None
    gift_box_item: bool | None = None
    pickup_available: bool | None = None
    delivery_available: bool | None = None
    status: str | None = None
    seo_title: str | None = None
    seo_description: str | None = None
    occasion_ids: list[str] | None = None


class ProductResponse(ProductBase):
    id: str
    slug: str
    status: str
    created_at: datetime
    updated_at: datetime
    images: list[ProductImageResponse] = []
    variations: list[ProductVariationResponse] = []
    category_name: str | None = None
    effective_price: float = 0
    average_rating: float = 0
    review_count: int = 0

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    page_size: int
    pages: int


class OccasionResponse(BaseModel):
    id: str
    name: str
    slug: str
    image: str | None
    description: str | None
    display_order: int
    is_active: bool
    product_count: int = 0

    model_config = {"from_attributes": True}
