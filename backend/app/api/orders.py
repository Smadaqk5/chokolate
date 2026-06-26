from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.auth.security import get_current_user, get_current_user_optional, require_staff
from app.database import get_db
from app.models import Order, OrderStatus, Payment, PaymentStatus, User
from app.schemas.orders import OrderCreate, OrderListResponse, OrderResponse, OrderStatusUpdate, PaymentVerifyRequest
from app.services.order_service import create_order, order_to_response, update_order_status

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse)
def place_order(
    data: OrderCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User | None, Depends(get_current_user_optional)] = None,
):
    try:
        order = create_order(db, data, customer_id=current_user.id if current_user else None)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    order = db.query(Order).options(
        joinedload(Order.items),
        joinedload(Order.payment),
        joinedload(Order.delivery_info),
        joinedload(Order.pickup_info),
    ).filter(Order.id == order.id).first()
    return order_to_response(order)


@router.get("/track/{order_number}", response_model=OrderResponse)
def track_order(order_number: str, db: Annotated[Session, Depends(get_db)]):
    order = db.query(Order).options(
        joinedload(Order.items),
        joinedload(Order.payment),
        joinedload(Order.delivery_info),
        joinedload(Order.pickup_info),
    ).filter(Order.order_number == order_number).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order_to_response(order)


@router.get("/my-orders", response_model=list[OrderResponse])
def my_orders(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    orders = db.query(Order).options(
        joinedload(Order.items),
        joinedload(Order.payment),
        joinedload(Order.delivery_info),
        joinedload(Order.pickup_info),
    ).filter(Order.customer_id == current_user.id).order_by(Order.created_at.desc()).all()
    return [order_to_response(o) for o in orders]


@router.get("", response_model=OrderListResponse)
def list_orders(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_staff)],
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str | None = None,
    search: str | None = None,
):
    query = db.query(Order).options(
        joinedload(Order.items),
        joinedload(Order.payment),
        joinedload(Order.delivery_info),
        joinedload(Order.pickup_info),
        joinedload(Order.customer),
    )
    if status:
        query = query.filter(Order.order_status == OrderStatus(status))
    if search:
        query = query.filter(Order.order_number.ilike(f"%{search}%"))
    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    pages = (total + page_size - 1) // page_size
    return OrderListResponse(
        items=[order_to_response(o) for o in orders],
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: str,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_staff)],
):
    order = db.query(Order).options(
        joinedload(Order.items),
        joinedload(Order.payment),
        joinedload(Order.delivery_info),
        joinedload(Order.pickup_info),
    ).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order_to_response(order)


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_status(
    order_id: str,
    data: OrderStatusUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_staff)],
):
    order = db.query(Order).options(
        joinedload(Order.items),
        joinedload(Order.payment),
        joinedload(Order.delivery_info),
        joinedload(Order.pickup_info),
        joinedload(Order.customer),
    ).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order = update_order_status(db, order, OrderStatus(data.order_status), data.internal_notes)
    return order_to_response(order)


@router.post("/{order_id}/verify-payment", response_model=OrderResponse)
def verify_payment(
    order_id: str,
    data: PaymentVerifyRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_staff)],
):
    order = db.query(Order).options(
        joinedload(Order.items),
        joinedload(Order.payment),
        joinedload(Order.delivery_info),
        joinedload(Order.pickup_info),
        joinedload(Order.customer),
    ).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.payment:
        order.payment.mpesa_reference = data.mpesa_reference
        order.payment.payer_phone = data.payer_phone
        order.payment.verified_by = current_user.id

    order = update_order_status(db, order, OrderStatus.PAYMENT_CONFIRMED)
    return order_to_response(order)
