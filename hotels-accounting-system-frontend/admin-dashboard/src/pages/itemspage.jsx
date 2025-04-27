import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { motion } from "framer-motion";
import StatCard from "../components/StatCard";
import { ShoppingCart, Package, ShoppingBag, DollarSign } from "lucide-react";
import axios from "axios";
import ProductCards from "../pages/ProductCard";
import { t } from "i18next";
import { useLocation, useNavigate } from "react-router-dom"; // Add imports


// Product Card Component

// Main App Component
export default function ProductCardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [featuredItems, setFeaturedItems] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [cart, setCart] = useState([]); // Add cart state here
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  
// In useEffect
useEffect(() => {
    const storedBooking = sessionStorage.getItem("currentBooking");
     if (location.state?.bookingId) {
      const bid = Number(location.state.bookingId);
      setSelectedBookingId(bid);
      sessionStorage.setItem("currentBooking", bid);
    } else if (storedBooking) {
      setSelectedBookingId(Number(storedBooking));
    } else {
      alert("No booking selected");
      navigate("/bookings");
    }
  }, [location, navigate]);
 
  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };
  const handlePlaceOrder = async () => {
    try {
      // Validate cart before submission
 
  
      // Create properly formatted order data
      const orderData = cart.map(item => ({
        item_id: Number(item.id),
        booking_id: Number(selectedBookingId),
        quantity: Number(item.quantity),
        price_per_item: parseFloat(item.price),
        total_price: parseFloat(item.price) * Number(item.quantity)
      }));
   
   
      // Check booking validity
    //   const bookingCheck = await axios.get(
    //     `http://127.0.0.1:8000/api/bookings/${selectedBookingId}`,
    //     {
    //       headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    //     }
    //   );
  
      // Send order data with proper structure
      const response = await axios.post(
        "http://127.0.0.1:8000/api/orders",
        { orders: orderData }, // Keep the { orders: [...] } wrapper
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
          }
        }
      );
  
      // Handle success
      if (response.status === 201) {
        setCart([]);
        setShowCartModal(false);
        // alert(t("order_placed"));
        navigate("/bookings"); // Redirect after success
      }
  
    } catch (error) {
      // Enhanced error handling
      console.error("Full error object:", error);
      
      const errorDetails = error.response?.data?.errors || 
                         error.response?.data?.message || 
                         "Please check your data and try again";
  
      console.error("Validation errors:", errorDetails);
      
      setError(`Order failed: ${JSON.stringify(errorDetails)}`);
      alert(`Order failed:\n${JSON.stringify(errorDetails, null, 2)}`);
    }
  };

// When adding to cart, ensure booking_id is included
const addToCart = (product, quantity) => {
    if (!selectedBookingId) {
      alert("Please select a booking first");
      return;
    }
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prevCart, { 
        ...product, 
        quantity, 
        booking_id: selectedBookingId
      }];
    });
  };
  useEffect(() => {
    // Fetch products
    axios
      .get("http://127.0.0.1:8000/api/items", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        // console.log("API Response:", response.data);

        // Check if response.data is an array
        let itemsArray = [];
        if (Array.isArray(response.data)) {
          itemsArray = response.data;
        } else if (response.data && typeof response.data === "object") {
          // Check if it might be inside a property like "data" or "items"
          if (Array.isArray(response.data.data)) {
            itemsArray = response.data.data;
          } else if (Array.isArray(response.data.items)) {
            itemsArray = response.data.items;
          } else {
            // If it's an object with item properties, convert to array
            itemsArray = Object.values(response.data);
          }
        }

        // Ensure we have an array
        if (!Array.isArray(itemsArray)) {
          console.error("Unable to process response data:", response.data);
          itemsArray = [];
        }

        setProducts(itemsArray);
        setTotalProducts(itemsArray.length);

        // Safely calculate stats with proper error handling
        try {
          // Calculate total value
          const value = itemsArray.reduce((sum, items) => {
            const price = parseFloat(items.price);
            return isNaN(price) ? sum : sum + price;
          }, 0);
          setTotalValue(value.toFixed(2));

          // Extract unique categories (if category field exists)
          const categories = new Set(
            itemsArray
              .filter((items) => items.category)
              .map((items) => items.category)
          );
          setTotalCategories(categories.size || 0);

          // Count featured items (if featured field exists)
          const featured = itemsArray.filter((items) => items.featured).length;
          setFeaturedItems(featured);
        } catch (e) {
          console.error("Error processing items data:", e);
        }
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError("Failed to load items data");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const openDeleteModal = (productId) => {
    setProductToDelete(productId);
    setShowModal(true);
  };

  const handleDelete = () => {
    if (!productToDelete) return;

    axios
      .delete(`http://127.0.0.1:8000/api/items/${productToDelete}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(() => {
        setProducts(products.filter((items) => items.id !== productToDelete));
        setTotalProducts((prev) => prev - 1);
        setShowModal(false);
      })
      .catch((err) => {
        console.error("Delete error:", err);
        setError("Failed to delete items");
      });
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title="Items" />
      {error && <p className="text-red-500 px-4">{error}</p>}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-white">Loading products...</p>
        </div>
      ) : (
        <>
          <motion.div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8 m-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {/* <StatCard name="Products" value={totalProducts} icon={Package} color="#34d399" /> */}
            {/* <StatCard name="Total Value" value={`$${totalValue}`} icon={DollarSign} color="#34d399" /> */}
            {/* <StatCard name="Categories" value={totalCategories} icon={ShoppingBag} color="#34d399" /> */}
            {/* <StatCard name="Featured" value={featuredItems} icon={ShoppingCart} color="#34d399" /> */}
          </motion.div>

          <motion.div
            className="px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                Available Products
              </h2>
              <button
                onClick={() => setShowCartModal(true)}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-md flex items-center"
              >
                <ShoppingCart size={16} className="mr-2" /> View Cart (
                {cart.length})
              </button>
            </div>

            {products.length > 0 ? (
              <div className="flex flex-wrap justify-around gap-6 mb-8">
                {products.map((items, index) => (
                  <ProductCards
                    key={items.id || index}
                    items={items}
                    addToCart={addToCart}
                  />
                ))}
              </div>
            ) : (
              <p className="text-white text-center py-8">No products found.</p>
            )}
          </motion.div>
        </>
      )}

 
{showCartModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-gray-800 p-6 rounded-lg w-96 max-h-[80vh] overflow-y-auto">
      <h3 className="text-xl text-white mb-4">Shopping Cart</h3>
 
      {cart.length === 0 ? (
        <p className="text-white">Your cart is empty.</p>
      ) : (
        <>
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center mb-3"
            >
              <div>
                <p className="text-white">{item.name}</p>
                <p className="text-gray-400">
                  Quantity: {item.quantity} × ${item.price}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-white">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-400 ml-2"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-white text-right font-bold">
              Total: ${cart
                .reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                )
                .toFixed(2)}
            </p>
          </div>
        </>
      )}
      
      <div className="mt-4 flex flex-col gap-2">
        {cart.length > 0 && (
          <button
            onClick={handlePlaceOrder}
            className="w-full bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded"
          >
            Place Order
          </button>
        )}
        <button
          onClick={() => setShowCartModal(false)}
          className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-500"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
      
    </div>
  );
}
