import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import EditPayment from './EditPaymentForm';
import { Edit, Trash2 } from 'lucide-react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const PaymentsTable = () => {
    const { t } = useTranslation("payments");
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState('booking_id');
    const [error, setError] = useState('');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // States for delete confirmation modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState(null);

    const fetchPayments = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://127.0.0.1:8000/api/payments', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPayments(response.data);
            setFilteredPayments(response.data);
        } catch (error) {
            setError('Failed to load payments. Please try again.');
            console.error('Error fetching payments:', error.response || error);
        }
    }, []);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    useEffect(() => {
        const filtered = payments.filter((payment) => {
            const searchIn = filterBy === 'all'
                ? `${payment.booking_id} ${payment.payment_method} ${payment.amount_paid}`
                : payment[filterBy]?.toString() || '';

            return searchIn.toLowerCase().includes(searchTerm.toLowerCase());
        });

        setFilteredPayments(filtered);
    }, [searchTerm, filterBy, payments]);

    const handleEditPayment = (payment) => {
        setSelectedPayment(payment);
        setShowEditModal(true);
    };

    const handleCloseModal = () => {
        setShowEditModal(false);
        setSelectedPayment(null);
    };

    const handleDeletePayment = async () => {
        if (!paymentToDelete) return;

        try {
            await axios.delete(`http://127.0.0.1:8000/api/payments/${paymentToDelete.id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setPayments((prev) => prev.filter(payment => payment.id !== paymentToDelete.id));
            setFilteredPayments((prev) => prev.filter(payment => payment.id !== paymentToDelete.id));
            setShowDeleteModal(false);
            setPaymentToDelete(null);
        } catch (error) {
            setError('Failed to delete payment. Please try again.');
            console.error('Error deleting payment:', error.response || error);
        }
    };

    return (
        <div className="container mx-auto p-6" style={{ direction: "ltr" }}>
            <h2 className="text-2xl font-semibold text-gray-100 mb-4">{t("PaymentsList")}</h2>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder={t("Search")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="bg-gray-700 text-white rounded-lg px-4 py-2 mr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="booking_id">{t("BookingID")}</option>
                    <option value="payment_method">{t("PaymentMethod")}</option>
                    <option value="amount_paid">{t("AmountPaid")}</option>
                    <option value="all">{t("AllFields")}</option>
                </select>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800 text-white rounded-lg overflow-hidden">
                    <thead className="bg-gray-700">
                        <tr>
                            {["BookingID", "AmountPaid", "PaymentMethod", "PaymentDate", "Actions"].map((col) => (
                                <th key={col} className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    {t(col)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {filteredPayments.length > 0 ? (
                            filteredPayments.map((payment) => (
                                <tr key={payment.id} className="border-b border-gray-700">
                                    <td className="px-4 py-2 text-sm text-gray-300">{payment.booking_id}</td>
                                    <td className="px-4 py-2 text-sm text-gray-300">${parseFloat(payment.amount_paid).toFixed(2)}</td>
                                    <td className="px-4 py-2 text-sm text-gray-300">{payment.payment_method}</td>
                                    <td className="px-4 py-2 text-sm text-gray-300">
                                        {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : "N/A"}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-300 flex space-x-2">
                                        <button 
                                            onClick={() => handleEditPayment(payment)} 
                                            className="text-blue-500 hover:text-blue-700"
                                            aria-label="Edit payment"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button 
                                            onClick={() => { setPaymentToDelete(payment); setShowDeleteModal(true); }}
                                            className="text-red-500 hover:text-red-700"
                                            aria-label="Delete payment"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-4 py-2 text-center text-gray-400">{t("NoPaymentsFound")}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showEditModal && selectedPayment && (
                <EditPayment 
                    show={showEditModal} 
                    payment={selectedPayment} 
                    onClose={handleCloseModal} 
                />
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                style={{ direction: "ltr" }}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{t("DeletePayment")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{t("DeleteConfirmation")}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        {t("cancel")}
                    </Button>
                    <Button variant="danger" onClick={handleDeletePayment}>
                        {t("delete")}
                    </Button>
                </Modal.Footer>
            </Modal>
            {/* {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-gray-800 p-6 rounded-lg w-96">
                        <h3 className="text-xl text-white mb-4">{t("DeleteConfirmation")}</h3>
                        <div className="flex justify-end space-x-4">
                            <button 
                                onClick={() => setShowDeleteModal(false)} 
                                className="bg-gray-600 text-white px-4 py-2 rounded"
                            >
                                {t("cancel")}
                            </button>
                            <button 
                                onClick={handleDeletePayment} 
                                className="bg-red-600 text-white px-4 py-2 rounded"
                            >
                                {t("delete")}
                            </button>
                        </div>
                    </div>
                </div>
            )} */}
        </div>
    );
};

export default PaymentsTable;
