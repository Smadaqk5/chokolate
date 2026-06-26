"""Seed the database with initial data for Phylgood Chocolates."""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.auth.security import get_password_hash
from app.database import Base, SessionLocal, engine
from app.models import (
    BusinessSettings,
    Category,
    DeliveryZone,
    EmailTemplate,
    Occasion,
    Product,
    ProductImage,
    ProductStatus,
    User,
    UserRole,
)
from app.utils.helpers import slugify

GOOGLE_MAPS_EMBED = '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3609.673483897343!2d36.81889237448293!3d-1.2823687356208324!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f11fb2e00e4cd%3A0x4cc3600212b09277!2sKimathi%20Chambers.!5e1!3m2!1sen!2ske!4v1782430669129!5m2!1sen!2ske" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>'

SOCIAL_LINKS = json.dumps({
    "tiktok": "https://www.tiktok.com/@phylgoodchocolates_ke?is_from_webapp=1&sender_device=pc",
    "whatsapp": "https://wa.me/254720516533",
})

BUSINESS_HOURS = """Monday - Friday: 9:00 AM - 6:00 PM
Saturday: 10:00 AM - 4:00 PM
Sunday: Closed"""


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if db.query(User).filter(User.email == "admin@phylgoodchocolates.com").first():
            print("Database already seeded.")
            return

        admin = User(
            first_name="Admin",
            last_name="Phylgood",
            email="admin@phylgoodchocolates.com",
            phone_number="0720516533",
            password_hash=get_password_hash("Admin@123"),
            role=UserRole.ADMIN,
            is_verified=True,
        )
        db.add(admin)

        settings = BusinessSettings(
            business_name="Phylgood Chocolates",
            email="info@phylgoodchocolates.com",
            phone="0720 516 533",
            whatsapp="0720 516 533",
            address="Kimathi Chambers, 2nd Floor, Room 209, Nairobi, Kenya",
            pickup_location="Kimathi Chambers\n2nd Floor, Room 209",
            google_maps_link="https://maps.google.com/?q=Kimathi+Chambers",
            google_maps_embed=GOOGLE_MAPS_EMBED,
            business_hours=BUSINESS_HOURS,
            currency="KES",
            mpesa_till_number="123456",
            delivery_charge=500,
            social_links=SOCIAL_LINKS,
        )
        db.add(settings)

        zones = [
            DeliveryZone(name="Nairobi CBD", delivery_fee=300, estimated_time="Same day", is_active=True),
            DeliveryZone(name="Westlands", delivery_fee=500, estimated_time="1-2 hours", is_active=True),
            DeliveryZone(name="Karen", delivery_fee=800, estimated_time="2-3 hours", is_active=True),
        ]
        for z in zones:
            db.add(z)

        categories_data = [
            ("Chocolates", "Premium handcrafted chocolates", 1, True),
            ("Flowers", "Fresh and preserved floral arrangements", 2, True),
            ("Pastries", "Artisan baked goods and desserts", 3, False),
            ("Gummies", "Gourmet gummy treats", 4, False),
            ("Hampers", "Curated luxury gift hampers", 5, True),
            ("Custom Gifts", "Personalized gifting options", 6, True),
        ]
        categories = {}
        for name, desc, order, featured in categories_data:
            cat = Category(name=name, slug=slugify(name), description=desc, display_order=order, is_featured=featured)
            db.add(cat)
            db.flush()
            categories[name] = cat

        occasions_data = [
            "Birthday", "Anniversary", "Graduation", "Wedding",
            "Mother's Day", "Father's Day", "Christmas", "Valentine's Day",
            "Baby Shower", "Corporate",
        ]
        occasions = {}
        for i, name in enumerate(occasions_data):
            occ = Occasion(name=name, slug=slugify(name), display_order=i)
            db.add(occ)
            db.flush()
            occasions[name] = occ

        products_data = [
            ("Dark Truffle Box", "Chocolates", 2500, 2200, "A luxurious box of 12 dark chocolate truffles", True, True, True),
            ("Milk Chocolate Hearts", "Chocolates", 1800, None, "Handcrafted milk chocolate hearts - perfect for Valentine's", True, False, True),
            ("Rose Bouquet Premium", "Flowers", 3500, 3200, "24 premium red roses with elegant wrapping", True, True, False),
            ("Artisan Cupcake Set", "Pastries", 1500, None, "Set of 6 gourmet cupcakes with assorted flavors", False, True, True),
            ("Fruit Gummy Collection", "Gummies", 900, None, "Assorted gourmet fruit gummies in a gift box", False, False, True),
            ("Luxury Hamper Deluxe", "Hampers", 8500, 7999, "Premium hamper with chocolates, wine, and treats", True, True, False),
            ("Custom Name Chocolate Bar", "Custom Gifts", 1200, None, "Personalized chocolate bar with custom name engraving", False, False, True),
            ("White Chocolate Pralines", "Chocolates", 2000, None, "Delicate white chocolate pralines with hazelnut filling", False, True, True),
            ("Sunflower Arrangement", "Flowers", 2800, None, "Bright sunflower bouquet in rustic packaging", False, False, False),
            ("Corporate Gift Box", "Hampers", 5000, None, "Elegant corporate gifting solution with branding options", False, False, False),
        ]

        for name, cat_name, price, sale, desc, featured, best, new in products_data:
            sku = slugify(name).upper().replace("-", "")[:12]
            product = Product(
                category_id=categories[cat_name].id,
                name=name,
                slug=slugify(name),
                short_description=desc,
                full_description=f"{desc}. Crafted with the finest ingredients by Phylgood Chocolates.",
                sku=sku,
                regular_price=price,
                sale_price=sale,
                stock_quantity=50,
                low_stock_level=5,
                featured=featured,
                best_seller=best,
                new_arrival=new,
                customizable=cat_name == "Custom Gifts",
                gift_box_item=True,
                status=ProductStatus.ACTIVE,
            )
            if cat_name in ("Chocolates", "Custom Gifts"):
                product.occasions.extend([occasions["Birthday"], occasions["Valentine's Day"], occasions["Anniversary"]])
            elif cat_name == "Flowers":
                product.occasions.extend([occasions["Wedding"], occasions["Anniversary"], occasions["Mother's Day"]])
            elif cat_name == "Hampers":
                product.occasions.extend([occasions["Corporate"], occasions["Christmas"]])
            db.add(product)

        email_templates = [
            ("order_received", "Order Received - {{order_number}}", "<h1>Thank you!</h1><p>Hi {{customer_name}}, we received your order {{order_number}}.</p>"),
            ("awaiting_payment", "Awaiting Payment - {{order_number}}", "<h1>Payment Required</h1><p>Please pay {{total}} to Till {{till_number}}.</p>"),
            ("payment_confirmed", "Payment Confirmed - {{order_number}}", "<h1>Payment Received</h1><p>Your payment for order {{order_number}} has been confirmed.</p>"),
            ("preparing_order", "Preparing Your Order - {{order_number}}", "<h1>We're Preparing Your Gift</h1><p>Order {{order_number}} is being carefully prepared.</p>"),
            ("ready_for_pickup", "Ready for Pickup - {{order_number}}", "<h1>Ready for Collection!</h1><p>Your order is ready at {{pickup_location}}.</p>"),
            ("out_for_delivery", "Out for Delivery - {{order_number}}", "<h1>On Its Way!</h1><p>Your order {{order_number}} is out for delivery.</p>"),
            ("order_completed", "Order Completed - {{order_number}}", "<h1>Thank You!</h1><p>We hope you enjoyed your gift from {{business_name}}.</p>"),
            ("order_cancelled", "Order Cancelled - {{order_number}}", "<h1>Order Cancelled</h1><p>Your order {{order_number}} has been cancelled.</p>"),
        ]
        for name, subject, body in email_templates:
            db.add(EmailTemplate(name=name, subject=subject, body_html=body, body_text=body))

        db.commit()
        print("Database seeded successfully!")
        print("Admin login: admin@phylgoodchocolates.com / Admin@123")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
