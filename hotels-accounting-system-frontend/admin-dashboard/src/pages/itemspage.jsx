import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import axios from "axios";
import ProductCards from "../pages/ProductCard";
import { useLocation, useNavigate } from "react-router-dom"; // Add imports
import { useTranslation } from "react-i18next";

// Product Card Component

// Main App Component
export default function ProductCardPage() {
  const { t } = useTranslation("items");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [cart, setCart] = useState([]); // Add cart state here
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  useEffect(() => {
    // Fetch categories
    axios
      .get("http://127.0.0.1:8000/api/item-categories", {
        // Note the endpoint might be different
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else if (response.data?.data) {
          setCategories(response.data.data);
        }
        setCategoriesLoading(false);
      })
      .catch((err) => console.error("Error fetching categories:", err));

    setCategoriesLoading(false);
  }, []);
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
  // Remove this duplicate useEffect (line 139-201 in your original code)
  // Delete this entire useEffect block:
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let url = "http://127.0.0.1:8000/api/items";
        if (selectedCategory) {
          url += `?category_id=${selectedCategory}`;
        }

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        // Handle different response structures
        const itemsData = response.data.data || response.data;
        const itemsArray = Array.isArray(itemsData) ? itemsData : [];

        setProducts(itemsArray);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load items data");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]); // This will re-run when selectedCategory changes
  const removeFromCart = (itemId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };
  const handlePlaceOrder = async () => {
    try {
      // Validate cart before submission

      // Create properly formatted order data
      const orderData = cart.map((item) => ({
        item_id: Number(item.id),
        booking_id: Number(selectedBookingId),
        quantity: Number(item.quantity),
        price_per_item: parseFloat(item.price),
        total_price: parseFloat(item.price) * Number(item.quantity),
      }));

      // Send order data with proper structure
      const response = await axios.post(
        "http://127.0.0.1:8000/api/orders",
        { orders: orderData }, // Keep the { orders: [...] } wrapper
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Handle success
      if (response.status === 201) {
        setCart([]);
        setShowCartModal(false);
        // alert(t("order_placed"));
        navigate("/orders"); // Redirect after success
      }
    } catch (error) {
      // Enhanced error handling
      console.error("Full error object:", error);

      const errorDetails =
        error.response?.data?.errors ||
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

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...prevCart,
        {
          ...product,
          quantity,
          booking_id: selectedBookingId,
        },
      ];
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
          // console.error("Error processing items data:", e);
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

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title={t("items")} />
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
          ></motion.div>

          <motion.div
            className="px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-white">
                  {t("Available Products")}
                </h2>
                {/* In your JSX */}
                <div className="flex gap-4 items-center">
                  <select
                    value={selectedCategory || ""}
                    onChange={(e) =>
                      setSelectedCategory(e.target.value || null)
                    }
                    className="bg-gray-700 text-white px-3 py-2 rounded-md"
                  >
                    <option value="">{t("All Categories")}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.items_count || 0})
                      </option>
                    ))}
                  </select>

                  {selectedCategory && (
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="text-red-400 hover:text-red-300"
                    >
                      {t("Clear Filter")}
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowCartModal(true)}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-md flex items-center"
                style={{ direction: "ltr" }}
              >
                <ShoppingCart size={16} className="mr-2" /> {t("View Cart")} (
                {cart.length})
              </button>
            </div>

            {products.length > 0 ? (
              <div className="flex flex-wrap justify-around gap-6 mb-8">
                {products.map((item) => (
                  <ProductCards
                    key={item.id}
                    item={item} // Singular prop name
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
            <h3 className="text-xl text-white mb-4">{t("Shopping Cart")}</h3>

            {cart.length === 0 ? (
              <p className="text-white">{t("Your cart is empty.")}</p>
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
                    Total: $
                    {cart
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
