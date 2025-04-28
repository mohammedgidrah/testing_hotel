  import React, { useState, useEffect } from "react";
  import { motion } from "framer-motion";
  import { Edit, Trash2, Plus, Search } from "lucide-react";
  import axios from "axios";
  import { useTranslation } from "react-i18next";
  import { Modal, Button, Form } from "react-bootstrap";
  import { ErrorBoundary } from "react-error-boundary";
  import Header from "../components/Header";

  function ErrorFallback({ error }) {
    return (
      <div className="p-4 text-red-500">
        <h2>Something went wrong:</h2>
        <pre>{error.message}</pre>
      </div>
    );
  }

  export default function Orders() {
    const { t, i18n } = useTranslation("orders");
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showOrderModal, setShowOrderModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [formData, setFormData] = useState({
      item_id: "",
      booking_id: "",
      quantity: "1",
      price_per_item: "",
      total_price: "",
    });
    const [formErrors, setFormErrors] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [orderToDelete, setOrderToDelete] = useState(null);

    // For dropdown options
    const [items, setItems] = useState([]);
    const [bookings, setBookings] = useState([]);

    const fetchOrders = async (retries = 3) => {
      setIsLoading(true);
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/orders", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        // Improved API response handling
        const ordersArray = response.data?.data || [];
        if (!Array.isArray(ordersArray)) {
          throw new Error("Invalid API response format");
        }

        setOrders(ordersArray);
        filterOrders(ordersArray, searchTerm);
        setError(null);
      } catch (err) {
        if (retries > 0 && err.response?.status >= 500) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return fetchOrders(retries - 1);
        }
        setOrders([]);
        const errorMessage =
          err.response?.data?.message ||
          t("fetchError") ||
          "Error fetching orders";
        setError(errorMessage);
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchItems = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/items", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        setItems(response.data?.data || []);
      } catch (err) {
        console.error("Error fetching items:", err);
      }
    };

    const fetchBookings = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/bookings", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        // Handle different response structures
        const bookingsData = response.data?.data || response.data || [];
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        console.log("Bookings response:", response.data);
      }
    };
    useEffect(() => {
      fetchOrders();
      fetchItems();
      fetchBookings();
    }, []);

    useEffect(() => {
      filterOrders(orders, searchTerm);
    }, [searchTerm, orders]);

    const filterOrders = (ordersData, term) => {
      const safeOrders = Array.isArray(ordersData) ? ordersData : [];
      if (!term) {
        setFilteredOrders(safeOrders);
        return;
      }

      const lowerTerm = term.toLowerCase();
      const filtered = safeOrders.filter((order) => {
        const item = items.find((i) => i.id === order.item_id);
        const booking = bookings.find((b) => b.id === order.booking_id);
        const itemName = item ? item.name.toLowerCase() : "";
        const bookingRef = booking ? (booking.reference || "").toLowerCase() : "";

        return (
          String(order.id).toLowerCase().includes(lowerTerm) ||
          itemName.includes(lowerTerm) ||
          bookingRef.includes(lowerTerm) ||
          String(order.quantity).toLowerCase().includes(lowerTerm) ||
          String(order.total_price).toLowerCase().includes(lowerTerm)
        );
      });

      setFilteredOrders(filtered);
    };

    const handleSearch = (e) => {
      setSearchTerm(e.target.value);
    };

    const handleAddOrder = () => {
      setFormData({
        item_id: "",
        booking_id: "",
        quantity: "1",
        price_per_item: "",
        total_price: "",
      });
      setFormErrors({});
      setEditMode(false);
      setSelectedOrderId(null);
      setShowOrderModal(true);
    };

    const handleEditOrder = (order) => {
      const selectedItem = items.find((item) => item.id === order.item_id);
      const itemPrice = selectedItem?.price ? Number(selectedItem.price) : 0;

      setFormData({
        item_id: order?.item_id?.toString() || "",
        booking_id: order?.booking_id?.toString() || "",
        quantity: order?.quantity?.toString() || "1",
        price_per_item: itemPrice.toFixed(2),  
        total_price: order?.total_price ? Number(order.total_price).toFixed(2) : "",

      });
      setFormErrors({});
      setEditMode(true);
      setSelectedOrderId(order?.id || null);
      setShowOrderModal(true);
    };
    
    const handleFormChange = (e) => {
      const { name, value } = e.target;
      
      if (name === "item_id") {
        const selectedItem = items.find((item) => item.id === parseInt(value));
        const quantity = parseInt(formData.quantity) || 1;
        const price = parseFloat(selectedItem?.price) || 0;
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          price_per_item: price.toFixed(2), 
          total_price: (price * quantity).toFixed(2),
        }));
      } else if (name === "quantity") {
        const selectedItem = items.find(
          (item) => item.id === parseInt(formData.item_id)
        );
        const newQuantity = Math.max(1, parseInt(value) || 1);
        const price = parseFloat(selectedItem?.price) || 0;
        const quantity = Math.max(1, parseInt(value) || 1);

        setFormData((prev) => ({
          ...prev,
          [name]: newQuantity,
          total_price: (price * quantity).toFixed(2),
        }));
 
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }

      setFormErrors((prev) => ({ ...prev, [name]: null }));
    };

    const validateForm = () => {
      const errors = {};
      if (!formData.item_id)
        errors.item_id = t("itemRequired") || "Item is required";
      if (!formData.booking_id)
        errors.booking_id = t("bookingRequired") || "Booking is required";

      const quantityValue = parseInt(formData.quantity);
      if (isNaN(quantityValue) || quantityValue <= 0) {
        errors.quantity = t("quantityRequired") || "Valid quantity is required";
      }

      setFormErrors(errors);
      return Object.keys(errors).length === 0;
    };

    const handleSubmitForm = async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      try {
        const headers = {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        };

        // Create FormData for file upload
        const formDataToSend = new FormData();
        formDataToSend.append("item_id", formData.item_id);
        formDataToSend.append("booking_id", formData.booking_id);
        formDataToSend.append("quantity", formData.quantity);
        formDataToSend.append("total_price", formData.total_price);
        formDataToSend.append("price_per_item", formData.price_per_item);

        if (formData.image) {
          formDataToSend.append("image", formData.image);
        }

        let response;
        if (editMode) {
          response = await axios.post(
            `http://127.0.0.1:8000/api/orders/${selectedOrderId}?_method=PUT`,
            formDataToSend,
            { headers }
          );
        } else {
          response = await axios.post(
            "http://127.0.0.1:8000/api/orders",
            formDataToSend,
            { headers }
          );
        }

        await fetchOrders();
        setShowOrderModal(false);
      } catch (err) {
        console.error("Submission error:", err.response || err);
        setFormErrors({
          submit:
            err.response?.data?.message ||
            err.response?.data?.errors?.join(", ") ||
            t("saveError") ||
            "Error saving order",
        });
      }
    };

    const handleConfirmDelete = (id) => {
      setShowDeleteModal(true);
      setOrderToDelete(id);
    };

    const handleDeleteOrder = async () => {
      if (!orderToDelete) return;

      try {
        await axios.delete(`http://127.0.0.1:8000/api/orders/${orderToDelete}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        await fetchOrders(); // Refresh the orders list
        setShowDeleteModal(false);
        setOrderToDelete(null);
      } catch (err) {
        console.error("Delete error:", err);
        const errorMessage =
          err.response?.data?.message ||
          t("deleteError") ||
          "Error deleting order";
        setError(errorMessage);
        setShowDeleteModal(false);
      }
    };

    const getItemName = (itemId) => {
      const item = items.find((item) => item.id === itemId);
      return item ? item.name : `Item ${itemId}`;
    };

    const getBookingReference = (bookingId) => {
      const booking = bookings.find((booking) => booking.id === bookingId);
      return booking
        ? booking.reference || `${bookingId}`
        : `Booking ${bookingId}`;
    };

    return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <motion.div
          className="flex-1 overflow-auto relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ direction: "ltr" }}
        >
          <Header title={t("Orders")} />

          {/* Search and Add Button Section */}
          <div className="flex justify-end items-center mb-6 p-4">
            <div className="flex space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t("Search") || "Search"}
                  className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:w-80 sm:w-40"
                  onChange={handleSearch}
                  value={searchTerm}
                />
                <Search
                  className="absolute left-3 top-2.5 text-gray-400"
                  size={18}
                />
              </div>
              {/* <button
                onClick={handleAddOrder}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center transition-colors"
              >
                <Plus size={18} className="mr-2" />
                {t("addOrder") || "Add Order"}
              </button> */}
            </div>
          </div>

          {/* Orders Table */}
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">
              {t("Loading") || "Loading"}...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {searchTerm
                ? t("NoMatchingOrders") || "No orders match your search"
                : t("NoOrdersFound") || "No orders found"}
            </div>
          ) : (
            <div className="overflow-x-auto m-6 border border-gray-700 rounded-lg">
              <table className="min-w-full divide-y divide-gray-700 rounded-lg">
                {/* Table Header */}
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {t("id") || "ID"}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {t("item") || "Item"}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {t("booking") || "Booking"}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {t("quantity") || "Quantity"}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {t("pricePerItem") || "Price Per Item"}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {t("totalPrice") || "Total Price"}
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {t("actions") || "Actions"}
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-gray-700">
                  {filteredOrders.map((order) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                        {getItemName(order.item_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {getBookingReference(order.booking_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {order.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        ${order.item?.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
  ${parseFloat(order.total_price).toFixed(2)}
</td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 flex">
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="text-blue-500 hover:text-indigo-300 mr-3"
                          aria-label="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleConfirmDelete(order.id)}
                          className="text-red-500 hover:text-red-300"
                          aria-label="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add/Edit Order Modal */}
          <Modal
            show={showOrderModal}
            onHide={() => setShowOrderModal(false)}
            size="lg"
            style={{ direction: "ltr" }}
          >
            <Modal.Header closeButton>
              <Modal.Title>
                {editMode
                  ? t("EditOrder") || "Edit Order"
                  : t("AddNewOrder") || "Add New Order"}
              </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmitForm}>
              <Modal.Body>
                {formErrors.submit && (
                  <div className="alert alert-danger">{formErrors.submit}</div>
                )}

                <Form.Group className="mb-3">
                  <Form.Label>{t("item") || "Item"}</Form.Label>
                  <Form.Select
                    name="item_id"
                    value={formData.item_id}
                    onChange={handleFormChange}
                    isInvalid={!!formErrors.item_id}
                  >
                    <option value="">{t("SelectItem") || "Select Item"}</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} - ${parseFloat(item.price).toFixed(2)}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formErrors.item_id}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>{t("booking") || "Booking"}</Form.Label>
                  <Form.Select
                    name="booking_id"
                    value={formData.booking_id}
                    onChange={handleFormChange}
                    isInvalid={!!formErrors.booking_id}
                  >
                    <option value="">
                      {t("SelectBooking") || "Select Booking"}
                    </option>
                    {bookings.map((booking) => (
                      <option key={booking.id} value={booking.id}>
                        {booking.reference || `Booking ${booking.id}`}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formErrors.booking_id}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>{t("quantity") || "Quantity"}</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleFormChange}
                    min="1"
                    isInvalid={!!formErrors.quantity}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.quantity}
                  </Form.Control.Feedback>
                </Form.Group>
                {/* 
                <Form.Group className="mb-3">
                  <Form.Label>{t("PricePerItem") || "Price Per Item"}</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <Form.Control
                      type="text"
                      name="price_per_item"
                      value={formData.price_per_item}
                      onChange={handleFormChange}
                      isInvalid={!!formErrors.price_per_item}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.price_per_item}
                    </Form.Control.Feedback>
                  </div>
                </Form.Group> */}

                <Form.Group className="mb-3">
                  <Form.Label>{t("totalPrice") || "Total Price"}</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <Form.Control
                      type="text"
                      name="total_price"
                      value={
                        formData.total_price
                          ? Number(formData.total_price).toFixed(2)
                          : ""
                      }
                      readOnly
                    />
                  </div>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShowOrderModal(false)}
                >
                  {t("Cancel") || "Cancel"}
                </Button>
                <Button variant="primary" type="submit">
                  {editMode
                    ? t("SaveChanges") || "Save Changes"
                    : t("AddOrder") || "Add Order"}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal>

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-gray-800 p-6 rounded-lg w-96">
                <h3 className="text-xl text-white mb-4">
                  {t("DeleteConfirmation") ||
                    "Are you sure you want to delete this order?"}
                </h3>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    {t("Cancel") || "Cancel"}
                  </button>
                  <button
                    onClick={handleDeleteOrder}
                    className="bg-red-600 text-white px-4 py-2 rounded"
                  >
                    {t("Delete") || "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </ErrorBoundary>
    );
  }
