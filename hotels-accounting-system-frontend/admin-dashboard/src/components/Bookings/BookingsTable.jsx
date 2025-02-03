import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Search } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Modal, Button } from 'react-bootstrap';

function BookingsTable() {
    const { t } = useTranslation("bookings");
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);

    useEffect(() => {
        axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        axios.get('http://127.0.0.1:8000/api/bookings')
            .then(response => {
                setBookings(response.data);
                setFilteredBookings(response.data);
            })
            .catch(() => {
                setError('Failed to load bookings');
            });
    }, []);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = bookings.filter((booking) => {
            const guestName = `${booking.guest.first_name} ${booking.guest.last_name}`.toLowerCase();
            const roomNumber = booking.room.room_number.toLowerCase();
            return guestName.includes(term) || roomNumber.includes(term);
        });
        setFilteredBookings(filtered);
    };

    const handleDelete = () => {
        if (selectedBookingId) {
            axios.delete(`http://127.0.0.1:8000/api/bookings/${selectedBookingId}`)
                .then(() => {
                    setBookings(prev => prev.filter(booking => booking.id !== selectedBookingId));
                    setFilteredBookings(prev => prev.filter(booking => booking.id !== selectedBookingId));
                    setShowModal(false);
                })
                .catch(() => {
                    setError('Failed to delete booking');
                });
        }
    };

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8 m-4'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ direction: "ltr" }}
        >
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>{t('BookingList')}</h2>
                <div className='relative'>
                    <input
                        type='text'
                        placeholder={t('Search')}
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:w-80 sm:w-40'
                        onChange={handleSearch}
                        value={searchTerm}
                    />
                    <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
                </div>
            </div>

            <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-700'>
                    <thead>
                        <tr>
                            {['ID', 'GuestName', 'RoomNumber', 'CheckInDate', 'CheckOutDate', 'TotalAmount', 'Status', 'Actions'].map((header) => (
                                <th key={header} className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                    {t(header)}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                        {error && <p className='text-red-500'>{error}</p>}
                        {filteredBookings.map((booking) => (
                            <motion.tr key={booking.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{booking.id}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {`${booking.guest.first_name} ${booking.guest.last_name}`}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{booking.room.room_number}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {new Date(booking.check_in_date).toLocaleDateString()}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {new Date(booking.check_out_date).toLocaleDateString()}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    ${parseFloat(booking.total_amount).toFixed(2)}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{t(booking.payment_status)}</td>
                                <td className='flex px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    <Link to={`/bookings/edit/${booking.id}`} className='text-indigo-400 hover:text-indigo-300 mr-2'>
                                        <Edit size={18} />
                                    </Link>
                                    <button onClick={() => { setSelectedBookingId(booking.id); setShowModal(true); }} className='text-red-400 hover:text-red-300'>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} style={{ direction: "ltr" }}>
                <Modal.Header closeButton>
                    <Modal.Title>{t("DeleteBooking")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{t("AreYouSure")}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        {t("Cancel")}
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        {t("Delete")}
                    </Button>
                </Modal.Footer>
            </Modal>
        </motion.div>
    );
}

export default BookingsTable;