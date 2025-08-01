import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import CustomerBill from './CustomerComponent/CustomerBill';
import { CartContext } from '../main';

const Bill = () => {
  const { cart, setCart } = useContext(CartContext);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [showAddCustomerForm, setShowAddCustomerForm] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({
    C_name: '',
    C_phone: '',
    C_email: '',
    C_creditb: '',
    C_debitb: '',
  });
  const [discount, setDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const CUSTOMERS_ENDPOINT = import.meta.env.VITE_API_CUSTOMERS;
  const SAVE_BILL_ENDPOINT = import.meta.env.VITE_API_SAVE_BILL;

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const total = cart.reduce((acc, product) => acc + product.Pro_price * product.quantity, 0);
    const discountedTotal = total * (1 - discount / 100);
    setFinalTotal(discountedTotal);
  }, [cart, discount]);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}${CUSTOMERS_ENDPOINT}`);
      setCustomers(res.data);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const calculateTotalPrice = () =>
    cart.reduce((acc, product) => acc + product.Pro_price * product.quantity, 0);

  const handleDiscountChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setDiscount(value);
    } else if (e.target.value === '') {
      setDiscount(0);
    }
  };

  const normalizePhoneNumber = (phone) => {
    if (!phone) return null;
    const cleaned = ('' + phone).replace(/\D/g, '');
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return cleaned;
    }
    if (cleaned.length === 10) {
      return `91${cleaned}`;
    }
    return null;
  };

  const handleSaveBill = async () => {
    if (!selectedCustomer) {
      return Swal.fire({
        icon: 'warning',
        title: 'Customer Not Selected',
        text: 'Please select a customer before saving the bill.',
        confirmButtonColor: '#facc15',
      });
    }

    const totalPrice = calculateTotalPrice();
    const discountAmount = (totalPrice * discount) / 100;
    const finalAmount = totalPrice - discountAmount;

    const billData = {
      customer: selectedCustomer,
      products: cart,
      total: totalPrice,
      discount: discountAmount,
      final_total: finalAmount,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}${SAVE_BILL_ENDPOINT}`, billData);
      const { bill_url } = response.data;

      const formattedPhone = normalizePhoneNumber(selectedCustomer.C_phone);
      if (formattedPhone) {
        const customerFirstName = selectedCustomer.C_name.split(' ')[0];

        let billItemsText = cart
          .map(
            (item) =>
              `${item.Pro_name} (x${item.quantity}) - ₹${(item.Pro_price * item.quantity).toFixed(2)}`
          )
          .join('\n');

        const message = `
Your E-Receipt
-----------------------------------
Hello ${customerFirstName},
Thank you for your purchase!

Items:
${billItemsText}
-----------------------------------
Subtotal: ₹${totalPrice.toFixed(2)}
Discount: ₹${discountAmount.toFixed(2)}
Final Total: ₹${finalAmount.toFixed(2)}

Download your full PDF bill here:
${bill_url || 'http://localhost:5000/customer'}

Thank you for shopping with us!
        `;

        // Call backend API to send WhatsApp message via Twilio
        try {
          await axios.post(`${API_BASE_URL}/send-whatsapp`, {
            to: formattedPhone,
            body: message,
          });

          Swal.fire({
            icon: 'success',
            title: 'Bill Saved & WhatsApp Sent!',
            html: `Bill for <strong>${selectedCustomer.C_name}</strong> saved and WhatsApp message sent.`,
            showConfirmButton: true,
            confirmButtonText: 'Download PDF',
            confirmButtonColor: '#25D366',
          }).then((result) => {
            if (result.isConfirmed && bill_url) {
              const link = document.createElement('a');
              link.href = bill_url;
              link.setAttribute('download', `bill_${selectedCustomer.C_name.replace(' ', '_')}.pdf`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          });
        } catch (sendErr) {
          console.error('Error sending WhatsApp via Twilio:', sendErr);
          Swal.fire({
            icon: 'error',
            title: 'WhatsApp Send Failed',
            text: 'Bill saved but failed to send WhatsApp message.',
            confirmButtonColor: '#facc15',
          });
        }
      } else {
        // Customer has no phone number
        Swal.fire({
          icon: 'success',
          title: 'Bill Saved!',
          html: `Bill saved successfully! <br/><br/> <a href="${bill_url}" target="_blank" class="swal2-confirm swal2-styled" style="display:inline-block;">Download PDF</a>`,
          showConfirmButton: false,
        });
      }

      setIsSaved(true);
      setCart([]);
      setDiscount(0);
    } catch (error) {
      console.error('Error saving bill:', error);
      const msg = error.response?.data?.error || 'Failed to save bill.';
      Swal.fire({ icon: 'error', title: 'Save Failed', text: msg, confirmButtonColor: '#facc15' });
    }
  };

  const handleAddCustomerChange = (e) =>
    setNewCustomerForm({ ...newCustomerForm, [e.target.name]: e.target.value });

  const handleAddCustomerSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}${CUSTOMERS_ENDPOINT}`, newCustomerForm);
      const { C_id } = res.data;
      const newCustomer = { ...newCustomerForm, C_id };
      Swal.fire({
        icon: 'success',
        title: 'Customer Added',
        text: `Customer added with ID: ${C_id}`,
        confirmButtonColor: '#facc15',
      });
      setNewCustomerForm({ C_name: '', C_phone: '', C_email: '', C_creditb: '', C_debitb: '' });
      setShowAddCustomerForm(false);
      await fetchCustomers();
      setSelectedCustomer(newCustomer);
    } catch (err) {
      console.error('Error adding customer:', err);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Add Customer',
        text: 'Something went wrong.',
        confirmButtonColor: '#facc15',
      });
    }
  };

  return (
    <section className="bg-white p-4 rounded-xl shadow-lg border border-yellow-400">
      {/* Font Awesome for icons in Swal popup */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
      />

      <CustomerBill
        customers={customers}
        setCustomers={setSelectedCustomer}
        selectedCustomer={selectedCustomer}
      />

      {!selectedCustomer && (
        <button
          onClick={() => setShowAddCustomerForm(true)}
          className="mt-3 mb-4 px-4 py-2 bg-yellow-400 hover:bg-black text-black hover:text-white rounded-md transition"
        >
          Add New Customer
        </button>
      )}

      {showAddCustomerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-30">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border border-yellow-400 relative">
            <h3 className="text-xl font-bold text-black mb-4">Add Customer</h3>
            <form onSubmit={handleAddCustomerSubmit} className="grid gap-3">
              {['C_name', 'C_phone', 'C_email', 'C_creditb', 'C_debitb'].map((field) => (
                <input
                  key={field}
                  name={field}
                  placeholder={field.replace('C_', '').replace('b', ' Balance').toUpperCase()}
                  value={newCustomerForm[field]}
                  onChange={handleAddCustomerChange}
                  required={['C_name', 'C_phone'].includes(field)}
                  type={
                    field.includes('phone') || field.includes('credit') || field.includes('debit')
                      ? 'number'
                      : 'text'
                  }
                  className="p-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              ))}
              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  className="bg-yellow-400 hover:bg-black text-black hover:text-white px-4 py-2 rounded-md"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCustomerForm(false)}
                  className="bg-black text-white hover:bg-yellow-500 px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
            <button
              className="absolute top-2 right-3 text-2xl font-bold text-black hover:text-red-500"
              onClick={() => setShowAddCustomerForm(false)}
            >
              &times;
            </button>
          </div>
        </div>
      )}

      <table className="w-full table-auto border-collapse text-black mb-4 mt-6">
        <thead>
          <tr className="bg-yellow-400 text-black">
            <th className="border border-black px-4 py-2">Product Name</th>
            <th className="border border-black px-4 py-2">Quantity</th>
            <th className="border border-black px-4 py-2">Price</th>
            <th className="border border-black px-4 py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((product) => (
            <tr key={product.Pro_id} className="hover:bg-yellow-100">
              <td className="border border-black px-4 py-2">{product.Pro_name}</td>
              <td className="border border-black px-4 py-2">{product.quantity}</td>
              <td className="border border-black px-4 py-2">₹{product.Pro_price.toFixed(2)}</td>
              <td className="border border-black px-4 py-2">
                ₹{(product.Pro_price * product.quantity).toFixed(2)}
              </td>
            </tr>
          ))}
          <tr className="font-bold bg-yellow-200">
            <td className="border border-black px-4 py-2" colSpan="3">
              Subtotal
            </td>
            <td className="border border-black px-4 py-2">₹{calculateTotalPrice().toFixed(2)}</td>
          </tr>
          <tr className="bg-yellow-100">
            <td className="border border-black px-4 py-2" colSpan="2">
              Discount
            </td>
            <td className="border border-black px-4 py-2">
              <input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={handleDiscountChange}
                className="w-16 p-1 border border-gray-400 rounded text-center"
              />
              %
            </td>
            <td className="border border-black px-4 py-2 text-red-600">
              -₹{(calculateTotalPrice() * discount / 100).toFixed(2)}
            </td>
          </tr>
          <tr className="font-bold bg-yellow-400">
            <td className="border border-black px-4 py-2" colSpan="3">
              Final Total
            </td>
            <td className="border border-black px-4 py-2">₹{finalTotal.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <button
        onClick={handleSaveBill}
        disabled={isSaved || cart.length === 0 || !selectedCustomer}
        className={`w-full py-3 text-lg font-semibold rounded-md transition ${
          isSaved || cart.length === 0 || !selectedCustomer
            ? 'bg-gray-300 text-black cursor-not-allowed'
            : 'bg-yellow-400 hover:bg-black text-black hover:text-white'
        }`}
      >
        {isSaved ? 'Saved' : 'Save Bill & Generate PDF'}
      </button>
    </section>
  );
};

export default Bill;
