import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AddUserForm from './AddUserForm';
import { motion } from 'framer-motion';
import { Edit } from 'lucide-react';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [editUser, setEditUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
            const response = await axios.get('http://127.0.0.1:8000/api/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    };

    const handleUserAdded = (newUser, isEdit = false) => {
        if (isEdit) {
            // Update the existing user in the users array
            setUsers((prevUsers) =>
                prevUsers.map((user) => (user.id === newUser.id ? newUser : user))
            );
        } else {
            // Add the new user to the users array
            setUsers((prevUsers) => [...prevUsers, newUser]);
        }
        setEditUser(null); // Reset the edit state
    };

    const handleEdit = (user) => {
        setEditUser(user);
    };

    return (
        <div className="container mx-auto p-6">
            <AddUserForm onUserAdded={handleUserAdded} editUser={editUser} />
            <div className="flex flex-wrap">
                {users.map((user) => (
                    <motion.div
                        key={user.id}
                        className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg overflow-hidden rounded-xl border border-gray-700 max-w-xs m-10 flex flex-col '
                        whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}
                    >
                        <div className='p-4 h-32'>
                            <h2 className='text-lg font-medium text-gray-100'>User Information</h2>
                            <p className='text-sm text-gray-400'>Name: {user.name}</p>
                            <p className='text-sm text-gray-400'>Email: {user.email}</p>
                            <p className='text-sm text-gray-400'>Role: {user.role}</p>
                        </div>
                        <button onClick={() => handleEdit(user)} className='text-indigo-400 hover:text-indigo-300 mr-4 self-end mb-4 '>
                            <Edit size={18} />
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default UserManagement;
