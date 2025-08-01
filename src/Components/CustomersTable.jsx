import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const CUSTOMERS_ENDPOINT = import.meta.env.VITE_API_CUSTOMERS;

const CustomersTable = () => {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    C_id: "",
    C_name: "",
    C_phone: "",
    C_email: "",
    C_creditb: "",
    C_debitb: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}${CUSTOMERS_ENDPOINT}`);
      setCustomers(res.data);
    } catch (error) {
      Swal.fire({
        title: "Fetch Error",
        text: "Unable to fetch customer data.",
        icon: "error",
        confirmButtonColor: "#facc15",
      });
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const customerData = { ...form };

    try {
      if (!editingId) {
        delete customerData.C_id;
        await axios.post(`${API_BASE_URL}${CUSTOMERS_ENDPOINT}`, customerData);
        Swal.fire({
          title: "Success",
          text: "Customer added successfully!",
          icon: "success",
          confirmButtonColor: "#facc15",
        });
      } else {
        await axios.put(
          `${API_BASE_URL}${CUSTOMERS_ENDPOINT}/${editingId}`,
          customerData
        );
        Swal.fire({
          title: "Updated",
          text: "Customer updated successfully!",
          icon: "success",
          confirmButtonColor: "#facc15",
        });
      }
      resetForm();
      fetchCustomers();
    } catch (error) {
      Swal.fire({
        title: "Save Error",
        text: "Error saving customer data.",
        icon: "error",
        confirmButtonColor: "#facc15",
      });
    }
  };

  const handleEdit = (cust) => {
    setForm(cust);
    setEditingId(cust.C_id);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({
      C_id: "",
      C_name: "",
      C_phone: "",
      C_email: "",
      C_creditb: "",
      C_debitb: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <section className="min-h-screen bg-yellow-100 text-black p-4">
      <section className="max-w-8xl mx-auto">
        <section className="text-3xl font-bold border-b-4 border-black pb-2 mb-6">
          Customer Management
        </section>

        <button
          onClick={() => setShowForm(true)}
          className="bg-black text-white px-4 py-2 rounded hover:bg-yellow-400 hover:text-black transition"
        >
          Add Customer
        </button>

        {showForm && (
          <section className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
            <section className="bg-white p-6 rounded-lg shadow-lg border border-black w-full max-w-lg relative">
              <button
                onClick={resetForm}
                className="absolute top-2 right-2 text-black text-xl font-bold hover:text-red-500"
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-4">
                {editingId ? "Edit Customer" : "Add Customer"}
              </h2>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {["C_name", "C_phone", "C_email", "C_creditb", "C_debitb"].map(
                  (field) => (
                    <input
                      key={field}
                      name={field}
                      placeholder={field.replace("C_", "")}
                      value={form[field]}
                      onChange={handleChange}
                      required={["C_name", "C_phone"].includes(field)}
                      className="w-full border border-black p-2 rounded bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    />
                  )
                )}
                <section className="col-span-2 flex gap-4 mt-2">
                  <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded hover:bg-yellow-400 hover:text-black transition"
                  >
                    {editingId ? "Update" : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-yellow-300 text-black px-4 py-2 rounded hover:bg-yellow-400"
                  >
                    Cancel
                  </button>
                </section>
              </form>
            </section>
          </section>
        )}

        <section className="overflow-x-auto bg-white rounded-lg shadow border border-black mt-6">
          <table className="min-w-full text-sm sm:text-base text-left text-black">
            <thead className="bg-yellow-300 uppercase">
              <tr>
                <th className="px-4 py-3 border border-black">ID</th>
                <th className="px-4 py-3 border border-black">Name</th>
                <th className="px-4 py-3 border border-black">Phone</th>
                <th className="px-4 py-3 border border-black">Email</th>
                <th className="px-4 py-3 border border-black">Credit</th>
                <th className="px-4 py-3 border border-black">Debit</th>
                <th className="px-4 py-3 border border-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length > 0 ? (
                customers.map((cust) => (
                  <tr
                    key={cust.C_id}
                    className="odd:bg-yellow-50 even:bg-white hover:bg-yellow-200 transition"
                  >
                    <td className="px-4 py-2 border border-black">
                      {cust.C_id}
                    </td>
                    <td className="px-4 py-2 border border-black">
                      {cust.C_name}
                    </td>
                    <td className="px-4 py-2 border border-black">
                      {cust.C_phone}
                    </td>
                    <td className="px-4 py-2 border border-black">
                      {cust.C_email}
                    </td>
                    <td className="px-4 py-2 border border-black">
                      {cust.C_creditb}
                    </td>
                    <td className="px-4 py-2 border border-black">
                      {cust.C_debitb}
                    </td>
                    <td className="px-4 py-2 border border-black">
                      <button
                        onClick={() => handleEdit(cust)}
                        className="bg-black text-white px-3 py-1 rounded hover:bg-yellow-400 hover:text-black"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center px-4 py-4 border border-black"
                  >
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </section>
    </section>
  );
};

export default CustomersTable;
