import React from 'react';
import CustomersTable from './CustomersTable';

const CustomersList = () => {
  return (
    <section className="min-h-screen bg-yellow-100 text-black flex items-center justify-center p-4">
      <section className="min-w-full max-w-8xl">
        <CustomersTable />
      </section>
    </section>
  );
};

export default CustomersList;
