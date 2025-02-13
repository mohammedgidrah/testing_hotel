import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, Search, DollarSign } from "lucide-react";
import axios from "axios";
import StatCard from "../StatCard";
import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const ExpensesTable = ({ handleEdit, successMessage }) => {
  const { t } = useTranslation("expenses");
  const [searchTerm, setSearchTerm] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [error, setError] = useState("");
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  useEffect(() => {
    const fetchExpensesAndUsers = async () => {
      try {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${localStorage.getItem("token")}`;

        // Fetch expenses
        const expensesResponse = await axios.get(
          "http://127.0.0.1:8000/api/expenses"
        );
        setExpenses(expensesResponse.data);
        setFilteredExpenses(expensesResponse.data);

        // Calculate total expenses
        const totalExpenses = expensesResponse.data.reduce(
          (total, expense) => total + parseFloat(expense.amount),
          0
        );
        setTotalExpenses(totalExpenses);
      } catch (error) {
        console.error("Error fetching expenses:", error);
        setError("Failed to load expenses. Please check your permissions.");
      }

      try {
        // Fetch users
        const usersResponse = await axios.get(
          "http://127.0.0.1:8000/api/users"
        );
        setUsers(usersResponse.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users. Please check your permissions.");
      }
    };

    fetchExpensesAndUsers();
  }, [successMessage]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = expenses.filter(
      (expense) =>
        expense.description.toLowerCase().includes(term) ||
        expense.category.toLowerCase().includes(term)
    );
    setFilteredExpenses(filtered);
  };

  const handleDelete = async () => {
    if (expenseToDelete) {
      try {
        const response = await axios.delete(
          `http://127.0.0.1:8000/api/expenses/${expenseToDelete.id}`
        );
  
        if (response.status === 204) {
          // Successful deletion, update state
          setExpenses((prevExpenses) =>
            prevExpenses.filter((expense) => expense.id !== expenseToDelete.id)
          );
          setFilteredExpenses((prevExpenses) =>
            prevExpenses.filter((expense) => expense.id !== expenseToDelete.id)
          );
  
          // Update total expenses
          setTotalExpenses((prevTotal) =>
            prevTotal - parseFloat(expenseToDelete.amount)
          );
  
          setShowModal(false); // Close modal after deletion
          setSuccessMessage("Expense deleted successfully!"); // Set success message
          setError(""); // Clear any previous error message
        }
      } catch (error) {
        console.error("Error during deletion:", error.response || error.message);
        setSuccessMessage(""); // Clear success message if there's an error
      }
    }
  };
  

  const getUserName = (id) => {
    const user = users.find((user) => user.id === id);
    return user ? user.name : "";
  };

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8 m-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={ {direction: "ltr"} }
    >
      <StatCard
        name={t("totalExpenses")}
        value={`-$${totalExpenses.toFixed(2)}`}
        color="red"
        icon={DollarSign}
      />
      <div className="flex justify-between items-center mb-6 mt-2">
        <h2 className="text-xl font-semibold text-gray-100">{t("ExpenseList")}</h2>
        <div className="relative">
          <input
            type="text"
            placeholder={t("Search")}
            className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-40"
            onChange={handleSearch}
            value={searchTerm}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {/* Success message */}
      {successMessage && <p className="text-green-500">{successMessage}</p>}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                {t("Description")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                {t("Amount")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
               {t("ExpenseDate")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                {t("Category")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                {t("CreatedBy")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                {t("Actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {filteredExpenses.map((expense) => (
              <motion.tr
                key={expense.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  {expense.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  ${parseFloat(expense.amount).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {new Date(expense.expense_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {t(expense.category)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {getUserName(expense.created_by)}
                </td>
                <td className="flex px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <button
                    onClick={() => handleEdit(expense)}
                    className="text-indigo-400 hover:text-indigo-300 mr-2"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setExpenseToDelete(expense);
                      setShowModal(true);
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bootstrap Modal for confirmation */}
      <Modal show={showModal} onHide={() => setShowModal(false)} style={{ direction: "ltr" }}>
        <Modal.Header closeButton>
          <Modal.Title>{t("DeleteExpense")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{t("Are you sure you want to delete this expense?")}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            {t("Cancel")}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            {t("delete")}
          </Button>
        </Modal.Footer>
      </Modal>
    </motion.div>
  );
};

export default ExpensesTable;

 