import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    pro_id: '',
    name: '',
    price: '',
    quantity: '',
    total: '',
    category: '',
    sell: '',
    sp_id: '',
    remin_qun: '',
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const API_PRODUCTS = import.meta.env.VITE_API_PRODUCTS;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    if (file) {
      data.append('image', file);
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}${API_PRODUCTS}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // alert('Product added successfully!');

        Swal.fire({
              icon: 'success',
              title: 'Products Saved',
              text: `Product saved successfully`,
              confirmButtonColor: '#facc15',
            });

      setFormData({
        pro_id: '',
        name: '',
        price: '',
        quantity: '',
        total: '',
        category: '',
        sell: '',
        sp_id: '',
        remin_qun: '',
      });
      setFile(null);
    } catch (error) {
      console.error('Error uploading product:', error);
      Swal.fire({
        icon: 'warning',
        title: 'Failed to add product',
        text: `Please check Unique Product ID`,
        confirmButtonColor: '#facc15',
      });
      // alert('Failed to add product. Please check Unique Product ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-yellow-50 p-4">
      <section className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6">
        <section className="text-center mb-6">
          <h2 className="text-2xl font-bold text-black">Add New Product</h2>
        </section>

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
          {Object.keys(formData).map((key) => (
            <section key={key} className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label htmlFor={key} className="sm:w-40 text-black font-medium capitalize">
                {key.replace(/_/g, ' ')}
              </label>
              <input
                type="text"
                name={key}
                id={key}
                value={formData[key]}
                onChange={handleChange}
                required
                className="flex-1 px-4 py-2 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </section>
          ))}

          <section className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label htmlFor="image" className="sm:w-40 text-black font-medium">
              Product Image
            </label>
            <input
              type="file"
              name="image"
              id="image"
              onChange={handleFileChange}
              accept="image/*"
              required
              className="flex-1 text-sm text-black file:bg-yellow-400 file:text-black file:border-none file:px-4 file:py-2 file:rounded-lg file:cursor-pointer"
            />
          </section>

          <section className="text-center mt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-6 py-2 rounded-full hover:bg-yellow-500 hover:text-black transition duration-300 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </section>
        </form>
      </section>
    </section>
  );
};

export default AddProduct;
