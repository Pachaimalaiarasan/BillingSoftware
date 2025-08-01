from datetime import date
from app import db

class SupplyUpdate(db.Model):
    __tablename__ = 'supply_updates'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Pro_id = db.Column(db.String(10), db.ForeignKey('products.Pro_id'), nullable=False)
    Supplied_quantity = db.Column(db.Integer, nullable=False)
    sp_date = db.Column(db.Date, default=date.today, nullable=False)
    Sp_id = db.Column(db.String(10), db.ForeignKey('suppliers.Sp_id'), nullable=False)
    Pro_name = db.Column(db.String(100), nullable=False)
    Pro_price = db.Column(db.Numeric(10, 2), nullable=False)
    Pro_totalprice = db.Column(db.Numeric(10, 2), nullable=False)

    # Relationships
    product = db.relationship('Product', backref='supply_updates')
    supplier = db.relationship('Supplier', backref='supply_updates')

    def __repr__(self):
        return f"<SupplyUpdate {self.Pro_id} - {self.sp_date}>"

    @classmethod
    def create_from_product(cls, product, supplied_quantity, supplier_id=None):
        return cls(
            Pro_id=product.Pro_id,
            Supplied_quantity=supplied_quantity,
            Sp_id=supplier_id or product.Sp_id,
            Pro_name=product.Pro_name,
            Pro_price=product.Pro_price,
            Pro_totalprice=product.Pro_price * supplied_quantity
        )