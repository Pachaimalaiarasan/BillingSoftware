import React, { useState, useContext } from 'react';
import { CartContext } from '../../main';

const Product = ({ pro }) => {
  const [proQuantity, setProQuantity] = useState(0);
  const {cart, setCart} = useContext(CartContext);
  const addCart = () => {
    setCart([...cart, { ...pro, quantity: 1 }]);
    setProQuantity(1);
  };

  const proQuantityIncrease = () => {
    setProQuantity(prev => prev + 1);
    const updatedCart = cart.map(item =>
      item.Pro_id === pro.Pro_id ? { ...item, quantity: item.quantity + 1 } : item
    );
    setCart(updatedCart);
  };

  const proQuantityDecrease = () => {
    if (proQuantity > 1) {
      setProQuantity(prev => prev - 1);
      const updatedCart = cart.map(item =>
        item.Pro_id === pro.Pro_id ? { ...item, quantity: item.quantity - 1 } : item
      );
      setCart(updatedCart);
    } else {
      setProQuantity(0);
      setCart(cart.filter(item => item.Pro_id !== pro.Pro_id));
    }
  };

  const isInCart = cart.some(item => item.Pro_id === pro.Pro_id);

  return (
    <section className="bg-white border border-yellow-400 rounded-xl shadow hover:shadow-lg p-4 flex flex-col items-center transition">
      {/* Product Image */}
      <div className="w-32 h-32 mb-3">
        <img
          src={`/public/ProductImages/${pro.pro_photo}`}
          alt={pro.Pro_name || "Product"}
          className="w-full h-full object-cover rounded"
        />
      </div>

      {/* Product Name and Price */}
      <h1 className="text-md font-semibold text-black text-center">{pro.Pro_name}</h1>
      <h2 className="text-yellow-500 font-bold text-lg mb-3">₹{pro.Pro_price}</h2>

      {/* Add/Update Cart */}
      {isInCart && proQuantity > 0 ? (
        <div className="flex items-center gap-2">
          <button
            onClick={proQuantityDecrease}
            className="bg-black text-white px-3 py-1 rounded hover:bg-yellow-400 hover:text-black"
          >
            −
          </button>
          <span className="text-black font-bold">{proQuantity}</span>
          <button
            onClick={proQuantityIncrease}
            className="bg-black text-white px-3 py-1 rounded hover:bg-yellow-400 hover:text-black"
          >
            +
          </button>
        </div>
      ) : (
        <button
          onClick={addCart}
          className="mt-2 bg-yellow-400 text-black font-semibold px-4 py-2 rounded hover:bg-black hover:text-white"
        >
          Buy
        </button>
      )}
    </section>
  );
};

export default Product;
