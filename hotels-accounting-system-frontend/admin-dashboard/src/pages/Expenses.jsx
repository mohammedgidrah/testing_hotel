import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import axios from "axios";
import ExpensesTable from "../components/Expenses/ExpensesTable";
import { useTranslation } from "react-i18next";

function Expenses() {
  const { t } = useTranslation("expenses");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [category, setCategory] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${localStorage.getItem("token")}`;
    axios
      .get("http://127.0.0.1:8000/api/expenses")
      .then((response) => {
        setExpenses(response.data);
      })
      .catch(() => {
        setError("Failed to load expenses. Please try again.");
      });
  }, [successMessage, editExpense]);
const openDeleteModal = (expenseId) => {
  setExpenseToDelete(expenseId);
  setShowModal(true);
}
  // Custom date formatter
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0"); // Get day with leading zero if necessary
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Get month (zero-indexed) and add leading zero
    const year = String(d.getFullYear()).slice(-2); // Get last two digits of the year
    return `${day}/${month}/${year}`;
  };

  const handleEdit = (expense) => {
    setEditExpense(expense);
    setDescription(expense.description);
    setAmount(expense.amount);
    
    // Set the date in the input's format (yyyy-mm-dd)
    setExpenseDate(expense.expense_date); // Directly use the date format as it is from the API
    setCategory(expense.category);
    setShowForm(true);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editExpense) {
      setSuccessMessage("");
      setErrorMessage("");
  
      try {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${localStorage.getItem("token")}`;
  
        await axios.put(
          `http://127.0.0.1:8000/api/expenses/${editExpense.id}`,
          {
            description,
            amount,
            expense_date: expenseDate, // Send the date in the correct format (yyyy-mm-dd)
            category,
          }
        );
        setSuccessMessage("Expense updated successfully!");
        setDescription("");
        setAmount("");
        setExpenseDate("");
        setCategory("");
        setEditExpense(null);
      } catch (error) {
        setErrorMessage("Failed to update expense. Please try again.");
        console.log("Error updating expense:", error);
      }
    } else {
      setSuccessMessage("");
      setErrorMessage("");
  
      try {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${localStorage.getItem("token")}`;
        await axios.post("http://127.0.0.1:8000/api/expenses", {
          description,
          amount,
          expense_date: expenseDate, // Send the date in the correct format (yyyy-mm-dd)
          category,
        });
        setSuccessMessage("Expense added successfully!");
        setDescription("");
        setAmount("");
        setExpenseDate("");
        setCategory("");
      } catch (error) {
        setErrorMessage("Failed to add expense. Please try again.");
        console.log("Error adding expense:", error.response.data.message);
      }
    }
  };
  

  const toggleForm = () => {
    setShowForm(!showForm);
  };
  const handleDelete = async (expenseId) => {
    try {
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${localStorage.getItem("token")}`;
      await axios.delete(`http://127.0.0.1:8000/api/expenses/${expenseId}`);
      setSuccessMessage("Expense deleted successfully!"); // Set success message
    } catch (error) {
      setErrorMessage("Failed to delete expense");
      console.error(error);
    }
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title={t("title")} />
      <div className="flex-1 mx-auto py-4 px-4">
        <div className="flex justify-end items-center mt-4 mr-4 ml-4">
          <button
            onClick={toggleForm}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            {showForm ? t("HideForm") : t("addExpense")}
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-4 mr-4 ml-4 mx-auto">
            {successMessage && (
              <p className="text-green-500 mb-4">{successMessage}</p>
            )}
            {errorMessage && (
              <p className="text-red-500 mb-4">{errorMessage}</p>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">
                  {t("Description")}
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2">
                  {t("Amount")}
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2">
                  {t("ExpenseDate")}
                </label>
                <input
                  type="date"
                  value={expenseDate} // Use formatted date here
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                  
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 mb-2">
                  {t("Category")}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 bg-gray-700 text-white rounded"
                  required
                >
                  <option value="" disabled>
                    {t("SelectCategory")}
                  </option>
                  <option value="Utilities">{t("utilities")}</option>
                  <option value="Maintenance">{t("maintenance")}</option>
                  <option value="Supplies">{t("supplies")}</option>
                  <option value="Other">{t("other")}</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg mt-4 transition duration-200"
              >
                {editExpense ? t("UpdateExpense") : t("addExpense")}
              </button>
            </form>
          </div>
        )}
{showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{ zIndex: 9999,direction: "ltr" }}>
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-xl text-white mb-4">{t("Are you sure you want to delete this expense?")}</h3>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => setShowModal(false)} 
                className="bg-gray-600 text-white px-4 py-2 rounded"
              >
                {t("Cancel")}
              </button>
              <button 
                onClick={handleDelete} 
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
        <ExpensesTable handleEdit={handleEdit} successMessage={successMessage} ondelete={openDeleteModal} />
      </div>
    </div>
  );
}

export default Expenses;
