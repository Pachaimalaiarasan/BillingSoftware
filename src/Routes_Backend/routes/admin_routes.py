from flask import Blueprint, request, jsonify
from Routes_Backend.models.admin import Admin
from extensions import db

admin_bp = Blueprint('admin_bp', __name__)

@admin_bp.route('/api/admin/all', methods=['GET'])
def get_all_admins():
    admins = Admin.query.all()
    result = []
    for admin in admins:
        result.append({
            "admin_id": admin.admin_id,
            "username": admin.username,
            "email": admin.email
            # Never include password in API response!
        })
    return jsonify(result), 200
# -------------------------------
# Admin Register Route (for Google sign-in or manual setup)
# -------------------------------
@admin_bp.route('/api/admin/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
    if Admin.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 409
    admin = Admin(username=username, email=email, password=password)
    db.session.add(admin)
    db.session.commit()
    return jsonify({"message": "Admin registered successfully"}), 201

# -------------------------------
# Admin Login Route
# -------------------------------
@admin_bp.route('/api/admin/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    admin = Admin.query.filter_by(username=username).first()
    if not admin or admin.password != password:
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({
        "message": "Login successful",
        "admin_id": admin.admin_id,
        "username": admin.username
    }), 200

# -------------------------------
# Admin Reset Password Route
# -------------------------------
@admin_bp.route('/api/admin/reset-password', methods=['PUT'])
def reset_password():
    data = request.get_json()
    username = data.get('username')
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')
    if not username or not current_password or not new_password:
        return jsonify({"error": "Missing required fields"}), 400

    admin = Admin.query.filter_by(username=username).first()
    if not admin:
        return jsonify({"error": "Admin not found"}), 404
    if admin.password != current_password:
        return jsonify({"error": "Current password is incorrect"}), 403

    admin.password = new_password
    db.session.commit()

    return jsonify({"message": "Password updated successfully"}), 200

# -------------------------------
# Admin details update
# -------------------------------

@admin_bp.route('/api/admin/update-username', methods=['PUT'])
def update_username():
    data = request.get_json()
    current_username = data.get('currentUsername')  # Use this to identify the admin
    new_username = data.get('username')

    if not current_username or not new_username:
        return jsonify({"error": "Current and new username required"}), 400

    # Check if new username already exists
    if Admin.query.filter_by(username=new_username).first():
        return jsonify({"error": "Username already exists"}), 409

    admin = Admin.query.filter_by(username=current_username).first()
    if not admin:
        return jsonify({"error": "Admin not found"}), 404

    if len(new_username) < 3:
        return jsonify({"error": "Username too short"}), 400

    admin.username = new_username
    db.session.commit()

    return jsonify({"message": "Username updated successfully", "username": new_username}), 200

