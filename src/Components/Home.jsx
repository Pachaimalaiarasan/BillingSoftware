import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Product from './HomePageComponents/Product.jsx';
import ProductSearch from './HomePageComponents/ProductSearch.jsx';
import Bill from './Bill.jsx';
import { CartContext } from '../main.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_PRODUCTS = import.meta.env.VITE_API_PRODUCTS;


const Home = () => {
  const {cart , setCart} = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [u, setU] = useState(0);
  const [showBill, setShowBill] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchProducts = () => {
    axios
      .get(`${API_BASE_URL}${API_PRODUCTS}`)
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      });
  };

  const handleRefresh = () => {
    fetchProducts();
    setCart([]);
    setU(0);
    setRefreshKey(prevKey => prevKey + 1);
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setShowBill(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [refreshKey]);

  return (
    <div className="min-h-screen bg-white text-black" key={refreshKey}>
      <div className="flex justify-between items-center p-4 border-b border-yellow-300">
        <h1 className="text-xl font-bold">Products</h1>
        <button
          onClick={handleRefresh}
          className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-500 transition flex items-center gap-2"
        >
          {/* Refresh Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
          Refresh
        </button>
      </div>

      <div className="p-4 border-b border-yellow-300">
        
        <ProductSearch setFilteredProducts={setProducts} />
      </div>

      <div className="flex flex-col md:flex-row">
        <div className="flex-1 p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto">
          {products.map(pro => (
           

            <Product
            key={pro.Pro_id}
            pro={pro}
           
          />
          ))}
        </div>

        {!isMobile && (
          <div className="md:w-1/3 bg-yellow-100 border-l border-yellow-300 p-4 max-h-[70vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-2">🧾 Your Bill</h2>
            {/* <Bill cart={cart} setCart={setCart} /> */}
            <Bill />
          </div>
        )}
      </div>

      {isMobile && (
        <div className="fixed bottom-4 left-4 right-4 flex justify-center">
          <button
            onClick={() => setShowBill(true)}
            className="bg-yellow-400 text-black px-6 py-2 rounded-full shadow-lg font-bold"
          >
            Show Cart
          </button>
        </div>
      )}

      {isMobile && showBill && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-11/12 max-w-md max-h-[70vh] overflow-y-auto p-4">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold">🧾 Your Bill</h2>
              <button
                onClick={() => setShowBill(false)}
                className="text-black hover:text-red-500 font-bold text-xl"
              >
                ×
              </button>
            </div>
            {/* <Bill cart={cart} setCart={setCart} /> */}
            <Bill  />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
