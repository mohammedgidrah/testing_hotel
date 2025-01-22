import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import axios from 'axios';
import ExpensesTable from '../components/Expenses/ExpensesTable';

function Expenses() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [category, setCategory] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editExpense, setEditExpense] = useState(null);


  useEffect(() => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
    axios.get('http://127.0.0.1:8000/api/expenses')
      .then(response => {
        setExpenses(response.data);
      })
      .catch(() => {
        setError('Failed to load expenses. Please try again.');
      });
  }, [successMessage, editExpense]);

  const handleEdit = (expense) => {
    setEditExpense(expense);
    setDescription(expense.description);
    setAmount(expense.amount);
    setExpenseDate(expense.expense_date);
    setCategory(expense.category);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editExpense) {
      setSuccessMessage('');
      setErrorMessage('');

      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;

        await axios.put(`http://127.0.0.1:8000/api/expenses/${editExpense.id}`, {
          description,
          amount,
          expense_date: expenseDate,
          category,
        });
        setSuccessMessage('Expense updated successfully!');
        setDescription('');
        setAmount('');
        setExpenseDate('');
        setCategory('');
        setEditExpense(null);
      } catch (error) {
        setErrorMessage('Failed to update expense. Please try again.');
        console.log('Error updating expense:', error);
      }

    } else {
      setSuccessMessage('');
      setErrorMessage('');

      try {
        await axios.post('http://127.0.0.1:8000/api/expenses', {
          description,
          amount,
          expense_date: expenseDate,
          category,
        });
        setSuccessMessage('Expense added successfully!');
        setDescription('');
        setAmount('');
        setExpenseDate('');
        setCategory('');
      } catch (error) {
        setErrorMessage('Failed to add expense. Please try again.');
        console.log('Error adding expense:', error.response.data.message);
      }
    }

  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  return (
    <div className="flex-1 overflow-auto relative z-10 ">
      <Header title="Expenses" />

      <div className="flex justify-end items-center mt-4 mr-4 ml-4">
        <button
          onClick={toggleForm}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          {showForm ? 'Hide Form' : 'Add Expense'}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-4 mr-4 ml-4 mx-auto">
          {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
          {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Expense Date</label>
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded"
                required
              >
                <option value="" disabled>Select a category</option>
                <option value="utilities">Utilities</option>
                <option value="maintenance">Maintenance</option>
                <option value="supplies">Supplies</option>
                <option value="other">Other</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg mt-4 transition duration-200"
            >
              {editExpense ? 'Update Expense' : 'Add Expense'}
            </button>
          </form>
        </div>
      )}
      <ExpensesTable handleEdit={handleEdit} successMessage={successMessage} />
    </div>
  );
}

export default Expenses;
