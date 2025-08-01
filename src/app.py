import os
from flask import Flask
from flask_cors import CORS
from extensions import db, init_extensions
from Routes_Backend.routes.customerlogin_routes import  login_manager
from flask import Flask, request, jsonify
from twilio.rest import Client
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)



TWILIO_ACCOUNT_SID=os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN=os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_WHATSAPP_FROM = 'whatsapp:+14155238886'  # Twilio Sandbox WhatsApp number (change if needed)

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

@app.route('/api/send-whatsapp', methods=['POST'])
def send_whatsapp():
    data = request.get_json()

    to = data.get('to')
    body = data.get('body')

    if not to or not body:
        return jsonify({"error": "Missing 'to' or 'body' field"}), 400

    to_whatsapp = f'whatsapp:+{to}'

    try:
        message = client.messages.create(
            from_=TWILIO_WHATSAPP_FROM,
            to=to_whatsapp,
            body=body
        )
        return jsonify({"success": True, "sid": message.sid}), 200
    except Exception as e:
        print("Twilio WhatsApp send error:", e)
        return jsonify({"error": "Failed to send WhatsApp message"}), 500

def create_app():

    # basedir = os.path.abspath(os.path.dirname(__file__))
    app.config['BILL_PDF_FOLDER'] = r'E:\Entertainment\New folder'

    app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'your-secret-key-here')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root@localhost/newmarket'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'pool_recycle': 299,
        'pool_pre_ping': True
    }

    # Upload config
    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'public', 'ProductImages')
    app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB

    init_extensions(app)
    login_manager.init_app(app)  # initialize Flask-Login

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    register_blueprints(app)

    with app.app_context():
        try:
    # Create DB tables
            db.create_all()
            print(" Database tables created successfully")
        except Exception as e:
            print(f" Error creating database tables: {str(e)}")

    return app

def register_blueprints(app):
    from Routes_Backend.routes.admin_routes import admin_bp
    from Routes_Backend.routes.customer_routes import customer_bp
    from Routes_Backend.routes.product_routes import product_bp
    from Routes_Backend.routes.supplier_routes import supplier_bp
    from Routes_Backend.routes.bill_routes import bill_bp
    from Routes_Backend.routes.supply_routes import supply_bp
    from Routes_Backend.routes.customerlogin_routes import customer_login_bp

    app.register_blueprint(admin_bp)
    app.register_blueprint(customer_bp)
    app.register_blueprint(product_bp, url_prefix='/api/products')
    app.register_blueprint(supplier_bp)
    app.register_blueprint(supply_bp)
    app.register_blueprint(bill_bp)
    app.register_blueprint(customer_login_bp)
    
    
    os.makedirs(app.config['BILL_PDF_FOLDER'], exist_ok=True)

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
