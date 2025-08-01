from flask import Blueprint, request, jsonify
from Routes_Backend.models.supplier import Supplier
from Routes_Backend.models.product import Product
from app import db
import re

supplier_bp = Blueprint('suppliers', __name__, url_prefix='/api/suppliers')

# GET all suppliers
@supplier_bp.route('', methods=['GET'])
def get_suppliers():
    try:
        suppliers = Supplier.query.all()
        return jsonify([{
            'Sp_id': s.Sp_id,
            'Sp_name': s.Sp_name,
            'Sp_phone': s.Sp_phone,
            'Sp_email': s.Sp_email,
            'Sp_credith': s.Sp_credith,
            'Sp_debith': s.Sp_debith,
            'Pro_id': s.Pro_id
        } for s in suppliers]), 200
    except Exception as e:
        print("Error fetching suppliers:", e)
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

# GET products by supplier
@supplier_bp.route('/<supplier_id>/products', methods=['GET'])
def get_supplier_products(supplier_id):
    try:
        products = Product.query.filter_by(Sp_id=supplier_id).all()
        return jsonify([p.Pro_name for p in products]), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch products", "details": str(e)}), 500

# POST new supplier
@supplier_bp.route('', methods=['POST'])
def add_supplier():
    data = request.get_json()
    try:
        # Get the highest number from existing Sp_id like SP5.
        last_supplier = db.session.query(
            db.func.max(
                db.func.cast(
                    db.func.substr(Supplier.Sp_id, 3),  # Get numeric part after 'SP'
                    db.Integer
                )
            )
        ).scalar()

        new_num = 1 if last_supplier is None else last_supplier + 1
        new_sp_id = f"SP{new_num}"  # No zero-padding

        # Validate product ID pattern if provided
        pro_id = data.get("Pro_id", "")
        if pro_id and not re.match(r'^[A-Z]{2,4}\d{2}$', pro_id):
            return jsonify({
                'error': 'Product ID must be in format like PR04, PVCA01 (2-4 letters + 2 digits)'
            }), 400

        new_supplier = Supplier(
            Sp_id=new_sp_id,
            Sp_name=data["Sp_name"],
            Sp_phone=data["Sp_phone"],
            Sp_email=data.get("Sp_email", ""),
            Sp_credith=data.get("Sp_credith", "0"),
            Sp_debith=data.get("Sp_debith", "0"),
            Pro_id=pro_id
        )

        db.session.add(new_supplier)
        db.session.commit()

        return jsonify({
            "message": "Supplier added successfully",
            "Sp_id": new_sp_id
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "error": "Failed to add supplier",
            "details": str(e)
        }), 500

# PUT update existing supplier
@supplier_bp.route('/<sp_id>', methods=['PUT'])
def update_supplier(sp_id):
    data = request.get_json()
    try:
        supplier = Supplier.query.get(sp_id)
        if not supplier:
            return jsonify({"error": "Supplier not found"}), 404

        supplier.Sp_name = data.get("Sp_name", supplier.Sp_name)
        supplier.Sp_phone = data.get("Sp_phone", supplier.Sp_phone)
        supplier.Sp_email = data.get("Sp_email", supplier.Sp_email)
        supplier.Sp_credith = data.get("Sp_credith", supplier.Sp_credith)
        supplier.Sp_debith = data.get("Sp_debith", supplier.Sp_debith)
        supplier.Pro_id = data.get("Pro_id", supplier.Pro_id)

        db.session.commit()
        return jsonify({"message": "Supplier updated"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
