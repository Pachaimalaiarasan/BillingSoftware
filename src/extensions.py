from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager

db = SQLAlchemy()
login_manager = LoginManager()


def init_extensions(app):
    """Initialize all extensions with the Flask app"""
    db.init_app(app)
    login_manager.init_app(app)
    
    # Login manager configuration
    login_manager.login_view = 'auth.login'  # Specify your login route
    login_manager.login_message_category = 'info'