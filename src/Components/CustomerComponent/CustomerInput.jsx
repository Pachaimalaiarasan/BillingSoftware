import React, { useState } from 'react';
import Swal from 'sweetalert2';

const CustomerInput = ({ setCustomers }) => {
  const [inputId, setInputId] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const API_CUSTOMERS = import.meta.env.VITE_API_CUSTOMERS;

  const handleCheckCustomer = async () => {
    if (!inputId) {
      Swal.fire({
        title: 'Missing Input',
        text: 'Please enter a customer ID.',
        icon: 'warning',
        confirmButtonColor: '#facc15'
      });
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}${API_CUSTOMERS}/${inputId}`);
      if (res.ok) {
        const customer = await res.json();
        setCustomers(customer);
      } else if (res.status === 404) {
        Swal.fire({
          title: 'Not Found',
          text: 'Customer not found.',
          icon: 'info',
          confirmButtonColor: '#facc15'
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: 'Error checking customer.',
          icon: 'error',
          confirmButtonColor: '#facc15'
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Network Error',
        text: 'Error fetching customer.',
        icon: 'error',
        confirmButtonColor: '#facc15'
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCheckCustomer();
    }
  };

  return (
    <section className="flex flex-wrap items-center gap-3 p-3 bg-white border border-yellow-400 rounded-lg shadow-md">
      <img
        src="./images/person_24dp_E3E3E_FILL0_wght400_GRAD0_opsz24.png"
        alt="Customer Icon"
        className="w-6 h-6"
      />
      <input
        type="text"
        placeholder="Enter Customer ID"
        value={inputId}
        onChange={(e) => setInputId(e.target.value.toUpperCase())}
        onKeyDown={handleKeyDown}
        className="flex-grow p-2 rounded border border-black text-black placeholder-gray-500 outline-none focus:ring-2 focus:ring-yellow-400"
      />
      <button
        onClick={handleCheckCustomer}
        className="bg-yellow-400 text-black px-4 py-1 rounded hover:bg-yellow-500 transition"
      >
        Check
      </button>
    </section>
  );
};

export default CustomerInput;
