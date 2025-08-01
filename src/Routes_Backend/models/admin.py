from datetime import datetime
from app import db

class Admin(db.Model):
    __tablename__ = 'admin'
    
    admin_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Admin {self.username}>"