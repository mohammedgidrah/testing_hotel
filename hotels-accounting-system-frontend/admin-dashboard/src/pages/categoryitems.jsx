import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, Plus, Search } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import Header from "../components/Header";
import { useTranslation } from "react-i18next";
import axios from "axios"; // Import axios for API calls

function ErrorFallback({ error }) {
  return (
    <div className="p-4 text-red-500">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
    </div>
  );
}

export default function CategoryManagement() {
  const { t, i18n } = useTranslation("itemcategory");
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isItemsLoading, setIsItemsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const API_URL = "http://127.0.0.1:8000/api";

  // Fetch categories from the database
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/item-categories`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setCategories(response.data);
      setFilteredCategories(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch items for the dropdown
  const fetchItems = async () => {
    setIsItemsLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/items`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Ensure we're working with an array
      const receivedItems = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      setItems(receivedItems);
    } catch (err) {
      console.error("Error fetching items:", err);
      setItems([]); // Reset to empty array on error
    } finally {
      setIsItemsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

  // Filter categories whenever search term or categories change
  useEffect(() => {
    filterCategories(categories, searchTerm);
  }, [searchTerm, categories]);

  const filterCategories = (categoriesData, term) => {
    const safeCategories = Array.isArray(categoriesData) ? categoriesData : [];
    const filtered = term
      ? safeCategories.filter((category) =>
          Object.values(category).some((value) =>
            String(value).toLowerCase().includes(term.toLowerCase())
          )
        )
      : safeCategories;
    setFilteredCategories(filtered);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddCategory = () => {
    setFormData({
      name: "",
    });
    setFormErrors({});
    setEditMode(false);
    setSelectedCategoryId(null);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category) => {
    setFormData({
      name: category?.name || "",
    });
    setFormErrors({});
    setEditMode(true);
    setSelectedCategoryId(category?.id || null);
    setShowCategoryModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (editMode) {
        // Update existing category
        await axios.put(
          `http://127.0.0.1:8000/api/item-categories/${selectedCategoryId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } else {
        // Add new category
        await axios.post(
          `http://127.0.0.1:8000/api/item-categories`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      }

      // Refresh categories after successful operation
      fetchCategories();
      setShowCategoryModal(false);
    } catch (err) {
      console.error("Error saving category:", err);
      setFormErrors({
        submit: "Failed to save category. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = (id) => {
    setShowDeleteModal(true);
    setCategoryToDelete(id);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    setIsLoading(true);
    try {
      await axios.delete(`${API_URL}/item-categories/${categoryToDelete}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Refresh categories after successful delete
      fetchCategories();
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (err) {
      console.error("Error deleting category:", err);
      setError("Failed to delete category. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Find item name by id
  const getItemsByCategoryId = (categoryId) => {
    return items.filter((item) => item.category_id === categoryId);
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <motion.div
        className="flex-1 overflow-auto relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={i18n.language==="ar"?{direction:"rtl"}:{}}
      >
        <Header title={t("Category Management")} />

        {/* Search and Add Button Section */}
        <div className="flex justify-end items-center mb-6 p-4 " >
          <div className="flex space-x-4 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder={t("search")}
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
              onClick={handleAddCategory}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center transition-colors"
              disabled={isLoading}
            >
              <Plus size={18} className="mr-2" />
              {t("Add Category")}
            </button>
          </div>
        </div>

        {/* Categories Table */}
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
            Loading...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>{error}</p>
            <button
              onClick={fetchCategories}
              className="mt-4 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {searchTerm
              ? "No categories match your search"
              : "No categories found"}
          </div>
        ) : (
          <div className="overflow-x-auto m-6 border border-gray-700 rounded-lg" style={{direction: 'ltr'}}>
            <table className="min-w-full divide-y divide-gray-700 rounded-lg">
              {/* Table Header */}
              <thead className="bg-gray-800">
                <tr>
                  {["ID", "Name",  "Actions"].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                    >
                      {t(header)}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-gray-700">
                {filteredCategories.map((category) => (
                  <motion.tr
                    key={category.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {category.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                      {category.name}
                    </td>
 
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-blue-500 hover:text-indigo-300 mr-3 text-center"
                        aria-label="Edit"
                        disabled={isLoading}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleConfirmDelete(category.id)}
                        className="text-red-500 hover:text-red-300"
                        aria-label="Delete"
                        disabled={isLoading}
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

        {/* Add/Edit Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" >
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">
                  {editMode ? t("Edit Category") : t("Add Category")}
                </h2>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                  disabled={isLoading}
                >
                  ✕
                </button>
              </div>

              {formErrors.submit && (
                <div className="bg-red-600 bg-opacity-25 text-red-300 p-3 rounded mb-4">
                  {formErrors.submit}
                </div>
              )}

              <form onSubmit={handleSubmitForm}>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">{t("Name")}</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className={`w-full bg-gray-700 text-white rounded p-2 ${
                      formErrors.name ? "border border-red-500" : ""
                    }`}
                    disabled={isLoading}
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    disabled={isLoading}
                  >
                    {t("Cancel")}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                    )}
                    {editMode ? t("Update") : t("Add")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" style={{direction:'ltr'}}>
            <div className="bg-gray-800 p-6 rounded-lg w-96">
              {/* <h3 className="text-xl text-white mb-4">Confirm Deletion</h3> */}
              <p className="text-xl text-white mb-4" style={i18n.language === 'ar' ? {direction:'rtl'} : {}}>
                {t("Are you sure you want to delete this category?")}
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  disabled={isLoading}
                >
                  {t("Cancel")}
                </button>
                <button
                  onClick={handleDeleteCategory}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                  )}
                  {t("Delete")}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </ErrorBoundary>
  );
}
