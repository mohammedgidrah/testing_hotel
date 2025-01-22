import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';

function Guests() {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [guests, setGuests] = useState([]);
    const [filteredGuests, setFilteredGuests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState('all');

    useEffect(() => {
        const fetchGuests = async () => {
            try {
                axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
                const response = await axios.get('http://127.0.0.1:8000/api/guests');
                setGuests(response.data);
                setFilteredGuests(response.data);
                setLoading(false);
            } catch (error) {
                console.log(error);
                setError('Failed to load data');
                setLoading(false);
            }
        };
        fetchGuests();
    }, []);

    // Filter guests based on search term and selected filter option
    useEffect(() => {
        const filtered = guests.filter((guest) => {
            const searchIn = filterBy === 'all' ? `${guest.first_name} ${guest.last_name} ${guest.email} ${guest.phone_number}` : guest[filterBy];
            return searchIn.toLowerCase().includes(searchTerm.toLowerCase());
        });
        setFilteredGuests(filtered);
    }, [searchTerm, filterBy, guests]);

    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <Header title='Guests' />

            <div className='flex-1 max-w-7xl mx-auto py-4 px-4 lg:px-8'>
                {error && <div className="text-red-500 mb-4">{error}</div>}
                {loading && <div className="text-gray-300 mb-4">Loading...</div>}

                <div className="flex items-center mb-4">
                    <input
                        type="text"
                        placeholder="Search guests..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 mr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value)}
                        className="bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Fields</option>
                        <option value="first_name">First Name</option>
                        <option value="last_name">Last Name</option>
                        <option value="email">Email</option>
                        <option value="phone_number">Phone Number</option>
                    </select>
                </div>

                {!loading && filteredGuests.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-gray-800 text-gray-100 rounded-lg">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        First Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Last Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Phone Number
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {filteredGuests.map((guest) => (
                                    <tr key={guest.id} className="hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {guest.first_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {guest.last_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {guest.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {guest.phone_number}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && filteredGuests.length === 0 && (
                    <div className="text-gray-400 text-sm">No guests found.</div>
                )}
            </div>
        </div>
    );
}

export default Guests;
