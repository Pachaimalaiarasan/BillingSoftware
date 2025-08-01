import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

// Use environment variables instead of server.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const SUPPLIERS_ENDPOINT = import.meta.env.VITE_API_SUPPLIERS;

const SuppliersTable = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({
    Sp_name: "",
    Sp_phone: "",
    Sp_email: "",
    Sp_credith: "",
    Sp_debith: "",
    Pro_id: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}${SUPPLIERS_ENDPOINT}`);
      setSuppliers(res.data);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      Swal.fire({
        title: "Error",
        text: "Failed to fetch suppliers.",
        icon: "error",
        confirmButtonColor: "#facc15"
      });
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}${SUPPLIERS_ENDPOINT}/${editingId}`, form);
        Swal.fire({
          title: "Success",
          text: "Supplier updated successfully!",
          icon: "success",
          confirmButtonColor: "#facc15"
        });
      } else {
        await axios.post(`${API_BASE_URL}${SUPPLIERS_ENDPOINT}`, form);
        Swal.fire({
          title: "Added",
          text: "Supplier added successfully!",
          icon: "success",
          confirmButtonColor: "#facc15"
        });
      }
      resetForm();
      fetchSuppliers();
      setShowModal(false);
    } catch (err) {
      console.error("Full error object:", err);

      if (err.response) {
        Swal.fire({
          title: "Error",
          text: `${err.response.data.error}\n${err.response.data.details || ''}`,
          icon: "error",
          confirmButtonColor: "#facc15"
        });
      } else if (err.request) {
        Swal.fire({
          title: "Network Error",
          text: "No response from server. Check your network connection.",
          icon: "warning",
          confirmButtonColor: "#facc15"
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "Error setting up request: " + err.message,
          icon: "error",
          confirmButtonColor: "#facc15"
        });
      }
    }
  };

  const handleEdit = (supplier) => {
    setForm({ ...supplier });
    setEditingId(supplier.Sp_id);
    setShowModal(true);
  };

  const handleCancel = () => {
    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setForm({
      Sp_name: "",
      Sp_phone: "",
      Sp_email: "",
      Sp_credith: "",
      Sp_debith: "",
      Pro_id: ""
    });
    setEditingId(null);
  };

  return (
    <section className="w-full min-h-screen bg-yellow-100 p-4">
      <section className="max-w-8xl mx-auto">
        <section className="flex flex-wrap justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-black">Supplier Management</h2>
          <button
            className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            Add Supplier
          </button>
        </section>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex justify-center items-center z-20">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg relative border border-black">
              <h3 className="text-xl font-semibold mb-4 text-black">
                {editingId ? "Edit Supplier" : "Add Supplier"}
              </h3>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {["Sp_name", "Sp_phone", "Sp_email", "Sp_credith", "Sp_debith", "Pro_id"].map((field) => (
                  <input
                    key={field}
                    name={field}
                    placeholder={field.replace("Sp_", "").toUpperCase()}
                    value={form[field]}
                    onChange={handleChange}
                    required={["Sp_name", "Sp_phone"].includes(field)}
                    className="p-2 border border-black rounded"
                  />
                ))}
                <section className="col-span-full flex gap-4 mt-2">
                  <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                  >
                    {editingId ? "Update" : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500"
                  >
                    Cancel
                  </button>
                </section>
              </form>
              <button
                onClick={handleCancel}
                className="absolute top-2 right-3 text-2xl font-bold text-black hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <section className="overflow-x-auto mt-6">
          <table className="min-w-full table-auto border border-black text-black">
            <thead className="bg-yellow-300">
              <tr>
                {["ID", "Name", "Phone", "Email", "Credit", "Debit", "Product", "Actions"].map((head) => (
                  <th key={head} className="border border-black px-4 py-2 text-left">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {suppliers.map((sup) => (
                <tr
                  key={sup.Sp_id}
                  className="odd:bg-yellow-50 even:bg-white hover:bg-yellow-200 transition"
                >
                  <td className="border border-black px-4 py-2">{sup.Sp_id}</td>
                  <td className="border border-black px-4 py-2">{sup.Sp_name}</td>
                  <td className="border border-black px-4 py-2">{sup.Sp_phone}</td>
                  <td className="border border-black px-4 py-2">{sup.Sp_email}</td>
                  <td className="border border-black px-4 py-2">{sup.Sp_credith}</td>
                  <td className="border border-black px-4 py-2">{sup.Sp_debith}</td>
                  <td className="border border-black px-4 py-2">{sup.Pro_id}</td>
                  <td className="border border-black px-4 py-2">
                    <button
                      className="bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-500"
                      onClick={() => handleEdit(sup)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </section>
    </section>
  );
};

export default SuppliersTable;
