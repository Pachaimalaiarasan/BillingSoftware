from app import db

class Customer(db.Model):
    __tablename__ = 'customers'
    
    C_id = db.Column(db.String(100), primary_key=True)
    C_name = db.Column(db.String(100))
    C_phone = db.Column(db.String(20))
    C_email = db.Column(db.String(100))
    C_creditb = db.Column(db.Numeric(10, 2), default=0.00)
    C_debitb = db.Column(db.Numeric(10, 2), default=0.00)

    # Relationship with bills
    bills = db.relationship('Bill', backref='customer', lazy=True)

    def __repr__(self):
        return f"<Customer {self.C_name}>"