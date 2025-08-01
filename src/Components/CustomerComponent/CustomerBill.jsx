import React from 'react';
import CustomerInput from './CustomerInput';

const CustomerBill = ({ customers, setCustomers, selectedCustomer }) => {
  return (
    <section className="mb-6 bg-white border border-yellow-400 p-4 rounded-xl shadow-md">
      <CustomerInput setCustomers={setCustomers} />

      {selectedCustomer && (
        <section className="mt-4 bg-yellow-100 p-4 rounded-lg border border-black">
          <details className="cursor-pointer mb-4">
            <summary className="flex items-center gap-2 text-black font-semibold">
              <img
                src="./images/menu_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.png"
                alt="Menu Icon"
                className="w-5 h-5"
              />
              <span>View Customer Details</span>
            </summary>
            <div className="ml-6 mt-2 text-black">
              <p><strong>ID:</strong> {selectedCustomer.C_id}</p>
              <p><strong>Name:</strong> {selectedCustomer.C_name}</p>
              <p><strong>Email:</strong> {selectedCustomer.C_email}</p>
              <p><strong>Phone:</strong> {selectedCustomer.C_phone}</p>
            </div>
          </details>

          <div className="text-black">
            <h2 className="text-lg font-bold">Customer</h2>
            <h2 className="text-base">
              <span className="font-semibold">Cus-ID:</span>{' '}
              <span className="text-black">{selectedCustomer.C_id}</span>
            </h2>
          </div>
        </section>
      )}
    </section>
  );
};

export default CustomerBill;
