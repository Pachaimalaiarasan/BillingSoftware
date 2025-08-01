from app import db

class Product(db.Model):
    __tablename__ = 'products'
    
    Pro_id = db.Column(db.String(100), primary_key=True)
    Pro_name = db.Column(db.String(100))
    Pro_price = db.Column(db.Numeric(10, 2))
    Pro_qun = db.Column(db.Integer, default=0)
    Total = db.Column(db.Numeric(10, 2))
    pro_photo = db.Column(db.String(500))
    pro_cate = db.Column(db.String(200))
    pro_sell = db.Column(db.String(200))
    Sp_id = db.Column(db.String(200), db.ForeignKey('suppliers.Sp_id'))
    remin_qun = db.Column(db.Integer, nullable=False, default=0)

    # Relationships
    supplier = db.relationship('Supplier', backref='products')
    bill_items = db.relationship('BillItem', backref='product', lazy=True)

    def __repr__(self):
        return f"<Product {self.Pro_name}>"