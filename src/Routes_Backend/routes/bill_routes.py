from flask import Blueprint, request, jsonify
from Routes_Backend.models.bill_product import Bill, BillItem, billproduct_table
from Routes_Backend.models.product import Product
from datetime import datetime
from extensions import db
from sqlalchemy import Table, MetaData

bill_bp = Blueprint('billproduct', __name__)
billproduct_table = db.Table(
    'billproduct',  # actual DB view or table
    db.metadata,
)


# GET all bills (ORM version)
@bill_bp.route("/billproduct", methods=["GET"])
def get_billproduct():
    try:
        bills = Bill.query.order_by(Bill.date.desc()).all()
        bill_data = []
        for bill in bills:
            items = BillItem.query.filter_by(bill_id=bill.id).all()
            bill_data.append({
                "id": bill.id,
                "customer_id": bill.customer_id,
                "total": float(bill.total),
                "discount": float(bill.discount),
                "final_total": float(bill.final_total),
                "date": bill.date.strftime("%Y-%m-%d"),
                "items": [
                    {
                        "id": item.id,
                        "product_id": item.product_id,
                        "quantity": item.quantity,
                        "price": float(item.price),
                        "total": float(item.total),
                    } for item in items
                ]
            })
        return jsonify(bill_data), 200
    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


# GET single bill by ID
@bill_bp.route("/billproduct/<int:id>", methods=["GET"])
def get_bill_by_id(id):
    try:
        bill = Bill.query.get_or_404(id)
        items = BillItem.query.filter_by(bill_id=bill.id).all()
        bill_data = {
            "id": bill.id,
            "customer_id": bill.customer_id,
            "total": float(bill.total),
            "discount": float(bill.discount),
            "final_total": float(bill.final_total),
            "date": bill.date.strftime("%Y-%m-%d"),
            "items": [
                {
                    "id": item.id,
                    "product_id": item.product_id,
                    "quantity": item.quantity,
                    "price": float(item.price),
                    "total": float(item.total),
                } for item in items
            ]
        }
        return jsonify(bill_data), 200
    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@bill_bp.route("/api/savebill", methods=["POST"])
def save_bill():
    try:
        data = request.get_json()
        customer = data.get('customer')
        products = data.get('products')
        overall_total = float(data.get('total', 0))
        discount = float(data.get('discount', 0))
        final_total = overall_total - discount

        if not customer or not products:
            return jsonify({"error": "Invalid input"}), 400

        customer_id = customer.get('C_id')
        if not customer_id:
            return jsonify({"error": "Customer ID missing"}), 400

        bill = Bill(
            customer_id=customer_id,
            total=overall_total,
            discount=discount,
            final_total=final_total,
            date=datetime.now()
        )
        db.session.add(bill)
        db.session.flush()

        for p in products:
            product_id = p.get('Pro_id')
            quantity = int(p.get('quantity'))
            unit_price = float(p.get('Pro_price'))
            product_total = quantity * unit_price

            product = db.session.get(Product, product_id)
            if not product:
                return jsonify({"error": f"Product {product_id} not found"}), 404
            if product.Pro_qun < quantity:
                return jsonify({"error": f"Not enough stock for {product.Pro_name}"}), 400

            product.Pro_qun -= quantity

            bill_item = BillItem(
                bill_id=bill.id,
                product_id=product_id,
                quantity=quantity,
                price=unit_price,
                total=product_total
            )
            db.session.add(bill_item)

            #  INSERT into billproduct table manually
            db.session.execute(
                billproduct_table.insert().values(
                    b_id=bill.id,
                    C_id=customer_id,
                    Pro_id=product_id,
                    b_proName=product.Pro_name,
                    b_proQun=quantity,
                    b_price=unit_price,
                    b_total=product_total,
                    ov_total=overall_total,
                    total=overall_total,
                    discount=discount,
                    final_total=final_total,
                    b_date=bill.date
                )
            )

        db.session.commit()
        return jsonify({"message": "Bill saved successfully", "bill_id": bill.id}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@bill_bp.route('/api/bills', methods=['GET'])
def get_bills():
    try:
        metadata = MetaData()
        billproduct_table = Table('billproduct', metadata, autoload_with=db.engine)

        with db.engine.connect() as connection:
            result = connection.execute(
                db.select(billproduct_table)
                .order_by(billproduct_table.c.b_date.desc(), billproduct_table.c.b_id)
            ).fetchall()

            bills_dict = {}
            for row in result:
                bill = dict(row._mapping)
                date = bill['b_date'].strftime('%Y-%m-%d') if bill.get('b_date') else 'unknown'
                if date not in bills_dict:
                    bills_dict[date] = []

                formatted_bill = {
                    'b_id': bill['b_id'],
                    'b_proName': bill['b_proName'],
                    'b_proQun': bill['b_proQun'],
                    'b_price': bill['b_price'],
                    'b_total': bill['b_total'],
                    'ov_total': bill['ov_total'],
                    'C_id': bill['C_id'],
                    'Pro_id': bill['Pro_id'],
                    'b_date': date,
                    'total': float(bill['total']) if bill.get('total') else None,
                    'discount': float(bill['discount']) if bill.get('discount') else None,
                    'final_total': float(bill['final_total']) if bill.get('final_total') else None
                }
                bills_dict[date].append(formatted_bill)

            return jsonify(bills_dict), 200
    except Exception as e:
        print("Error fetching bills:", e)
        return jsonify({"error": "Internal server error", "details": str(e)}), 500