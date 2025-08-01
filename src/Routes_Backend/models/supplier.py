from app import db

class Supplier(db.Model):
    __tablename__ = 'suppliers'
    
    Sp_id = db.Column(db.String(100), primary_key=True)
    Sp_name = db.Column(db.String(100))
    Sp_phone = db.Column(db.String(100))
    Sp_email = db.Column(db.String(100))
    Sp_credith = db.Column(db.String(100), default="0")
    Sp_debith = db.Column(db.String(100), default="0")
    Pro_id = db.Column(db.String(200))

    def __repr__(self):
        return f"<Supplier {self.Sp_name}>"