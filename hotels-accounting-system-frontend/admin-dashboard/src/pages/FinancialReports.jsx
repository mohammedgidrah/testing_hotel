import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Header from "../components/Header";
import { useTranslation } from "react-i18next";

const FinancialReport = () => {
  const { t, i18n } = useTranslation("financialReports");
  const [startDate, setStartDate] = useState(""); // Start date for the report
  const [endDate, setEndDate] = useState(""); // End date for the report
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [dateMessage, setDateMessage] = useState(""); // State for the date message
  const reportRef = useRef(); // Reference for printing

  // Helper function to format dates
  const formatDate = (date) => {
    const locale = i18n.language === "ar" ? "ar" : "en-US";
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  // Fetch report data based on the selected start and end dates
  const fetchReport = async () => {
    if (!startDate || !endDate) {
      setDateMessage(t("select dates first")); // Show message if dates are not selected
      return;
    }

    setDateMessage(""); // Clear the message if both dates are selected

    try {
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${localStorage.getItem("token")}`;
      const response = await axios.get(
        "http://127.0.0.1:8000/api/financial-report",
        {
          params: {
            start_date: startDate,
            end_date: endDate,
          },
        }
      );
      setReport(response.data);
      setError("");
    } catch (err) {
      setError(t("fetchError"));
      console.error("Error fetching financial report:", err);
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
    <div className="flex-1 overflow-auto relative z-10">
      <Header title={t("FinancialReports")} />
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">
          {t("GenerateReport")}
        </h2>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">
            {t("StartDate")}
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2">
            {t("EndDate")}
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 bg-gray-700 text-white rounded"
          />
        </div>
        {dateMessage && <p className="text-red-500 mb-4">{dateMessage}</p>}{" "}
        {/* Display the date message */}
        <button
          onClick={fetchReport}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg mt-4 transition duration-200"
        >
          {t("GenerateFinancialReport")}
        </button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {report && (
          <div
            ref={reportRef}
            className="bg-white p-6 rounded-lg shadow-lg mt-4 text-gray-900"
          >
            <h3 className="text-xl font-semibold mb-4 text-center">
              {t("monthlySummary", {
                month: new Date(startDate).toLocaleString(i18n.language, {
                  month: "long",
                }), // Get the full month name
                year: new Date(startDate).getFullYear(), // Get the year
              })}
            </h3>

            <p className="text-center">
              <strong>{t("reportPeriod")}:</strong> {formatDate(startDate)} -{" "}
              {formatDate(endDate)}
            </p>

            <div className="my-4">
              <h4 className="text-lg font-semibold">{t("income")}</h4>
              <p>
                <strong>{t("totalIncome")}:</strong> $
                {parseFloat(report.total_income || 0).toFixed(2)}
              </p>
              <ul className="pl-4">
                {report.income_breakdown.map((item) => (
                  <li key={item.payment_method}>
                    {item.payment_method}: $
                    {parseFloat(item.total || 0).toFixed(2)}
                  </li>
                ))}
              </ul>
              <p>
                <strong>{t("totalBookings")}:</strong>{" "}
                {report.total_bookings || 0}
              </p>
            </div>

            <div className="my-4">
              <h4 className="text-lg font-semibold">{t("expenses")}</h4>
              <p>
                <strong>{t("totalExpenses")}:</strong> $
                {parseFloat(report.total_expenses || 0).toFixed(2)}
              </p>
              <ul className="pl-4">
                {report.expense_breakdown.map((item) => (
                  <li key={item.category}>
                    {item.category}: ${parseFloat(item.total || 0).toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="my-4">
              <h4 className="text-lg font-semibold">{t("profitAnalysis")}</h4>
              <p>
                <strong>{t("netProfit")}:</strong> $
                {parseFloat(report.net_profit || 0).toFixed(2)}
              </p>
              <p>
                <strong>{t("profitMargin")}:</strong>{" "}
                {parseFloat(report.profit_margin || 0).toFixed(2)}%
              </p>
            </div>

            <div className="my-4">
              <h4 className="text-lg font-semibold">{t("dateTime")}</h4>
              <p>
                <strong>{t("dateCreated")}:</strong> {formatDate(new Date())}
              </p>
              <p>
                <strong>{t("timeCreated")}:</strong>{" "}
                {new Date().toLocaleTimeString(i18n.language)}
              </p>
            </div>

            <button
              onClick={handlePrint}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg mt-4 transition duration-200"
            >
              {t("printReport")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialReport;
