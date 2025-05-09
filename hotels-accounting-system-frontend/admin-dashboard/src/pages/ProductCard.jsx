import React from 'react';
import { useState } from 'react';
import { Plus, Minus } from "lucide-react";
import { useTranslation } from 'react-i18next';

const ProductCard = ({ item, addToCart }) => { // Changed prop name to 'item'
  const { t, i18n } = useTranslation("items");
  const [count, setCount] = useState(0);

  const increaseCount = () => {
    setCount(prevCount => prevCount + 1);
  };

  const decreaseCount = () => {
    setCount(prevCount => (prevCount > 0 ? prevCount - 1 : 0));
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden w-72 m-4"> {/* Added fixed width */}
      <img
        src={`http://localhost:8000/storage/${item.image}`}
        alt={item.name}
        className="w-full h-48 object-cover"
        onError={(e) => { 
          e.target.onerror = null; 
          e.target.src = '/placeholder-image.png' // Add fallback image
        }}
      />
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg text-white">{item.name}</h3>
          <p className="text-xl font-bold text-white">${item.price}</p> 
        </div>

        <div className="flex items-center justify-center mt-6">
          <button
            onClick={decreaseCount}
            className="p-2 rounded-l bg-red-700 text-white hover:bg-red-600" /* Added hover */
            style={i18n.language === "ar" ? { transform: "scaleX(-1)" } : {}}
          >
            <Minus size={16} />
          </button>

          <span className="px-4 py-1 bg-gray-700 text-center w-16 text-white">
            {count}
          </span>

          <button
            onClick={increaseCount}
            className="p-2 rounded-r bg-blue-600 text-white hover:bg-blue-500" /* Added hover */
            style={i18n.language === "ar" ? { transform: "scaleX(-1)" } : {}}
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          onClick={() => {
            addToCart(item, count);
            setCount(0);
          }}
          disabled={count === 0}
          className={`w-full mt-4 text-white py-2 px-4 rounded transition-colors ${
            count === 0 ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'
          }`}
        >
          {t("Add to Cart")}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;