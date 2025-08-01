import SuppliersTable from './SuppliersTable';

const SuppliersList = () => {
  return (
    <section className="w-full min-h-screen bg-yellow-100 p-4 md:p-6 lg:p-8">
      <section className="max-w-8xl mx-auto bg-white border-2 border-black rounded-2xl shadow-lg p-6">
        <section className="text-center mb-6">
          <h2 className="text-3xl font-bold text-black">Suppliers List</h2>
        </section>

        <section>
          <SuppliersTable />
        </section>
      </section>
    </section>
  );
};

export default SuppliersList;
