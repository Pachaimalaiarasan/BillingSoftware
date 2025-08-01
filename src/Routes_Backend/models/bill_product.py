from app import db

# SQLAlchemy Core Table Definition
billproduct_table = db.Table(
    'billproduct',
    db.Column('id', db.Integer, primary_key=True, autoincrement=True),
    db.Column('b_id', db.String(100), nullable=False),
    db.Column('b_proName', db.String(100), nullable=False),
    db.Column('b_proQun', db.Integer, nullable=False),
    db.Column('b_price', db.Numeric(10, 2), nullable=False),
    db.Column('b_total', db.Numeric(10, 2), nullable=False),
    db.Column('ov_total', db.Numeric(10, 2), nullable=False),
    db.Column('C_id', db.String(100), db.ForeignKey('customers.C_id'), nullable=False),
    db.Column('Pro_id', db.String(100), db.ForeignKey('products.Pro_id'), nullable=False),
    db.Column('b_date', db.Date, server_default=db.func.current_date(), nullable=False),
    db.Column('total', db.Numeric(10, 2), nullable=False),
    db.Column('discount', db.Numeric(10, 2), default=0.00),
    db.Column('final_total', db.Numeric(10, 2), nullable=False)
)

# ORM Model Approach
class Bill(db.Model):
    __tablename__ = 'bills'
    
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.String(100), db.ForeignKey('customers.C_id'), nullable=False)
    total = db.Column(db.Numeric(10, 2), nullable=False)
    discount = db.Column(db.Numeric(10, 2), default=0.00)
    final_total = db.Column(db.Numeric(10, 2), nullable=False)
    date = db.Column(db.Date, server_default=db.func.current_date(), nullable=False)
    
    items = db.relationship('BillItem', backref='bill', cascade='all, delete-orphan')

class BillItem(db.Model):
    __tablename__ = 'bill_items'
    
    id = db.Column(db.Integer, primary_key=True)
    bill_id = db.Column(db.Integer, db.ForeignKey('bills.id'), nullable=False)
    product_id = db.Column(db.String(100), db.ForeignKey('products.Pro_id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    total = db.Column(db.Numeric(10, 2), nullable=False)