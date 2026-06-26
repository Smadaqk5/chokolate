import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

from jinja2 import Environment, FileSystemLoader
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import BusinessSettings, EmailTemplate, Order

logger = logging.getLogger(__name__)
settings = get_settings()

template_dir = Path(__file__).parent.parent / "notifications" / "templates"
jinja_env = Environment(loader=FileSystemLoader(str(template_dir)), autoescape=True)

STATUS_TEMPLATE_MAP = {
    "pending": "order_received",
    "awaiting_payment": "awaiting_payment",
    "payment_confirmed": "payment_confirmed",
    "preparing": "preparing_order",
    "ready_for_pickup": "ready_for_pickup",
    "out_for_delivery": "out_for_delivery",
    "completed": "order_completed",
    "cancelled": "order_cancelled",
}


def get_business_settings(db: Session) -> BusinessSettings:
    biz = db.query(BusinessSettings).first()
    if not biz:
        biz = BusinessSettings()
        db.add(biz)
        db.commit()
        db.refresh(biz)
    return biz


def render_template(name: str, context: dict) -> tuple[str, str]:
    html_template = jinja_env.get_template(f"{name}.html")
    html = html_template.render(**context)
    try:
        text_template = jinja_env.get_template(f"{name}.txt")
        text = text_template.render(**context)
    except Exception:
        text = html
    return html, text


def get_template_from_db(db: Session, name: str, context: dict) -> tuple[str, str]:
    template = db.query(EmailTemplate).filter(EmailTemplate.name == name, EmailTemplate.is_active == True).first()
    if template:
        subject = template.subject
        for key, value in context.items():
            subject = subject.replace(f"{{{{{key}}}}}", str(value))
        html = template.body_html
        for key, value in context.items():
            html = html.replace(f"{{{{{key}}}}}", str(value))
        text = template.body_text or html
        return subject, html, text
    html, text = render_template(name, context)
    subject_map = {
        "order_received": "Order Received - {{order_number}}",
        "awaiting_payment": "Awaiting Payment - {{order_number}}",
        "payment_confirmed": "Payment Confirmed - {{order_number}}",
        "preparing_order": "Your Order is Being Prepared - {{order_number}}",
        "ready_for_pickup": "Ready for Pickup - {{order_number}}",
        "out_for_delivery": "Out for Delivery - {{order_number}}",
        "order_completed": "Order Completed - {{order_number}}",
        "order_cancelled": "Order Cancelled - {{order_number}}",
    }
    subject = subject_map.get(name, "Order Update - {{order_number}}")
    for key, value in context.items():
        subject = subject.replace(f"{{{{{key}}}}}", str(value))
    return subject, html, text


def send_email(to: str, subject: str, html_body: str, text_body: str | None = None) -> bool:
    if not settings.smtp_user or not settings.smtp_password:
        logger.warning("SMTP not configured. Email not sent to %s: %s", to, subject)
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.smtp_from
        msg["To"] = to
        if text_body:
            msg.attach(MIMEText(text_body, "plain"))
        msg.attach(MIMEText(html_body, "html"))
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            if settings.smtp_use_tls:
                server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_from, to, msg.as_string())
        return True
    except Exception as exc:
        logger.error("Failed to send email to %s: %s", to, exc)
        return False


def send_order_status_email(db: Session, order: Order) -> bool:
    template_name = STATUS_TEMPLATE_MAP.get(order.order_status.value, "order_received")
    biz = get_business_settings(db)
    recipient = order.guest_email
    if order.customer and order.customer.email:
        recipient = order.customer.email
    if not recipient:
        return False

    context = {
        "order_number": order.order_number,
        "customer_name": order.guest_name or (f"{order.customer.first_name} {order.customer.last_name}" if order.customer else "Customer"),
        "total": f"{biz.currency} {order.total:,.2f}",
        "order_status": order.order_status.value.replace("_", " ").title(),
        "till_number": biz.mpesa_till_number or "N/A",
        "business_name": biz.business_name,
        "pickup_location": biz.pickup_location or "",
        "app_url": settings.app_url,
    }
    subject, html, text = get_template_from_db(db, template_name, context)
    return send_email(recipient, subject, html, text)
