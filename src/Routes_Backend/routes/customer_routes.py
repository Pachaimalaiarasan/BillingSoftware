from flask import Blueprint, request, jsonify
from Routes_Backend.models.customer import Customer
from extensions import db  # Use extensions, not app

customer_bp = Blueprint('customers', __name__, url_prefix='/api/customers')

# -------------------------------
# GET all customers
# -------------------------------
@customer_bp.route('', methods=['GET'])
def get_customers():
    customers = Customer.query.all()
    return jsonify([{
        'C_id': c.C_id,
        'C_name': c.C_name,
        'C_phone': c.C_phone,
        'C_email': c.C_email,
        'C_creditb': float(c.C_creditb) if c.C_creditb else None,
        'C_debitb': float(c.C_debitb) if c.C_debitb else None
    } for c in customers])

# -------------------------------
# GET customer by ID
# -------------------------------
@customer_bp.route('/<c_id>', methods=['GET'])
def get_customer_by_id(c_id):
    try:
        customer = Customer.query.get(c_id)
        if customer:
            return jsonify({
                'C_id': customer.C_id,
                'C_name': customer.C_name,
                'C_phone': customer.C_phone,
                'C_email': customer.C_email,
                'C_creditb': float(customer.C_creditb) if customer.C_creditb else None,
                'C_debitb': float(customer.C_debitb) if customer.C_debitb else None
            }), 200
        else:
            return jsonify({"message": "Customer not found"}), 404
    except Exception as e:
        print("Error fetching customer:", e)
        return jsonify({"error": "Internal server error"}), 500

# -------------------------------
# POST - Add new customer
# -------------------------------
@customer_bp.route('', methods=['POST'])
def add_customer():
    data = request.get_json()
    try:
        # Generate new customer ID (C001, C002...)
        last_customer = Customer.query.order_by(Customer.C_id.desc()).first()
        if last_customer:
            numeric_part = int(last_customer.C_id[1:]) + 1
        else:
            numeric_part = 1
        new_cid = f"C{numeric_part:03d}"

        new_customer = Customer(
            C_id=new_cid,
            C_name=data['C_name'],
            C_phone=data['C_phone'],
            C_email=data.get('C_email', ''),
            C_creditb=data.get('C_creditb', 0),
            C_debitb=data.get('C_debitb', 0)
        )

        db.session.add(new_customer)
        db.session.commit()
        return jsonify({"message": "Customer added", "C_id": new_cid}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# -------------------------------
# PUT - Update existing customer
# -------------------------------
@customer_bp.route('/<c_id>', methods=['PUT'])
def update_customer(c_id):
    data = request.get_json()
    try:
        customer = Customer.query.get(c_id)
        if not customer:
            return jsonify({"error": "Customer not found"}), 404

        customer.C_name = data['C_name']
        customer.C_phone = data['C_phone']
        customer.C_email = data.get('C_email', '')
        customer.C_creditb = data.get('C_creditb', 0)
        customer.C_debitb = data.get('C_debitb', 0)

        db.session.commit()
        return jsonify({"message": "Customer updated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        print("Error updating customer:", e)
        return jsonify({"error": "Internal server error"}), 500
