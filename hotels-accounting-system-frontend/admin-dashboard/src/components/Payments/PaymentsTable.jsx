import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PaymentsTable = () => {
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState('booking_id'); // Default filter field
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
                const response = await axios.get('http://127.0.0.1:8000/api/payments', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setPayments(response.data);
                setFilteredPayments(response.data); //initial filtered payments(all payments)
            } catch (error) {
                setError('Failed to load payments. Please try again.');
                console.error('Error fetching payments:', error);
            }
        };

        fetchPayments();
    }, []);
    useEffect(() => {
        const filtered = payments.filter((payment) => {
            const searchIn = filterBy === 'all'
                ? `${payment.booking_id} ${payment.payment_method} ${payment.amount_paid}`
                : payment[filterBy]?.toString();

            return searchIn.toLowerCase().includes(searchTerm.toLowerCase());
        });

        setFilteredPayments(filtered);
    }, [searchTerm, filterBy, payments]);

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-2xl font-semibold text-gray-100 mb-4">Payments List</h2>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 mr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="booking_id">Booking ID</option>
                    <option value="payment_method">Payment Method</option>
                    <option value="amount_paid">Amount Paid</option>
                    <option value="all">All Fields</option>
                </select>

            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800 text-white rounded-lg overflow-hidden">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Booking ID
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Amount Paid
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Payment method
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Payment Date
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {filteredPayments.length > 0 ? (
                            filteredPayments.map((payment) => (
                                <tr key={payment.id} className="border-b border-gray-700">
                                    <td className="px-4 py-2 text-sm text-gray-300">{payment.booking_id}</td>
                                    <td className="px-4 py-2 text-sm text-gray-300">${parseFloat(payment.amount_paid).toFixed(2)}</td>
                                    <td className="px-4 py-2 text-sm text-gray-300">{payment.payment_method}</td>
                                    <td className="px-4 py-2 text-sm text-gray-300">{new Date(payment.payment_date).toLocaleDateString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-4 py-2 text-center text-gray-400">
                                    No payments found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentsTable;
