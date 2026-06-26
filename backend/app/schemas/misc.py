from datetime import datetime

from pydantic import BaseModel, EmailStr


class ReviewCreate(BaseModel):
    product_id: str
    rating: int
    comment: str | None = None
    guest_name: str | None = None


class ReviewResponse(BaseModel):
    id: str
    product_id: str
    user_id: str | None
    guest_name: str | None
    rating: int
    comment: str | None
    photos: str | None
    is_approved: bool
    admin_reply: str | None
    is_visible: bool
    created_at: datetime
    user_name: str | None = None
    product_name: str | None = None

    model_config = {"from_attributes": True}


class ReviewUpdate(BaseModel):
    is_approved: bool | None = None
    admin_reply: str | None = None
    is_visible: bool | None = None


class ContactMessageCreate(BaseModel):
    name: str
    phone: str | None = None
    email: EmailStr
    subject: str
    message: str


class ContactMessageResponse(BaseModel):
    id: str
    name: str
    phone: str | None
    email: str
    subject: str
    message: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class BusinessSettingsResponse(BaseModel):
    id: str
    business_name: str
    logo: str | None
    email: str | None
    phone: str | None
    whatsapp: str | None
    address: str | None
    pickup_location: str | None
    google_maps_link: str | None
    google_maps_embed: str | None
    business_hours: str | None
    currency: str
    mpesa_till_number: str | None
    delivery_charge: float
    social_links: str | None
    updated_at: datetime

    model_config = {"from_attributes": True}


class BusinessSettingsUpdate(BaseModel):
    business_name: str | None = None
    logo: str | None = None
    email: str | None = None
    phone: str | None = None
    whatsapp: str | None = None
    address: str | None = None
    pickup_location: str | None = None
    google_maps_link: str | None = None
    google_maps_embed: str | None = None
    business_hours: str | None = None
    currency: str | None = None
    mpesa_till_number: str | None = None
    delivery_charge: float | None = None
    social_links: str | None = None


class BannerResponse(BaseModel):
    id: str
    title: str
    subtitle: str | None
    button_text: str | None
    button_link: str | None
    image_path: str
    display_order: int
    is_active: bool

    model_config = {"from_attributes": True}


class GalleryImageResponse(BaseModel):
    id: str
    category_id: str | None
    title: str | None
    image_path: str
    display_order: int
    is_visible: bool

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    total_orders: int
    pending_orders: int
    total_revenue: float
    total_customers: int
    total_products: int
    low_stock_products: int
    pending_reviews: int
    recent_orders: list[OrderResponse] = []


from app.schemas.orders import OrderResponse  # noqa: E402

DashboardStats.model_rebuild()
