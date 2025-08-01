import React, { useState, useEffect,useContext } from 'react';
import axios from 'axios';
import { CartContext } from '../../main';

const ProductSearch = ({ setFilteredProducts }) => {
  const {cart , setCart} = useContext(CartContext)
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const API_PRODUCTS = import.meta.env.VITE_API_PRODUCTS;

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}${API_PRODUCTS}`)
      .then(res => setProducts(res.data))
      .catch(err => console.error("Failed to fetch products", err));
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (setFilteredProducts) {
      const filtered = products.filter(p =>
        p.Pro_name?.toLowerCase().includes(value.toLowerCase()) ||
        p.Pro_id?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      const matched = products.find(
        p => p.Pro_id?.toLowerCase() === query.trim().toLowerCase()
      );

      if (matched) {
        const existing = cart.find(item => item.Pro_id === matched.Pro_id);
        if (existing) {
          const updatedCart = cart.map(item =>
            item.Pro_id === matched.Pro_id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
          setCart(updatedCart);
        } else {
          setCart([...cart, { ...matched, quantity: 1 }]);
          if (setFilteredProducts) setFilteredProducts(products);
        }
        setQuery("");
      }
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-yellow-400 shadow">
      <input
        type="text"
        placeholder="Search by name or ID..."
        value={query}
        onChange={handleSearch}
        onKeyDown={handleKeyPress}
        className="flex-grow px-4 py-2 border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-black placeholder-gray-600"
      />
      <button className="p-2 bg-yellow-400 hover:bg-black rounded-md transition">
        <img
          src="./images/search.png"
          alt="Search"
          className="w-5 h-5 invert"
        />
      </button>
    </div>
  );
};

export default ProductSearch;
