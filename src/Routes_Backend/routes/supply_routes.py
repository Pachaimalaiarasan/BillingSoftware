from flask import Blueprint, request, jsonify
from Routes_Backend.models.supply_update import SupplyUpdate
from app import db

supply_bp = Blueprint('supply_updates', __name__, url_prefix='/api/supply')
@supply_bp.route('/updates', methods=['GET'])
def get_supply_updates():
    try:
        updates = SupplyUpdate.query.all()
        return jsonify([{
            'id': u.id,
            'Pro_id': u.Pro_id,
            'Pro_name': u.Pro_name,
            'Supplied_quantity': u.Supplied_quantity,
            'sp_date': u.sp_date.strftime('%Y-%m-%d') if u.sp_date else None,
            'Sp_id': u.Sp_id,
            'Pro_price': float(u.Pro_price) if u.Pro_price else None,
            'Pro_totalprice': float(u.Pro_totalprice) if u.Pro_totalprice else None,
            'supplier_name': u.supplier.Sp_name if u.supplier else None
        } for u in updates]), 200
    except Exception as e:
        print("Error fetching supply updates:", e)
        return jsonify({"error": "Internal server error", "details": str(e)}), 500
