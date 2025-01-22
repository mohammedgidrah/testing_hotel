import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import React from 'react';

// Function to calculate expenses by category
const calculateExpensesByCategory = (expenses) => {
    const expenseSummary = {};

    expenses.forEach((expense) => {
        const category = expense.category;
        const amount = parseFloat(expense.amount);

        if (expenseSummary[category]) {
            expenseSummary[category] += amount;
        } else {
            expenseSummary[category] = amount;
        }
    });

    return Object.keys(expenseSummary).map(category => ({
        name: category,
        value: expenseSummary[category]
    }));
};

// Define colors for chart segments
const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

function ExpensePieChart({ expenses = [] }) {
    const chartData = calculateExpensesByCategory(expenses);

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <h2 className='text-lg font-medium mb-4 text-gray-100'>Expenses Overview</h2>

            <div className='h-80'>
                <ResponsiveContainer width={"100%"} height={"100%"}>
                    <PieChart>
                        <Pie
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
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend
                            layout="horizontal"
                            align="center"
                            verticalAlign="bottom"
                            wrapperStyle={{
                                marginTop: "20px",
                                fontSize: "14px",
                                color: "#E5E7EB",
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}

export default ExpensePieChart;
