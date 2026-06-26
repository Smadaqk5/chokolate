from datetime import datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.auth.security import require_staff
from app.database import get_db
from app.models import ContactMessage, Order, OrderStatus, Product, Review, User, UserRole  # noqa: F401
from app.schemas.misc import DashboardStats
from app.services.order_service import order_to_response

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard", response_model=DashboardStats)
def dashboard_stats(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_staff)],
):
    total_orders = db.query(Order).count()
    pending_orders = db.query(Order).filter(
        Order.order_status.in_([OrderStatus.AWAITING_PAYMENT, OrderStatus.PAYMENT_CONFIRMED, OrderStatus.PREPARING])
    ).count()
    total_revenue = db.query(func.coalesce(func.sum(Order.total), 0)).filter(
        Order.order_status.in_([OrderStatus.COMPLETED, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.READY_FOR_PICKUP])
    ).scalar() or 0
    total_customers = db.query(User).filter(User.role == UserRole.CUSTOMER).count()
    total_products = db.query(Product).count()
    low_stock = db.query(Product).filter(Product.stock_quantity <= Product.low_stock_level).count()
    pending_reviews = db.query(Review).filter(Review.is_approved == False).count()

    recent = db.query(Order).options(
        joinedload(Order.items),
        joinedload(Order.payment),
        joinedload(Order.delivery_info),
        joinedload(Order.pickup_info),
    ).order_by(Order.created_at.desc()).limit(5).all()

    return DashboardStats(
        total_orders=total_orders,
        pending_orders=pending_orders,
        total_revenue=float(total_revenue),
        total_customers=total_customers,
        total_products=total_products,
        low_stock_products=low_stock,
        pending_reviews=pending_reviews,
        recent_orders=[order_to_response(o) for o in recent],
    )


@router.get("/customers")
def list_customers(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_staff)],
):
    customers = db.query(User).filter(User.role == UserRole.CUSTOMER).order_by(User.created_at.desc()).all()
    result = []
    for c in customers:
        orders = db.query(Order).filter(Order.customer_id == c.id).all()
        total_spent = sum(o.total for o in orders)
        result.append({
            "id": c.id,
            "first_name": c.first_name,
            "last_name": c.last_name,
            "email": c.email,
            "phone_number": c.phone_number,
            "order_count": len(orders),
            "total_spent": total_spent,
            "created_at": c.created_at.isoformat(),
        })
    return result


@router.get("/contact-messages")
def list_contact_messages(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_staff)],
):
    return db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()


@router.get("/reviews/pending")
def pending_reviews(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_staff)],
):
    return db.query(Review).filter(Review.is_approved == False).order_by(Review.created_at.desc()).all()


@router.patch("/reviews/{review_id}")
def update_review(
    review_id: str,
    data: dict,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_staff)],
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        return {"error": "Not found"}
    for key in ("is_approved", "admin_reply", "is_visible"):
        if key in data:
            setattr(review, key, data[key])
    db.commit()
    return {"message": "Review updated"}


@router.get("/reports/sales")
def sales_report(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_staff)],
    period: str = "month",
):
    now = datetime.utcnow()
    if period == "day":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "week":
        start = now - timedelta(days=7)
    elif period == "year":
        start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    else:
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    orders = db.query(Order).filter(Order.created_at >= start).all()
    completed = [o for o in orders if o.order_status == OrderStatus.COMPLETED]
    return {
        "period": period,
        "total_orders": len(orders),
        "completed_orders": len(completed),
        "total_revenue": sum(o.total for o in completed),
        "average_order_value": sum(o.total for o in completed) / len(completed) if completed else 0,
    }
