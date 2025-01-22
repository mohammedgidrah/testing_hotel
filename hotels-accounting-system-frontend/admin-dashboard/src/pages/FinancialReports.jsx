import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Header from '../components/Header';

const FinancialReport = () => {
  const [startDate, setStartDate] = useState('2024-10-01');
  const [endDate, setEndDate] = useState('2024-10-31');
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const reportRef = useRef(); // Reference for printing

  const fetchReport = async () => {
    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
      const response = await axios.get('http://127.0.0.1:8000/api/financial-report', {
        params: {
          start_date: startDate,
          end_date: endDate
        }
      });
      setReport(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load financial report. Please try again.');
      console.error('Error fetching financial report:', err);
    }
  };

  const handlePrint = () => {
    if (reportRef.current) {
      const printContent = reportRef.current.innerHTML;
      const originalContent = document.body.innerHTML;

      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload(); // Reload to restore original content
    }
  };

  return (
    <div className="flex-1 overflow-auto relative z-10 ">
      < Header title="Financial Report" />
      <div className="container mx-auto p-6  ">
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">Generate Financial Report</h2>

        <div className="mb-4">
          <label className="block text-gray-300 mb-2">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 mb-2">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded"
          />
        </div>

        <button
          onClick={fetchReport}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg mt-4 transition duration-200"
        >
          Generate Report
        </button>

        {error && <p className="text-red-500 mt-4">{error}</p>}

        {report && (
          <div ref={reportRef} className="bg-white p-6 rounded-lg shadow-lg mt-4 text-gray-900 ">
            <h3 className="text-xl font-semibold mb-4 text-center">Monthly Financial Summary for October 2024</h3>
            <p className="text-center"><strong>Report Period:</strong> October 1, 2024 - October 31, 2024</p>

            <div className="my-4">
              <h4 className="text-lg font-semibold">Income</h4>
              <p><strong>Total Income:</strong> ${parseFloat(report.total_income || 0).toFixed(2)}</p>
              <ul className="pl-4">
                {report.income_breakdown.map((item) => (
                  <li key={item.payment_method}>
                    {item.payment_method}: ${parseFloat(item.total || 0).toFixed(2)}
                  </li>
                ))}
              </ul>
              <p><strong>Total Number of Bookings:</strong> {report.total_bookings || 0}</p>
            </div>

            <div className="my-4">
              <h4 className="text-lg font-semibold">Expenses</h4>
              <p><strong>Total Expenses:</strong> ${parseFloat(report.total_expenses || 0).toFixed(2)}</p>
              <ul className="pl-4">
                {report.expense_breakdown.map((item) => (
                  <li key={item.category}>
                    {item.category}: ${parseFloat(item.total || 0).toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="my-4">
              <h4 className="text-lg font-semibold">Profit Analysis</h4>
              <p><strong>Net Profit:</strong> ${parseFloat(report.net_profit || 0).toFixed(2)}</p>
              <p><strong>Profit Margin:</strong> {parseFloat(report.profit_margin || 0).toFixed(2)}%</p>
            </div>

            <div className="my-4">
              <h4 className="text-lg font-semibold">Date & Time</h4>
              <p><strong>Date Created:</strong> {new Date().toLocaleDateString()}</p>
              <p><strong>Time Created:</strong> {new Date().toLocaleTimeString()}</p>
            </div>

            <button
              onClick={handlePrint}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg mt-4 transition duration-200"
            >
              Print Report
            </button>
          </div>
        )}

      </div>
    </div >
  );
};

export default FinancialReport;
