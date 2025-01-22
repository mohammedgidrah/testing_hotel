import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AddUserForm({ onUserAdded, editUser }) {
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (editUser) {
            setName(editUser.name);
            setEmail(editUser.email);
            setRole(editUser.role);
            setShowForm(true); // Show the form if editing
        }
    }, [editUser]);

    const toggleForm = () => {
        setShowForm(!showForm);
        resetForm();
    };

    const resetForm = () => {
        setName('');
        setEmail('');
        setPassword('');
        setRole('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        try {
            let response;
            if (editUser) {
                // Update existing user
                response = await axios.put(`http://127.0.0.1:8000/api/users/${editUser.id}`, {
                    name,
                    email,
                    role,
                    ...(password && { password }), // Include password if non-empty
                });
                setSuccessMessage('User updated successfully!');
                onUserAdded(response.data, true); // Call with isEdit=true
            } else {
                // Add new user
                response = await axios.post('http://127.0.0.1:8000/api/users', {
                    name,
                    email,
                    password,
                    role
                });
                setSuccessMessage('User added successfully!');
                onUserAdded(response.data, false); // Call with isEdit=false
            }
            resetForm();

        } catch (error) {
            setErrorMessage('Failed to add/update user.');
            console.error('Error:', error);
        }
    };

    return (
        <>
            <div className="flex justify-end items-center mt-4 mr-4 ml-4">
                <button
                    onClick={toggleForm}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                    {showForm ? 'Hide Form' : editUser ? 'Edit User' : 'Add User'}
                </button>
            </div>
            {showForm && (
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-4 mr-4 ml-4 mx-auto">
                    {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
                    {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-300 mb-2">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2 bg-gray-700 text-white rounded"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-300 mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 bg-gray-700 text-white rounded"
                                required
                            />
                        </div>
                        {!editUser && (
                            <div className="mb-4">
                                <label className="block text-gray-300 mb-2">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-2 bg-gray-700 text-white rounded"
                                    required
                                />
                            </div>
                        )}
                        <div className="mb-4">
                            <label className="block text-gray-300 mb-2">Role</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full p-2 bg-gray-700 text-white rounded"
                                required
                            >
                                <option value="" disabled>Select a Role</option>
                                <option value="admin">Admin</option>
                                <option value="accountant">Accountant</option>
                                <option value="manager">Manager</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg mt-4 transition duration-200"
                        >
                            {editUser ? 'Update User' : 'Add User'}
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}

export default AddUserForm;
