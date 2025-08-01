from flask import Blueprint, request, jsonify
from Routes_Backend.models.product import Product
from Routes_Backend.models.supplier import Supplier
from Routes_Backend.models.supply_update import SupplyUpdate
from Routes_Backend.utils.file_upload import upload_product_image
from extensions import db
from datetime import datetime
import re

product_bp = Blueprint('products', __name__, url_prefix='/api/products')

# -------------------------------
# GET all products
# -------------------------------
@product_bp.route('', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([{
        'Pro_id': p.Pro_id,
        'Pro_name': p.Pro_name,
        'Pro_price': float(p.Pro_price) if p.Pro_price else None,
        'Pro_qun': p.Pro_qun,
        'Total': float(p.Total) if p.Total else None,
        'pro_photo': p.pro_photo,
        'pro_cate': p.pro_cate,
        'pro_sell': p.pro_sell,
        'Sp_id': p.Sp_id,
        'remin_qun': p.remin_qun
    } for p in products])

# -------------------------------
# POST - Add a new product
# -------------------------------
@product_bp.route('', methods=['POST'])
def add_product():
    try:
        product_id = request.form.get('pro_id')
        file = request.files.get('image')
        filename = upload_product_image(file, product_id) if file else None

        new_product = Product(
            Pro_id=product_id,
            Pro_name=request.form.get('name'),
            Pro_price=float(request.form.get('price')),
            Pro_qun=int(request.form.get('quantity', 0)),
            Total=float(request.form.get('total', 0)),
            pro_photo=filename,
            pro_cate=request.form.get('category'),
            pro_sell=request.form.get('sell'),
            Sp_id=request.form.get('sp_id'),
            remin_qun=int(request.form.get('remin_qun', 0))
        )

        db.session.add(new_product)
        db.session.commit()
        return jsonify({"message": "Product added"}), 201

    except Exception as e:
        db.session.rollback()
        print("Error adding product:", e)
        return jsonify({"error": str(e)}), 500

# -------------------------------
# PUT - Update product with supply logging
# -------------------------------
@product_bp.route('/<product_id>', methods=['PUT'])
def update_product(product_id):
    try:
        data = request.get_json()
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'message': 'Product not found'}), 404

        old_quantity = product.Pro_qun
        product.Pro_name = data.get('Pro_name')
        product.Pro_price = float(data.get('Pro_price'))
        product.Pro_qun = int(data.get('Pro_qun'))
        product.pro_cate = data.get('pro_cate')
        product.pro_sell = data.get('pro_sell')
        product.remin_qun = int(data.get('remin_qun'))

        new_quantity = product.Pro_qun
        matched_sp_id = None

        if new_quantity > old_quantity:
            supplied_quantity = new_quantity - old_quantity
            supply_date = datetime.now().strftime('%Y-%m-%d')
            total_price = product.Pro_price * supplied_quantity

            prefix_match = re.match(r'^[A-Z]{2,4}', product_id)
            prefix = prefix_match.group() if prefix_match else None

            supplier = Supplier.query.filter(
                Supplier.Pro_id.like(f'{prefix}%')
            ).first() if prefix else None

            matched_sp_id = supplier.Sp_id if supplier else None

            supply_update = SupplyUpdate(
                Pro_id=product_id,
                Supplied_quantity=supplied_quantity,
                sp_date=supply_date,
                Sp_id=matched_sp_id or product.Sp_id,
                Pro_name=product.Pro_name,
                Pro_price=product.Pro_price,
                Pro_totalprice=total_price
            )
            db.session.add(supply_update)

        db.session.commit()
        return jsonify({
            'message': 'Product updated and supply logged',
            'supplier_matched': matched_sp_id is not None
        }), 200

    except Exception as e:
        db.session.rollback()
        print("Error updating product:", e)
        return jsonify({
            'message': 'Error updating product',
            'error': str(e)
        }), 500
