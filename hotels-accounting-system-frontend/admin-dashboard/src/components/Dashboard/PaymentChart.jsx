import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import React from "react";
import { useTranslation } from "react-i18next";

const calculatePaymentsByMethod = (payments) => {
  const paymentSummary = {};

  payments.forEach((payment) => {
    const method = payment.payment_method;
    const amount = parseFloat(payment.amount_paid);

    if (paymentSummary[method]) {
      paymentSummary[method] += amount;
    } else {
      paymentSummary[method] = amount;
    }
  });

  return Object.keys(paymentSummary).map((method) => ({
    name: method,
    value: paymentSummary[method],
  }));
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

function PaymentPieChart({ payments = [] }) {
  const { t, i18n } = useTranslation("dashboard");

  const chartData = calculatePaymentsByMethod(payments);

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h2 className="text-lg font-medium mb-4 text-gray-100">
        {t("PaymentsOverview")}
      </h2>

      <div className="h-80">
        <ResponsiveContainer width={"100%"} height={"100%"}>
          <PieChart>
            <Pie
              style={i18n.language === "ar" ? { direction: "ltr" } : {}}
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />

            {/* Responsive Legend */}
            <Legend
              layout="horizontal"
              align="center"
              verticalAlign="bottom"
              wrapperStyle={{
                marginTop: "20px",
                fontSize: "14px",
                color: "#E5E7EB",
                direction: i18n.language === "ar" ? "ltr" : "ltr",
              }}
              formatter={(value) => t(value)} // Using translation for each legend item
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default PaymentPieChart;
