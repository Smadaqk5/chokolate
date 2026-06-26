from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class OrderItemCreate(BaseModel):
    product_id: str
    variation_id: str | None = None
    quantity: int = Field(ge=1)
    customization: str | None = None


class DeliveryInfoCreate(BaseModel):
    recipient_name: str
    address: str
    city: str
    landmark: str | None = None
    delivery_notes: str | None = None
    phone: str | None = None


class PickupInfoCreate(BaseModel):
    pickup_date: str | None = None
    pickup_time: str | None = None


class OrderCreate(BaseModel):
    items: list[OrderItemCreate]
    delivery_method: str
    delivery_info: DeliveryInfoCreate | None = None
    pickup_info: PickupInfoCreate | None = None
    preferred_date: str | None = None
    preferred_time: str | None = None
    gift_message: str | None = None
    notes: str | None = None
    guest_name: str | None = None
    guest_email: EmailStr | None = None
    guest_phone: str | None = None
    delivery_zone_id: str | None = None


class OrderItemResponse(BaseModel):
    id: str
    product_id: str | None
    product_name: str
    product_sku: str
    variation_name: str | None
    quantity: int
    unit_price: float
    total_price: float
    customization: str | None

    model_config = {"from_attributes": True}


class DeliveryInfoResponse(BaseModel):
    recipient_name: str
    address: str
    city: str
    landmark: str | None
    delivery_notes: str | None
    phone: str | None

    model_config = {"from_attributes": True}


class PickupInfoResponse(BaseModel):
    pickup_date: str | None
    pickup_time: str | None
    collected: bool
    collected_by: str | None

    model_config = {"from_attributes": True}


class PaymentResponse(BaseModel):
    id: str
    amount: float
    payment_method: str
    till_number: str | None
    mpesa_reference: str | None
    payer_phone: str | None
    status: str
    payment_date: datetime | None

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: str
    order_number: str
    customer_id: str | None
    guest_email: str | None
    guest_phone: str | None
    guest_name: str | None
    subtotal: float
    delivery_fee: float
    discount: float
    total: float
    payment_status: str
    order_status: str
    delivery_method: str
    preferred_date: str | None
    preferred_time: str | None
    gift_message: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime
    items: list[OrderItemResponse] = []
    delivery_info: DeliveryInfoResponse | None = None
    pickup_info: PickupInfoResponse | None = None
    payment: PaymentResponse | None = None

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    order_status: str
    internal_notes: str | None = None


class PaymentVerifyRequest(BaseModel):
    mpesa_reference: str | None = None
    payer_phone: str | None = None


class OrderListResponse(BaseModel):
    items: list[OrderResponse]
    total: int
    page: int
    page_size: int
    pages: int
