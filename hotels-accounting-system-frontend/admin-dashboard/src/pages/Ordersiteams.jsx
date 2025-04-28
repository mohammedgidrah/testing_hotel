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

function OrderItems() {
  // Fixed component name
  const { t, i18n } = useTranslation("orderitems");
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showItemModal, setShowItemModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    status: "isavailable",
    image: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };
 
  const fetchItems = async (retries = 3) => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/items/", {
        // Added trailing slash
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      // Improved API response handling
      const itemsArray = response.data?.data || [];
      if (!Array.isArray(itemsArray)) {
        throw new Error("Invalid API response format");
      }

      setItems(itemsArray);
      filterItems(itemsArray, searchTerm);
      setError(null);
    } catch (err) {
      if (retries > 0 && err.response?.status >= 500) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return fetchItems(retries - 1);
      }
      setItems([]);
      const errorMessage =
        err.response?.data?.message ||
        t("fetchError") ||
        "Error fetching items";
      setError(errorMessage);
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems(items, searchTerm);
  }, [searchTerm, items]);

  const filterItems = (itemsData, term) => {
    const safeItems = Array.isArray(itemsData) ? itemsData : [];
    const filtered = term
      ? safeItems.filter((item) =>
          Object.values(item).some((value) =>
            String(value).toLowerCase().includes(term.toLowerCase())
          )
        )
      : safeItems;
    setFilteredItems(filtered);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddItem = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      status: "isavailable",
      image: null,
    });
    setFormErrors({});
    setEditMode(false);
    setSelectedItemId(null);
    setShowItemModal(true);
  };

  const handleEditItem = (item) => {
    setFormData({
      name: item?.name || "",
      description: item?.description || "",
      price: item?.price ? item.price.toString() : "",
      category: item?.category || "",
      status: item?.status || "isavailable",
      image: null,
    });
    setFormErrors({});
    setEditMode(true);
    setSelectedItemId(item?.id || null);
    setShowItemModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else if (name === "price") {
      // Allow only numbers and single decimal point
      const sanitizedValue = value
        .replace(/[^0-9.]/g, "")
        .replace(/\.+/g, ".")
        .replace(/^\./g, "");
      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    } else if (name === "status") {
      setFormData((prev) => ({
        ...prev,
        status: e.target.checked ? "isavailable" : "notavailable",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    setFormErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim())
      errors.name = t("nameRequired") || "Name is required";
    if (!formData.category)
      errors.category = t("categoryRequired") || "Category is required";

    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue)) {
      errors.price = t("priceRequired") || "Price is required";
    } else if (priceValue < 0) {
      errors.price = t("invalidPrice") || "Invalid price value";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  // old
  // const handleSubmitForm = async (e) => {
  //   e.preventDefault();
  //   if (!validateForm()) return;

  //   const submitData = {
  //     ...formData,
  //     price: parseFloat(formData.price).toFixed(2),
  //   };

  //   try {
  //     const headers = {
  //       Authorization: `Bearer ${localStorage.getItem("token")}`,
  //       "Content-Type": "application/json",
  //     };

  //     let response;
  //     if (editMode) {
  //       response = await axios.put(
  //         `http://127.0.0.1:8000/api/items/${selectedItemId}`,
  //         submitData,
  //         { headers }
  //       );
  //     } else {
  //       response = await axios.post(
  //         "http://127.0.0.1:8000/api/items",
  //         submitData,
  //         { headers }
  //       );
  //     }

  //     await fetchItems();
  //     setShowItemModal(false);
  //   } catch (err) {
  //     console.error("Submission error:", err.response || err);
  //     setFormErrors({
  //       submit:
  //         err.response?.data?.message ||
  //         err.response?.data?.errors?.join(", ") ||
  //         t("saveError") ||
  //         "Error saving item",
  //     });
  //     setShowItemModal(true);
  //   }
  // };

  // new
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    const formDataToSend = new FormData();
    
    // Append regular form fields
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("price", parseFloat(formData.price).toFixed(2));
    formDataToSend.append("status", formData.status);
  
    // Conditionally append image only if a new file is selected
    if (file) {
      formDataToSend.append("image", file);
    }
  
    // For edit mode: Add Laravel's method override
    if (editMode) {
      formDataToSend.append("_method", "PUT"); // Important for Laravel to recognize as PUT
    }
  
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        // Let browser set Content-Type automatically for FormData
        // (it will set multipart/form-data with proper boundary)
      };
  
      const url = editMode 
        ? `http://127.0.0.1:8000/api/items/${selectedItemId}`
        : "http://127.0.0.1:8000/api/items";
  
      // Use POST for both create and update (with _method override)
      const response = await axios.post(url, formDataToSend, { headers });
  
      await fetchItems();
      setShowItemModal(false);
    } catch (err) {
      console.error("Submission error:", err.response || err);
      setFormErrors({
        submit: err.response?.data?.message || "Error saving item",
      });
    }
  };
  const handleConfirmDelete = (id) => {
    setShowDeleteModal(true);
    setItemToDelete(id);
  };

  // Added API error handling for delete
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/items/${itemToDelete}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Replace local filtering with a full refresh
      await fetchItems(); // Refresh the items list
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (err) {
      console.error("Delete error:", err);
      const errorMessage =
        err.response?.data?.message ||
        t("deleteError") ||
        "Error deleting item";
      setError(errorMessage);
      setShowDeleteModal(false);
    }
  };
  const handleCloseModals = () => {
    setShowItemModal(false);
    setShowDeleteModal(false);
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <motion.div
        className=" flex-1 overflow-auto relative z-10             "
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ direction: "ltr" }}
      >
        <Header title={t("OrderItems")} />
        {/* Search and Add Button Section */}
        <div className="flex justify-end items-center mb-6 p-4">
          {/* <h2 className="text-xl font-semibold text-gray-100">
            {t("ItemsManagement") || "Items Management"}
          </h2> */}
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
            <button
              onClick={handleAddItem}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center transition-colors"
            >
              <Plus size={18} className="mr-2" />
              {t("addItem") || "Add Item"}
            </button>
          </div>
        </div>

        {/* Items Table */}
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">
            {t("Loading") || "Loading"}...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {searchTerm
              ? t("NoMatchingItems") || "No items match your search"
              : t("NoItemsFound") || "No items found"}
          </div>
        ) : (
          <div className="overflow-x-auto  m-6 border border-gray-700 rounded-lg">
            <table className="min-w-full divide-y divide-gray-700  rounded-lg ">
              {/* Table Header */}
              <thead className="bg-gray-800">
                <tr>
                  {[
                    "ID",
                    "Image",
                    "Name",
                    "Description",
                    "Category",
                    "Price",
                    "Status",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                    >
                      {t(header) || header}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-700">
                {filteredItems.map((item) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.image && (
                        <img
                          src={`http://localhost:8000/storage/${item.image}`}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md shadow-md"
                        />
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 max-w-md truncate">
                      {item.description || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      ${parseFloat(item.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.status === "isavailable"
                            ? "bg-green-700 bg-opacity-40 text-green-300"
                            : "bg-red-700 bg-opacity-40 text-red-300"
                        }`}
                      >
                        {item.status === "isavailable"
                          ? t("Available") || "Available"
                          : t("Unavailable") || "Unavailable"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 ">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-blue-500 hover:text-indigo-300 mr-3 text-center"
                        aria-label="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleConfirmDelete(item.id)}
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

        {/* Add/Edit Item Modal */}
        <Modal
          show={showItemModal}
          onHide={() => setShowItemModal(false)}
          size="lg"
          style={{ direction: "ltr" }}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {editMode ? t("EditItem") : t("addnewitem")}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmitForm}>
            <Modal.Body>
              {formErrors.submit && (
                <div className="alert alert-danger">{formErrors.submit}</div>
              )}

              <Form.Group className="mb-3">
                <Form.Label>{t("Name")}</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  isInvalid={!!formErrors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.name}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>{t("Description")}</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>{t("Category")}</Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  isInvalid={!!formErrors.category}
                >
                  <option value="">{t("selectcategory")}</option>
                  <option value="general">{t("General")}</option>
                  <option value="amenity">{t("Amenity")}</option>
                  <option value="service">{t("Service")}</option>
                  <option value="food">{t("Food")}</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {formErrors.category}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>{t("Price")}</Form.Label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <Form.Control
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    isInvalid={!!formErrors.price}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.price}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label={t("isavailable")}
                  name="status"
                  checked={formData.status === "isavailable"}
                  onChange={handleFormChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>{t("Image") || "Image"}</Form.Label>

                <Form.Control
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{ width: "200px" }}
                  />
                )}
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowItemModal(false)}
              >
                {t("cancel")}
              </Button>
              <Button variant="primary" type="submit">
                {editMode ? t("SaveChanges") : t("additem")}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Confirmation Modal */}

        {showDeleteModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-800 p-6 rounded-lg w-96">
              <h3 className="text-xl text-white mb-4">
                {t("deletcofermation")}
              </h3>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handleDeleteItem}
                  className="bg-red-600 text-white px-4 py-2 rounded"
                >
                  {t("delete")}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <OrderItems /> {/* Fixed component name */}
    </ErrorBoundary>
  );
}
