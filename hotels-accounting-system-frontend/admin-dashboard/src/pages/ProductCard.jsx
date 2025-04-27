import React from 'react';
import { useState } from 'react';
import {   Plus, Minus } from "lucide-react";

const ProductCard = ({ items, addToCart  }) => {
    const [count, setCount] = useState(0);
  
    const increaseCount = () => {
        setCount(prevCount => prevCount + 1);
      };
    
      const decreaseCount = () => {
        setCount(prevCount => (prevCount > 0 ? prevCount - 1 : 0));
      };
  
    return (
      <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <img
          src={`http://localhost:8000/storage/${items.image}`}
          alt={items.name}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg  text-white">{items.name}</h3>
            <p className="text-xl font-bold ">${items.price}</p>
          </div>
  
          <div className="flex items-center justify-center mt-6">
            <button
              onClick={decreaseCount}
              className="p-2 rounded-l bg-red-700   text-white"
            >
              <Minus size={16} />
            </button>
  
            <span className="px-4 py-1 bg-gray-700 text-center w-16 text-white">
              {count}
            </span>
  
            <button
              onClick={increaseCount}
              className="p-2 rounded-r bg-blue-600 text-white"
            >
              <Plus size={16} />
            </button>
          </div>
  
          <button
          onClick={() => {
            addToCart(items, count);  // Use the prop here
            setCount(0);
          }}
          disabled={count === 0}
          className={`w-full mt-4 text-white py-2 px-4 rounded ${
            count === 0 ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600'
          }`}
        >
          Add to Cart
        </button>
        </div>
 

      </div>
    );
  };
  
  export default ProductCard;