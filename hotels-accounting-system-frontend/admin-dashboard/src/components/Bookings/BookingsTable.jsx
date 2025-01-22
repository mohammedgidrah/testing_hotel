import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Search } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function BookingsTable() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState(null);
    useEffect(() => {
        axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        axios.get('http://127.0.0.1:8000/api/bookings')
            .then(response => {
                setBookings(response.data);
                setFilteredBookings(response.data);
            })
            .catch(error => {
                setError('Failed to load bookings');
            });
    }, []);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = bookings.filter((booking) => {
            const guestName = `${booking.guest.first_name} ${booking.guest.last_name}`.toLowerCase();
            const roomNumber = booking.room.room_number.toLowerCase();
            return (
                guestName.includes(term) || roomNumber.includes(term)
            );
        });

        setFilteredBookings(filtered);
    };
    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this booking?")) {
            axios.delete(`http://127.0.0.1:8000/api/bookings/${id}`)
                .then(() => {

                    setBookings(prevBookings => prevBookings.filter(booking => booking.id !== id));
                    setFilteredBookings(prevBookings => prevBookings.filter(booking => booking.id !== id));
                })
                .catch(error => {
                    setError('Failed to delete booking:');
                });
        }
    };
    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8 m-4'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>Booking List</h2>
                <div className='relative'>
                    <input
                        type='text'
                        placeholder='Search bookings by number or name...'
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
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Booking ID
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Guest
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Room Number
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Check-in Date
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Check-out Date
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Total Amount
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Payment Status
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                        {error && <p className='text-red-500'>{error}</p>}
                        {filteredBookings.map((booking) => (
                            <motion.tr
                                key={booking.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {booking.id}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    {`${booking.guest.first_name} ${booking.guest.last_name}`}
                                </td>

                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {booking.room.room_number}
                                </td>

                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {new Date(booking.check_in_date).toLocaleDateString()}
                                </td>

                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {new Date(booking.check_out_date).toLocaleDateString()}
                                </td>

                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    ${parseFloat(booking.total_amount).toFixed(2)}
                                </td>

                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {booking.payment_status}
                                </td>

                                <td className='flex px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    <Link to={`/bookings/edit/${booking.id}`} className='text-indigo-400 hover:text-indigo-300 mr-2 '>
                                        <Edit size={18} />
                                    </Link>
                                    <button onClick={() => handleDelete(booking.id)} className='text-red-400 hover:text-red-300'>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}

export default BookingsTable
