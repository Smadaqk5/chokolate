from sqlalchemy.orm import Session, joinedload

from app.models import (
    Category,
    DeliveryInformation,
    DeliveryMethod,
    DeliveryZone,
    InventoryMovement,
    Occasion,
    Order,
    OrderItem,
    OrderStatus,
    Payment,
    PaymentStatus,
    PickupInformation,
    Product,
    ProductStatus,
    ProductVariation,
    Review,
    StockMovementType,
)
from app.schemas.catalog import ProductResponse
from app.schemas.orders import OrderCreate, OrderResponse
from app.services.email_service import send_order_status_email
from app.utils.helpers import generate_order_number


def product_to_response(product: Product, db: Session | None = None) -> ProductResponse:
    effective_price = product.sale_price if product.sale_price else product.regular_price
    avg_rating = 0.0
    review_count = 0
    if db:
        reviews = db.query(Review).filter(Review.product_id == product.id, Review.is_approved == True).all()
        review_count = len(reviews)
        if reviews:
            avg_rating = sum(r.rating for r in reviews) / len(reviews)

    return ProductResponse(
        id=product.id,
        category_id=product.category_id,
        name=product.name,
        slug=product.slug,
        short_description=product.short_description,
        full_description=product.full_description,
        sku=product.sku,
        barcode=product.barcode,
        regular_price=product.regular_price,
        sale_price=product.sale_price,
        stock_quantity=product.stock_quantity,
        low_stock_level=product.low_stock_level,
        weight=product.weight,
        preparation_time=product.preparation_time,
        featured=product.featured,
        best_seller=product.best_seller,
        new_arrival=product.new_arrival,
        customizable=product.customizable,
        gift_box_item=product.gift_box_item,
        pickup_available=product.pickup_available,
        delivery_available=product.delivery_available,
        status=product.status.value,
        seo_title=product.seo_title,
        seo_description=product.seo_description,
        occasion_ids=[o.id for o in product.occasions],
        created_at=product.created_at,
        updated_at=product.updated_at,
        images=product.images,
        variations=product.variations,
        category_name=product.category.name if product.category else None,
        effective_price=effective_price,
        average_rating=round(avg_rating, 1),
        review_count=review_count,
    )


def order_to_response(order: Order) -> OrderResponse:
    return OrderResponse.model_validate(order)


def create_order(db: Session, data: OrderCreate, customer_id: str | None = None) -> Order:
    subtotal = 0.0
    order_items = []

    for item_data in data.items:
        product = db.query(Product).options(joinedload(Product.variations)).filter(Product.id == item_data.product_id).first()
        if not product or product.status != ProductStatus.ACTIVE:
            raise ValueError(f"Product not available: {item_data.product_id}")

        unit_price = product.sale_price or product.regular_price
        variation_name = None

        if item_data.variation_id:
            variation = db.query(ProductVariation).filter(
                ProductVariation.id == item_data.variation_id,
                ProductVariation.product_id == product.id,
            ).first()
            if not variation:
                raise ValueError("Invalid product variation")
            unit_price = variation.price
            variation_name = variation.variation_name
            if variation.stock < item_data.quantity:
                raise ValueError(f"Insufficient stock for {product.name} - {variation.variation_name}")
        elif product.stock_quantity < item_data.quantity:
            raise ValueError(f"Insufficient stock for {product.name}")

        line_total = unit_price * item_data.quantity
        subtotal += line_total
        order_items.append({
            "product": product,
            "product_name": product.name,
            "product_sku": product.sku,
            "variation_name": variation_name,
            "quantity": item_data.quantity,
            "unit_price": unit_price,
            "total_price": line_total,
            "customization": item_data.customization,
            "variation_id": item_data.variation_id,
        })

    delivery_fee = 0.0
    if data.delivery_method == "delivery":
        if data.delivery_zone_id:
            zone = db.query(DeliveryZone).filter(DeliveryZone.id == data.delivery_zone_id).first()
            delivery_fee = zone.delivery_fee if zone else 500.0
        else:
            from app.services.email_service import get_business_settings
            biz = get_business_settings(db)
            delivery_fee = biz.delivery_charge

    total = subtotal + delivery_fee

    order = Order(
        order_number=generate_order_number(),
        customer_id=customer_id,
        guest_name=data.guest_name,
        guest_email=str(data.guest_email) if data.guest_email else None,
        guest_phone=data.guest_phone,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        total=total,
        payment_status=PaymentStatus.AWAITING,
        order_status=OrderStatus.AWAITING_PAYMENT,
        delivery_method=DeliveryMethod(data.delivery_method),
        preferred_date=data.preferred_date,
        preferred_time=data.preferred_time,
        gift_message=data.gift_message,
        notes=data.notes,
    )
    db.add(order)
    db.flush()

    from app.services.email_service import get_business_settings
    biz = get_business_settings(db)

    payment = Payment(
        order_id=order.id,
        amount=total,
        payment_method="mpesa",
        till_number=biz.mpesa_till_number,
        status=PaymentStatus.AWAITING,
    )
    db.add(payment)

    if data.delivery_method == "delivery" and data.delivery_info:
        delivery = DeliveryInformation(
            order_id=order.id,
            recipient_name=data.delivery_info.recipient_name,
            address=data.delivery_info.address,
            city=data.delivery_info.city,
            landmark=data.delivery_info.landmark,
            delivery_notes=data.delivery_info.delivery_notes,
            phone=data.delivery_info.phone,
        )
        db.add(delivery)
    elif data.delivery_method == "pickup":
        pickup = PickupInformation(
            order_id=order.id,
            pickup_date=data.pickup_info.pickup_date if data.pickup_info else data.preferred_date,
            pickup_time=data.pickup_info.pickup_time if data.pickup_info else data.preferred_time,
        )
        db.add(pickup)

    for item in order_items:
        oi = OrderItem(
            order_id=order.id,
            product_id=item["product"].id,
            product_name=item["product_name"],
            product_sku=item["product_sku"],
            variation_name=item["variation_name"],
            quantity=item["quantity"],
            unit_price=item["unit_price"],
            total_price=item["total_price"],
            customization=item["customization"],
        )
        db.add(oi)

        product = item["product"]
        prev_stock = product.stock_quantity
        product.stock_quantity -= item["quantity"]
        db.add(InventoryMovement(
            product_id=product.id,
            movement_type=StockMovementType.SALE,
            quantity=-item["quantity"],
            previous_stock=prev_stock,
            new_stock=product.stock_quantity,
            reason=f"Order {order.order_number}",
        ))

    db.commit()
    db.refresh(order)
    send_order_status_email(db, order)
    return order


def update_order_status(db: Session, order: Order, new_status: OrderStatus, internal_notes: str | None = None) -> Order:
    order.order_status = new_status
    if internal_notes:
        order.internal_notes = internal_notes

    if new_status == OrderStatus.PAYMENT_CONFIRMED:
        order.payment_status = PaymentStatus.CONFIRMED
        if order.payment:
            from datetime import datetime
            order.payment.status = PaymentStatus.CONFIRMED
            order.payment.payment_date = datetime.utcnow()

    db.commit()
    db.refresh(order)
    send_order_status_email(db, order)
    return order
