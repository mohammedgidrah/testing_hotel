import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import { useTranslation } from 'react-i18next';

function Guests() {
    const { t } = useTranslation("guests");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [guests, setGuests] = useState([]);
    const [filteredGuests, setFilteredGuests] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBy, setFilterBy] = useState('all');
    const [editingGuest, setEditingGuest] = useState(null);
    const [newGuest, setNewGuest] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
    });

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewGuest((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddGuest = async () => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/guests', newGuest, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setGuests([...guests, response.data]);
            setNewGuest({ first_name: '', last_name: '', email: '', phone_number: '' });
        } catch (error) {
            console.error(error);
            setError('Failed to add guest');
        }
    };

    const handleEditGuest = async () => {
        try {
            const response = await axios.put(`http://127.0.0.1:8000/api/guests/${editingGuest.id}`, editingGuest, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const updatedGuests = guests.map((guest) =>
                guest.id === response.data.id ? response.data : guest
            );
            setGuests(updatedGuests);
            setEditingGuest(null);
        } catch (error) {
            console.error(error);
            setError('Failed to update guest');
        }
    };

    const handleDeleteGuest = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/guests/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setGuests(guests.filter((guest) => guest.id !== id));
        } catch (error) {
            console.error(error);
            setError('Failed to delete guest');
        }
    };

    return (
        <div className='flex-1 overflow-auto relative z-10'>
            <Header title={t('Guests')} />

            <div className='flex-1 max-w-7xl mx-auto py-4 px-4 lg:px-8'>
                {error && <div className="text-red-500 mb-4">{error}</div>}
                {loading && <div className="text-gray-300 mb-4">Loading...</div>}

                <div className="flex items-center mb-4">
                    <input
                        type="text"
                        placeholder={t('Search')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 mr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={filterBy}
                        onChange={(e) => setFilterBy(e.target.value)}
                        className="bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">{t('AllFields')}</option>
                        <option value="first_name">{t('FirstName')}</option>
                        <option value="last_name">{t('LastName')}</option>
                        <option value="email">{t('Email')}</option>
                        <option value="phone_number">{t('PhoneNumber')}</option>
                    </select>

                    <button onClick={() => setEditingGuest({ id: null })} className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg">
                        {t('AddGuest')}
                    </button>
                </div>

                <div className="mb-4">
                    {(editingGuest || newGuest) && (
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h2 className="text-xl text-white mb-4">{editingGuest ? t('EditGuest') : t('AddGuest')}</h2>
                            <input
                                type="text"
                                name="first_name"
                                value={editingGuest?.first_name || newGuest.first_name}
                                onChange={handleInputChange}
                                placeholder={t('FirstName')}
                                className="bg-gray-600 text-white p-2 mb-2 w-full rounded-lg"
                            />
                            <input
                                type="text"
                                name="last_name"
                                value={editingGuest?.last_name || newGuest.last_name}
                                onChange={handleInputChange}
                                placeholder={t('LastName')}
                                className="bg-gray-600 text-white p-2 mb-2 w-full rounded-lg"
                            />
                            <input
                                type="email"
                                name="email"
                                value={editingGuest?.email || newGuest.email}
                                onChange={handleInputChange}
                                placeholder={t('Email')}
                                className="bg-gray-600 text-white p-2 mb-2 w-full rounded-lg"
                            />
                            <input
                                type="text"
                                name="phone_number"
                                value={editingGuest?.phone_number || newGuest.phone_number}
                                onChange={handleInputChange}
                                placeholder={t('PhoneNumber')}
                                className="bg-gray-600 text-white p-2 mb-2 w-full rounded-lg"
                            />
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={editingGuest ? handleEditGuest : handleAddGuest}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                                >
                                    {editingGuest ? t('SaveChanges') : t('AddGuest')}
                                </button>
                                <button
                                    onClick={() => setEditingGuest(null)}
                                    className="bg-gray-600 text-white px-4 py-2 rounded-lg"
                                >
                                    {t('Cancel')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {!loading && filteredGuests.length > 0 && (
                    <div className="overflow-x-auto" style={{ direction: 'ltr' }}>
                        <table className="min-w-full bg-gray-800 text-gray-100 rounded-lg">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        {t('FirstName')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        {t('LastName')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        {t('Email')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        {t('PhoneNumber')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        {t('Actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {filteredGuests.map((guest) => (
                                    <tr key={guest.id} className="hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{guest.first_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{guest.last_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{guest.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{guest.phone_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            <button
                                                onClick={() => setEditingGuest(guest)}
                                                className="text-blue-500 mr-2"
                                            >
                                                {t('Edit')}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteGuest(guest.id)}
                                                className="text-red-500"
                                            >
                                                {t('Delete')}
                                            </button>
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
