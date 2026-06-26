import re
import unicodedata


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]", "", text.lower())
    return re.sub(r"[-\s]+", "-", text).strip("-")


def generate_order_number() -> str:
    from datetime import datetime
    import random

    timestamp = datetime.utcnow().strftime("%Y%m%d")
    random_part = random.randint(1000, 9999)
    return f"PGC-{timestamp}-{random_part}"
