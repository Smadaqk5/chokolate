import enum
import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class UserRole(str, enum.Enum):
    ADMIN = "Admin"
    STAFF = "Staff"
    CUSTOMER = "Customer"


class ProductStatus(str, enum.Enum):
    ACTIVE = "active"
    DRAFT = "draft"
    ARCHIVED = "archived"


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    AWAITING_PAYMENT = "awaiting_payment"
    PAYMENT_CONFIRMED = "payment_confirmed"
    PREPARING = "preparing"
    READY_FOR_PICKUP = "ready_for_pickup"
    OUT_FOR_DELIVERY = "out_for_delivery"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    AWAITING = "awaiting"
    CONFIRMED = "confirmed"
    FAILED = "failed"
    REFUNDED = "refunded"


class DeliveryMethod(str, enum.Enum):
    DELIVERY = "delivery"
    PICKUP = "pickup"


class StockMovementType(str, enum.Enum):
    RESTOCK = "restock"
    SALE = "sale"
    ADJUSTMENT = "adjustment"
    RETURN = "return"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.CUSTOMER, index=True)
    profile_photo: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_login: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    orders: Mapped[list["Order"]] = relationship("Order", back_populates="customer")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="user")
    wishlist_items: Mapped[list["WishlistItem"]] = relationship("WishlistItem", back_populates="user")
    addresses: Mapped[list["CustomerAddress"]] = relationship("CustomerAddress", back_populates="user")


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    banner_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    icon: Mapped[str | None] = mapped_column(String(100), nullable=True)
    parent_category_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("categories.id"), nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    seo_title: Mapped[str | None] = mapped_column(String(200), nullable=True)
    seo_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    parent: Mapped["Category | None"] = relationship("Category", remote_side=[id], backref="children")
    products: Mapped[list["Product"]] = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    category_id: Mapped[str] = mapped_column(String(36), ForeignKey("categories.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(300), nullable=False)
    slug: Mapped[str] = mapped_column(String(300), unique=True, index=True, nullable=False)
    short_description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    full_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    sku: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    barcode: Mapped[str | None] = mapped_column(String(100), nullable=True)
    regular_price: Mapped[float] = mapped_column(Float, nullable=False)
    sale_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0)
    low_stock_level: Mapped[int] = mapped_column(Integer, default=5)
    weight: Mapped[float | None] = mapped_column(Float, nullable=True)
    preparation_time: Mapped[int | None] = mapped_column(Integer, nullable=True)
    featured: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    best_seller: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    new_arrival: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    customizable: Mapped[bool] = mapped_column(Boolean, default=False)
    gift_box_item: Mapped[bool] = mapped_column(Boolean, default=True)
    pickup_available: Mapped[bool] = mapped_column(Boolean, default=True)
    delivery_available: Mapped[bool] = mapped_column(Boolean, default=True)
    status: Mapped[ProductStatus] = mapped_column(Enum(ProductStatus), default=ProductStatus.ACTIVE, index=True)
    seo_title: Mapped[str | None] = mapped_column(String(200), nullable=True)
    seo_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category: Mapped["Category"] = relationship("Category", back_populates="products")
    images: Mapped[list["ProductImage"]] = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    variations: Mapped[list["ProductVariation"]] = relationship("ProductVariation", back_populates="product", cascade="all, delete-orphan")
    occasions: Mapped[list["Occasion"]] = relationship("Occasion", secondary="product_occasions", back_populates="products")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="product")


class ProductImage(Base):
    __tablename__ = "product_images"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    product_id: Mapped[str] = mapped_column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    image_path: Mapped[str] = mapped_column(String(500), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    is_cover: Mapped[bool] = mapped_column(Boolean, default=False)

    product: Mapped["Product"] = relationship("Product", back_populates="images")


class ProductVariation(Base):
    __tablename__ = "product_variations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    product_id: Mapped[str] = mapped_column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    variation_name: Mapped[str] = mapped_column(String(200), nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    sku: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    product: Mapped["Product"] = relationship("Product", back_populates="variations")


class Occasion(Base):
    __tablename__ = "occasions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(200), unique=True, index=True, nullable=False)
    image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    products: Mapped[list["Product"]] = relationship("Product", secondary="product_occasions", back_populates="occasions")


class ProductOccasion(Base):
    __tablename__ = "product_occasions"

    product_id: Mapped[str] = mapped_column(String(36), ForeignKey("products.id", ondelete="CASCADE"), primary_key=True)
    occasion_id: Mapped[str] = mapped_column(String(36), ForeignKey("occasions.id", ondelete="CASCADE"), primary_key=True)


class GiftBox(Base):
    __tablename__ = "gift_boxes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    box_size: Mapped[str] = mapped_column(String(50), default="medium")
    ribbon_color: Mapped[str | None] = mapped_column(String(50), nullable=True)
    gift_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    total_price: Mapped[float] = mapped_column(Float, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    items: Mapped[list["GiftBoxItem"]] = relationship("GiftBoxItem", back_populates="gift_box", cascade="all, delete-orphan")


class GiftBoxItem(Base):
    __tablename__ = "gift_box_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    gift_box_id: Mapped[str] = mapped_column(String(36), ForeignKey("gift_boxes.id", ondelete="CASCADE"), nullable=False)
    product_id: Mapped[str] = mapped_column(String(36), ForeignKey("products.id"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    customization: Mapped[str | None] = mapped_column(Text, nullable=True)

    gift_box: Mapped["GiftBox"] = relationship("GiftBox", back_populates="items")
    product: Mapped["Product"] = relationship("Product")


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    order_number: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    customer_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    guest_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    guest_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    guest_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    subtotal: Mapped[float] = mapped_column(Float, nullable=False)
    delivery_fee: Mapped[float] = mapped_column(Float, default=0)
    discount: Mapped[float] = mapped_column(Float, default=0)
    total: Mapped[float] = mapped_column(Float, nullable=False)
    payment_status: Mapped[PaymentStatus] = mapped_column(Enum(PaymentStatus), default=PaymentStatus.AWAITING, index=True)
    order_status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default=OrderStatus.AWAITING_PAYMENT, index=True)
    delivery_method: Mapped[DeliveryMethod] = mapped_column(Enum(DeliveryMethod), nullable=False)
    preferred_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    preferred_time: Mapped[str | None] = mapped_column(String(50), nullable=True)
    gift_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    internal_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer: Mapped["User | None"] = relationship("User", back_populates="orders")
    items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payment: Mapped["Payment | None"] = relationship("Payment", back_populates="order", uselist=False, cascade="all, delete-orphan")
    delivery_info: Mapped["DeliveryInformation | None"] = relationship("DeliveryInformation", back_populates="order", uselist=False, cascade="all, delete-orphan")
    pickup_info: Mapped["PickupInformation | None"] = relationship("PickupInformation", back_populates="order", uselist=False, cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    order_id: Mapped[str] = mapped_column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("products.id"), nullable=True)
    product_name: Mapped[str] = mapped_column(String(300), nullable=False)
    product_sku: Mapped[str] = mapped_column(String(100), nullable=False)
    variation_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[float] = mapped_column(Float, nullable=False)
    total_price: Mapped[float] = mapped_column(Float, nullable=False)
    customization: Mapped[str | None] = mapped_column(Text, nullable=True)

    order: Mapped["Order"] = relationship("Order", back_populates="items")
    product: Mapped["Product | None"] = relationship("Product")


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    order_id: Mapped[str] = mapped_column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), unique=True, nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    payment_method: Mapped[str] = mapped_column(String(50), default="mpesa")
    till_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    mpesa_reference: Mapped[str | None] = mapped_column(String(100), nullable=True)
    payer_phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    payment_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    verified_by: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    status: Mapped[PaymentStatus] = mapped_column(Enum(PaymentStatus), default=PaymentStatus.AWAITING)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    order: Mapped["Order"] = relationship("Order", back_populates="payment")


class DeliveryInformation(Base):
    __tablename__ = "delivery_information"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    order_id: Mapped[str] = mapped_column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), unique=True, nullable=False)
    recipient_name: Mapped[str] = mapped_column(String(200), nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    landmark: Mapped[str | None] = mapped_column(String(300), nullable=True)
    delivery_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)

    order: Mapped["Order"] = relationship("Order", back_populates="delivery_info")


class PickupInformation(Base):
    __tablename__ = "pickup_information"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    order_id: Mapped[str] = mapped_column(String(36), ForeignKey("orders.id", ondelete="CASCADE"), unique=True, nullable=False)
    pickup_date: Mapped[str | None] = mapped_column(String(20), nullable=True)
    pickup_time: Mapped[str | None] = mapped_column(String(50), nullable=True)
    collected: Mapped[bool] = mapped_column(Boolean, default=False)
    collected_by: Mapped[str | None] = mapped_column(String(200), nullable=True)
    collected_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    order: Mapped["Order"] = relationship("Order", back_populates="pickup_info")


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    product_id: Mapped[str] = mapped_column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    guest_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    photos: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    admin_reply: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    product: Mapped["Product"] = relationship("Product", back_populates="reviews")
    user: Mapped["User | None"] = relationship("User", back_populates="reviews")


class GalleryCategory(Base):
    __tablename__ = "gallery_categories"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)

    images: Mapped[list["GalleryImage"]] = relationship("GalleryImage", back_populates="category")


class GalleryImage(Base):
    __tablename__ = "gallery_images"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    category_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("gallery_categories.id"), nullable=True)
    title: Mapped[str | None] = mapped_column(String(200), nullable=True)
    image_path: Mapped[str] = mapped_column(String(500), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    category: Mapped["GalleryCategory | None"] = relationship("GalleryCategory", back_populates="images")


class HomepageBanner(Base):
    __tablename__ = "homepage_banners"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    subtitle: Mapped[str | None] = mapped_column(String(500), nullable=True)
    button_text: Mapped[str | None] = mapped_column(String(100), nullable=True)
    button_link: Mapped[str | None] = mapped_column(String(500), nullable=True)
    image_path: Mapped[str] = mapped_column(String(500), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    start_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    end_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class BusinessSettings(Base):
    __tablename__ = "business_settings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    business_name: Mapped[str] = mapped_column(String(200), default="Phylgood Chocolates")
    logo: Mapped[str | None] = mapped_column(String(500), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    whatsapp: Mapped[str | None] = mapped_column(String(20), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    pickup_location: Mapped[str | None] = mapped_column(Text, nullable=True)
    google_maps_link: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    google_maps_embed: Mapped[str | None] = mapped_column(Text, nullable=True)
    business_hours: Mapped[str | None] = mapped_column(Text, nullable=True)
    currency: Mapped[str] = mapped_column(String(10), default="KES")
    mpesa_till_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    delivery_charge: Mapped[float] = mapped_column(Float, default=500)
    social_links: Mapped[str | None] = mapped_column(Text, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DeliveryZone(Base):
    __tablename__ = "delivery_zones"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    delivery_fee: Mapped[float] = mapped_column(Float, default=500)
    estimated_time: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    product_id: Mapped[str] = mapped_column(String(36), ForeignKey("products.id"), nullable=False, index=True)
    movement_type: Mapped[StockMovementType] = mapped_column(Enum(StockMovementType), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    previous_stock: Mapped[int] = mapped_column(Integer, nullable=False)
    new_stock: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    performed_by: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    product: Mapped["Product"] = relationship("Product")


class WishlistItem(Base):
    __tablename__ = "wishlist_items"
    __table_args__ = (UniqueConstraint("user_id", "product_id", name="uq_wishlist_user_product"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id: Mapped[str] = mapped_column(String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="wishlist_items")
    product: Mapped["Product"] = relationship("Product")


class CustomerAddress(Base):
    __tablename__ = "customer_addresses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    label: Mapped[str] = mapped_column(String(100), default="Home")
    recipient_name: Mapped[str] = mapped_column(String(200), nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    landmark: Mapped[str | None] = mapped_column(String(300), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)

    user: Mapped["User"] = relationship("User", back_populates="addresses")


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    subject: Mapped[str] = mapped_column(String(300), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class EmailTemplate(Base):
    __tablename__ = "email_templates"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    subject: Mapped[str] = mapped_column(String(300), nullable=False)
    body_html: Mapped[str] = mapped_column(Text, nullable=False)
    body_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    action: Mapped[str] = mapped_column(String(200), nullable=False)
    entity_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    entity_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    details: Mapped[str | None] = mapped_column(Text, nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
