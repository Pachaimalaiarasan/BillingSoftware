# routes/__init__.py
from .admin_routes import admin_bp
from .customer_routes import customer_bp
from .product_routes import product_bp
from .supplier_routes import supplier_bp
from .bill_routes import bill_bp
from .supply_routes import supply_bp

__all__ = [
    'admin_bp',
    'customer_bp',
    'product_bp',
    'supplier_bp',
    'bill_bp',
    'supply_bp',
]