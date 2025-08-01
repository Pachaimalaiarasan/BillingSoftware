import os
from flask import Blueprint, request, jsonify, send_file, render_template_string, current_app
from extensions import db 
from flask_login import LoginManager, UserMixin, login_manager
from reportlab.lib.pagesizes import letter
import io
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Table
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from sqlalchemy import text

# Flask-Login LoginManager 
login_manager = LoginManager()

# Dummy User class to satisfy Flask-Login 
class User(UserMixin):
    def __init__(self, id):
        self.id = id

    def get_id(self):
        return str(self.id)

customer_login_bp = Blueprint('customer_login', __name__)

# Setup user loader for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    return User(user_id)

def get_pdf_dir():
    # Use config or default path
    return current_app.config.get(
        'BILL_PDF_FOLDER',
        r'E:\Entertainment\New folder'  # Adjust to your actual folder
    )

@customer_login_bp.route('/customer')
def index():
    return render_template_string("""
   <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Customer Bill Login</title>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <style>
        /* General Body and Font Styles */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8f9fa;
            margin: 0;
            padding: 20px;
            color: #333;
        }

        /* Login Form Styling */
        .login-form {
            max-width: 400px;
            margin: 80px auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            padding: 40px;
            text-align: center;
        }
        .login-form h2 {
            margin-bottom: 24px;
            color: #212529;
        }
        .login-form input {
            width: 100%;
            padding: 12px 10px;
            font-size: 1.1em;
            border: 1px solid #ced4da;
            border-radius: 8px;
            box-sizing: border-box;
        }

        /* Main Bills Container */
        .bills-container {
            max-width: 1200px;
            margin: 30px auto;
        }

        /* Header for each date group */
        .date-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            margin-top: 20px;
            border-bottom: 2px solid #dee2e6;
        }
        .date-header h3 {
            margin: 0;
            font-size: 1.5em;
            color: #495057;
        }

        /* Table Styling */
        .bill-table-container {
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            margin-top: 20px;
        }
        .bill-table {
            width: 100%;
            border-collapse: collapse;
        }
        .bill-table th, .bill-table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #e9ecef;
        }
        .bill-table thead th {
            background-color: #343a40;
            color: white;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.85em;
            letter-spacing: 0.5px;
        }
        .bill-table tbody tr:last-child td {
            border-bottom: none;
        }
        .bill-table tbody tr:hover {
            background-color: #f1f3f5;
        }
        .bill-table td.final-total, .bill-table td.discount {
            font-weight: bold;
        }
        .bill-table td.final-total {
            color: #28a745; /* Green for final total */
        }
        .bill-table td.discount {
            color: #dc3545; /* Red for discount */
        }

        /* Button Styles */
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            font-size: 0.9em;
            text-decoration: none;
            display: inline-block;
        }
        .btn-login {
            width: 100%;
            background-color: #007bff;
            color: white;
            margin-top: 20px;
        }
        .btn-login:hover {
            background-color: #0056b3;
        }
        .btn-download-date {
            background-color: #28a745;
            color: white;
        }
        .btn-download-date:hover {
            background-color: #218838;
        }
        .btn-pdf {
            background-color: #007bff;
            color: white;
            padding: 8px 15px;
        }
        .btn-pdf:hover {
            background-color: #0056b3;
        }
        .text-center { text-align: center; }
        .no-bills { text-align: center; padding: 40px; font-size: 1.2em; color: #6c757d; }
    </style>
</head>
<body>
    <div id="app">
        <div id="login-block" class="login-form">
            <h2>View Your Bill History</h2>
            <input type="text" id="input-cid" placeholder="Enter Your Customer ID">
            <button id="login-btn" class="btn btn-login">Login</button>
        </div>
        <div id="bills-block" style="display:none;">
            <h1 style="text-align:center" id="welcome-header"></h1>
            <div class="bills-container" id="bills-list"></div>
        </div>
    </div>
    <script>
    const loginBlock = document.getElementById('login-block');
    const billsBlock = document.getElementById('bills-block');
    const billsList = document.getElementById('bills-list');
    const loginBtn = document.getElementById('login-btn');
    const welcomeHeader = document.getElementById('welcome-header');

    let global_cid = null;

    loginBtn.onclick = async function() {
        const cid = document.getElementById('input-cid').value.trim();
        if (cid === '') {
            Swal.fire("Error", "Please enter a Customer ID!", "error");
            return;
        }
        // Mock login check for now
        const res = await fetch('/api/login', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({C_id: cid})
        });
        const data = await res.json();
        if (!data.success) {
            Swal.fire('Login Failed', 'Customer ID not found!', 'error');
            return;
        }
        // Success: fetch bills
        global_cid = cid;
        welcomeHeader.innerText = `Welcome, Customer ${cid}`;
        loginBlock.style.display = 'none';
        billsBlock.style.display = 'block';
        loadBills();
    };

    async function loadBills() {
        billsList.innerHTML = `<p class="text-center">Loading...</p>`;
        const res = await fetch(`/api/customer-bills/${encodeURIComponent(global_cid)}`);
        const data = await res.json();
        if (!data.success || !data.bills.length) {
            billsList.innerHTML = `<div class="no-bills">No bills found for your ID.</div>`;
            return;
        }

        // --- NEW LOGIC TO GROUP BILLS ---
        const billsByDate = data.bills.reduce((acc, bill) => {
            const date = bill.b_date;
            if (!acc[date]) acc[date] = [];
            acc[date].push(bill);
            return acc;
        }, {});

        let finalHtml = '';
        const sortedDates = Object.keys(billsByDate).sort((a, b) => new Date(b) - new Date(a));

        sortedDates.forEach(date => {
            // Group bills on the same date by their bill ID
            const billsOnDate = billsByDate[date].reduce((acc, bill) => {
                const billId = bill.b_id;
                if (!acc[billId]) {
                    acc[billId] = {
                        items: [],
                        customer_id: bill.C_id,
                        discount: bill.discount,
                        final_total: bill.final_total,
                    };
                }
                acc[billId].items.push(bill);
                return acc;
            }, {});

            // Add date header
            finalHtml += `
                <div class="date-header">
                    <h3>Bill Date: ${date}</h3>
                </div>
            `;

            // Add table for this date
            finalHtml += `
                <div class="bill-table-container">
                    <table class="bill-table">
                        <thead>
                            <tr>
                                <th>Customer ID</th>
                                <th>Product Name</th>
                                <th>Product ID</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th>Total</th>
                                <th>Discount</th>
                                <th>Final Total</th>
                                <th>Download</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            for (const billId in billsOnDate) {
                const billGroup = billsOnDate[billId];
                const items = billGroup.items;
                const rowCount = items.length;

                items.forEach((item, index) => {
                    finalHtml += `<tr>`;
                    // For the first item in a bill, add the Customer ID with rowspan
                    if (index === 0) {
                        finalHtml += `<td rowspan="${rowCount}">${billGroup.customer_id}</td>`;
                    }
                    // Item-specific details
                    finalHtml += `
                        <td>${item.b_proName || '-'}</td>
                        <td>${item.Pro_id || '-'}</td>
                        <td>${item.b_proQun || '-'}</td>
                        <td>₹${parseFloat(item.b_price || 0).toFixed(2)}</td>
                        <td>₹${parseFloat(item.b_total || 0).toFixed(2)}</td>
                    `;
                    // For the first item, add bill-level details with rowspan
                    if (index === 0) {
                        finalHtml += `
                            <td class="discount" rowspan="${rowCount}">₹${parseFloat(billGroup.discount || 0).toFixed(2)}</td>
                            <td class="final-total" rowspan="${rowCount}">₹${parseFloat(billGroup.final_total).toFixed(2)}</td>
                            <td rowspan="${rowCount}">
                                <button class="btn btn-pdf" onclick="window.open('/api/bill-pdf/${billId}', '_blank')">PDF</button>
                            </td>
                        `;
                    }
                    finalHtml += `</tr>`;
                });
            }
            finalHtml += `</tbody></table></div>`;
        });

        billsList.innerHTML = finalHtml;
    }
    </script>
</body>
</html>
    """)


@customer_login_bp.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json() or {}
    c_id = data.get('C_id')
    if not c_id:
        return jsonify(success=False, error="C_id not provided"), 400

    query = text("SELECT COUNT(*) AS cnt FROM billproduct WHERE C_id = :c_id")
    result = db.session.execute(query, {'c_id': c_id}).first()

    if result and result.cnt > 0:
        return jsonify(success=True)
    else:
        return jsonify(success=False, error="Invalid Customer ID"), 401


@customer_login_bp.route('/api/customer-bills/<c_id>', methods=['GET'])
def api_customer_bills(c_id):
    query = text("SELECT * FROM billproduct WHERE C_id = :c_id ORDER BY b_date DESC")
    rows = db.session.execute(query, {'c_id': c_id}).mappings().all()
    bills_list = [dict(row) for row in rows]
    return jsonify(success=True, bills=bills_list)



@customer_login_bp.route('/api/bill-pdf/<b_id>', methods=['GET'])
def api_bill_pdf(b_id):
    pdf_dir = get_pdf_dir()
    pdf_path = os.path.join(pdf_dir, f"{b_id}.pdf")
    if os.path.isfile(pdf_path):
        return send_file(pdf_path, as_attachment=True)

    # Fetch all rows 
    query = text("SELECT * FROM billproduct WHERE b_id = :b_id ORDER BY b_proName")
    rows = db.session.execute(query, {'b_id': b_id}).mappings().all()
    if not rows:
        return "Bill not found", 404

    # Assume all fields same in every row of same bill
    meta = rows[0]
    customer_id = meta.get('C_id', '-') or '-'
    bill_date  = meta.get('b_date', '-') or '-'
    downloaded_on = meta.get('b_date', '-') or '-'
    discount = meta.get('discount', 0)
    final_total = meta.get('final_total', meta.get('ov_total', 0)) or 0

    # Table of products
    table_data = [
        ['Product Name', 'Product ID', 'Quantity', 'Unit Price', 'Total']
    ]
    for r in rows:
        table_data.append([
            r.get('b_proName', '-'),
            r.get('Pro_id', '-'),
            r.get('b_proQun', '-'),
            f"₹{float(r['b_price']):.2f}" if r['b_price'] is not None else '-',
            f"₹{float(r['b_total']):.2f}" if r['b_total'] is not None else '-'
        ])

    # Start PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, leftMargin=30, rightMargin=30, topMargin=36, bottomMargin=24)
    styles = getSampleStyleSheet()
    elements = []

    # Big Title
    title_style = ParagraphStyle('TitleLarge', fontSize=18, fontName='Helvetica-Bold', spaceAfter=12)
    elements.append(Paragraph("CUSTOMER BILL INVOICE", title_style))

    #  (Customer ID/Date)
    meta_data = [
        [Paragraph('<b>Customer ID:</b>', styles['Normal']), customer_id,
         Paragraph('<b>Bill Date:</b>', styles['Normal']), str(bill_date)],
        [Paragraph('<b>Downloaded On:</b>', styles['Normal']),
            dayjs_today(), '', '']  # You can implement dayjs_today() to use current time
    ]
    meta_table = Table(meta_data, colWidths=[85, 120, 80, 120])
    meta_table.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 11),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2)
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 12))

    # product table
    wide_tab = Table(table_data, colWidths=[120, 80, 60, 80, 80])
    wide_tab.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.black),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 11),

        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('ALIGN', (0,1), (-1,-1), 'CENTER'),

        ('BACKGROUND', (0,1), (-1,-1), colors.white),
        ('FONTSIZE', (0,1), (-1,-1), 10),
        ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
    ]))
    elements.append(wide_tab)
    elements.append(Spacer(1, 10))

    # Discount/final total summary
    summary_data = [
        ['Discount', f"₹{float(discount):.2f}"],
        ['Final Total', f"₹{float(final_total):.2f}"]
    ]
    summary_table = Table(summary_data, colWidths=[100, 100])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.whitesmoke),
        ('TEXTCOLOR', (0,0), (0,0), colors.black),
        ('FONTNAME', (0,0), (1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (1,0), 11),

        ('TEXTCOLOR', (1,0), (1,0), colors.red),
        ('BACKGROUND', (0,0), (1,0), colors.HexColor("#fff5f5")),

        ('TEXTCOLOR', (1,1), (1,1), colors.green),
        ('FONTNAME', (0,1), (1,1), 'Helvetica-Bold'),
        ('BACKGROUND', (0,1), (1,1), colors.HexColor("#daffc1")),
        ('FONTSIZE', (1,1), (1,1), 13),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#ffe066")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#ffe066")),
    ]))
    elements.append(summary_table)

    elements.append(Spacer(1, 10))
    elements.append(Paragraph("<i>Thank you for shopping with us!</i>", styles["Italic"]))

    doc.build(elements)
    buffer.seek(0)

    # Save for next time
    os.makedirs(pdf_dir, exist_ok=True)
    with open(pdf_path, 'wb') as f:
        f.write(buffer.getbuffer())

    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name=f"Bill_{b_id}.pdf", mimetype='application/pdf')

# Helper for Downloaded On Line: returns local current date/time as str
def dayjs_today():
    from datetime import datetime
    return datetime.now().strftime('%Y-%m-%d %H:%M')
