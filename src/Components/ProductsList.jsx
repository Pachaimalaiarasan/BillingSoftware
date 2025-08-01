import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
import Swal from 'sweetalert2';

// Use environment variables defined in .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_PRODUCTS = import.meta.env.VITE_API_PRODUCTS;
const API_PRODUCT_IMAGES = import.meta.env.VITE_API_PRODUCT_IMAGES;
const API_SUPPLIERS = import.meta.env.VITE_API_SUPPLIERS;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}${API_PRODUCTS}`);
      setProducts(res.data);
      const uniqueCategories = Array.from(new Set(res.data.map(p => p.pro_cate)));
      setCategories(uniqueCategories);
      setFilteredProducts(applyFilters(res.data, searchTerm, selectedCategory));
    } catch (err) {
      console.error('Error fetching products:', err);
      Swal.fire('Error', 'Failed to fetch products.', 'error');
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}${API_SUPPLIERS}`);
      setSuppliers(res.data);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      Swal.fire('Error', 'Failed to fetch suppliers.', 'error');
    }
  };

  const applyFilters = (data, term, category) => {
    let filtered = data;
    if (category !== 'All') filtered = filtered.filter(p => p.pro_cate === category);
    if (term.trim() !== '') {
      filtered = filtered.filter(p =>
        p.Pro_name.toLowerCase().includes(term.toLowerCase()) ||
        p.pro_cate.toLowerCase().includes(term.toLowerCase())
      );
    }
    return filtered;
  };

  const handleFilterCategory = (category) => {
    setSelectedCategory(category);
    setFilteredProducts(applyFilters(products, searchTerm, category));
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setFilteredProducts(applyFilters(products, term, selectedCategory));
  };

  const handleEditClick = (product) => {
    setEditingProduct({ ...product });
  };

  const handleChange = (e) => {
    setEditingProduct({ ...editingProduct, [e.target.name]: e.target.value });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleSave = async () => {
    try {
      await axios.put(`${API_BASE_URL}${API_PRODUCTS}/${editingProduct.Pro_id}`, editingProduct);
      fetchProducts();
      setEditingProduct(null);
      Swal.fire('Success', 'Product updated successfully!', 'success');
    } catch (err) {
      console.error('Error updating product:', err);
      Swal.fire('Error', 'Failed to update product.', 'error');
    }
  };

  const handleComponentRefresh = () => {
    fetchProducts();
    fetchSuppliers();
    setSearchTerm('');
    setSelectedCategory('All');
    setEditingProduct(null);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-black">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Product Management</h2>

      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl border shadow-lg relative">
            <h3 className="text-xl font-semibold mb-4">Edit Product</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {['Pro_name', 'Pro_price', 'Pro_qun', 'pro_cate', 'pro_sell', 'remin_qun'].map(field => (
                <input
                  key={field}
                  name={field}
                  type={field.includes('price') || field.includes('qun') ? 'number' : 'text'}
                  value={editingProduct[field]}
                  onChange={handleChange}
                  placeholder={field}
                  className="border border-gray-300 p-2 rounded-lg shadow-sm"
                />
              ))}
              <select
                name="Sp_id"
                value={editingProduct.Sp_id || ''}
                onChange={handleChange}
                className="border p-2 rounded-lg shadow-sm"
              >
                <option value="">Select Supplier</option>
                {suppliers.map(s => (
                  <option key={s.Sp_id} value={s.Sp_id}>{s.Sp_name}</option>
                ))}
              </select>
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
              <button onClick={handleCancelEdit} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400">Cancel</button>
            </div>
            <button
              onClick={handleCancelEdit}
              className="absolute top-3 right-4 text-2xl font-bold text-black hover:text-red-500"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Filters & Actions */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
        <button onClick={() => setShowFilters(!showFilters)} className="bg-yellow-500 text-black px-4 py-2 rounded shadow">
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        <div className="flex gap-3">
          <Link to="/Suppliy_Product_List" className="bg-yellow-400 px-3 py-1 rounded text-black">Supply List</Link>
          <Link to="/AddProduct" className="bg-yellow-400 px-3 py-1 rounded text-black">Add Product</Link>
          <button
            onClick={handleComponentRefresh}
            className="bg-black p-2 rounded-full hover:rotate-180 transition-transform duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filters UI */}
      {showFilters && (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleFilterCategory('All')}
              className={`px-3 py-1 rounded ${selectedCategory === 'All' ? 'bg-black text-white' : 'bg-yellow-400 text-black hover:bg-yellow-300'}`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleFilterCategory(cat)}
                className={`px-3 py-1 rounded ${selectedCategory === cat ? 'bg-black text-white' : 'bg-yellow-400 text-black hover:bg-yellow-300'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
            className="p-2 rounded border shadow w-full sm:w-60"
          />
        </div>
      )}

      {/* Product Table */}
      <div className="overflow-x-auto shadow rounded-lg border border-black">
        <table className="min-w-full table-auto bg-white text-left text-sm border-collapse">
          <thead className="bg-black text-white sticky top-0">
            <tr>
              {['Image', 'ID', 'Name', 'Price', 'Category', 'Stock', 'Supplier ID', 'Total', 'Actions'].map(header => (
                <th key={header} className="px-4 py-2">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length ? filteredProducts.map(p => (
              <tr key={p.Pro_id} className="border-b hover:bg-yellow-100">
                <td className="p-2">
                  {p.pro_photo ? (
                    <img
                      src={`${API_PRODUCT_IMAGES}${p.pro_photo}`}
                      alt={p.Pro_name}
                      className="w-12 h-12 object-cover rounded-md"
                      onError={(e) => {
                        e.target.src = '/images/default-product.png';
                        e.target.onerror = null;
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                      <span className="text-xs text-gray-500">No Image</span>
                    </div>
                  )}
                </td>
                <td className="p-2">{p.Pro_id}</td>
                <td className="p-2">{p.Pro_name}</td>
                <td className="p-2">₹ {p.Pro_price}</td>
                <td className="p-2">{p.pro_cate}</td>
                <td className="p-2">{p.Pro_qun}</td>
                <td className="p-2">{p.Sp_id}</td>
                <td className="p-2">₹ {p.Total}</td>
                <td className="p-2">
                  <button
                    onClick={() => handleEditClick(p)}
                    className="bg-yellow-400 text-black px-2 py-1 rounded hover:bg-yellow-500"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="10" className="text-center py-4 text-gray-500">No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;
