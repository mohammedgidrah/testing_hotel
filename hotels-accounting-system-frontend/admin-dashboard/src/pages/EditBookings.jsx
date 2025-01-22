import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';

const EditBooking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [availableRooms, setAvailableRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        check_in_date: '',
        check_out_date: '',
        payment_status: '',
        total_amount: '',
        room_id: ''
    });

    // Fetch booking details when the component loads
    useEffect(() => {
        axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        axios.get(`http://127.0.0.1:8000/api/bookings/${id}`)
            .then(response => {
                setBooking(response.data);
                setFormData({
                    check_in_date: response.data.check_in_date,
                    check_out_date: response.data.check_out_date,
                    payment_status: response.data.payment_status,
                    total_amount: response.data.total_amount,
                    room_id: response.data.room_id
                });
                setLoading(false);
            })
            .catch(error => {
                console.log('Failed to fetch booking:', error);
            });
        axios.get('http://127.0.0.1:8000/api/rooms')
            .then(response => {
                setAvailableRooms(response.data.filter(room => room.status === 'available'));
                setLoading(false);
            })
            .catch(error => {
                console.log('Failed to fetch rooms:', error);
            });
    }, [id]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Submit the form data (update booking)
    const handleSubmit = (e) => {
        e.preventDefault();
        axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        axios.put(`http://127.0.0.1:8000/api/bookings/${id}`, formData)
            .then(response => {
                console.log('Booking updated successfully:', response.data);
                navigate('/bookings');
            })
            .catch(error => {
                console.log('Failed to update booking:', error);
            });

    };

    if (loading) {
        return <p className='text-gray-100 z-10'>Loading...</p>;
    }
    console.log(availableRooms)
    return (

        <div className='container mx-auto  flex-1 overflow-auto relative z-10 text-gray-700'>

            <Header title='Edit Booking' />
            <div className='p-6'>

                <form onSubmit={handleSubmit}>

                    <div className='mb-4'>
                        <label className='block text-gray-100'>Room Number</label>
                        <select
                            name='room_id'
                            value={formData.room_id}
                            onChange={handleInputChange}
                            className='border p-2 rounded w-full'
                            required
                        >
                            <option value=''>Select a Room</option>
                            {availableRooms.map(room => (
                                <option key={room.id} value={room.id}>
                                    {room.room_number} - {room.type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='mb-4 '>
                        <label className='block text-gray-100'>Check-in Date</label>
                        <input
                            type='date'
                            name='check_in_date'
                            value={formData.check_in_date}
                            onChange={handleInputChange}
                            className='border p-2 rounded w-full'
                            required
                        />
                    </div>

                    <div className='mb-4'>
                        <label className='block text-gray-100'>Check-out Date</label>
                        <input
                            type='date'
                            name='check_out_date'
                            value={formData.check_out_date}
                            onChange={handleInputChange}
                            className='border p-2 rounded w-full'
                            required
                        />
                    </div>

                    <div className='mb-4'>
                        <label className='block text-gray-100'>Payment Status</label>
                        <select
                            name='payment_status'
                            value={formData.payment_status}
                            onChange={handleInputChange}
                            className='border p-2 rounded w-full'
                            required
                        >
                            <option value='paid'>Paid</option>
                            <option value='pending'>Pending</option>
                        </select>
                    </div>

                    <div className='mb-4'>
                        <label className='block text-gray-100'>Total Amount</label>
                        <input
                            type='number'
                            name='total_amount'
                            value={formData.total_amount}
                            onChange={handleInputChange}
                            className='border p-2 rounded w-full'
                            required
                        />
                    </div>

                    <button type='submit' className='bg-blue-500 text-white p-2 rounded'>Update Booking</button>
                </form>
            </div>
        </div>
    );
};

export default EditBooking;