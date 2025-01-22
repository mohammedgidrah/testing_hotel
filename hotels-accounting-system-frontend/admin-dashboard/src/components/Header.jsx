import { div } from 'framer-motion/client'
import React from 'react'


function Header({ title }) {
    return (
        <>
            <header className='flex items-center justify-center bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg border-b border-gray-700'>
                <div className='flex-1 max-w-7xl mx-auto py-4 px-4 lg:px-8'>
                    <h1 className='text-2xl font-semibold text-gray-100'>{title}</h1>
                </div>
                <button className='text-white p-4 rounded-lg border border-gray-600 m-4 hover:bg-gray-800 bg-gray-700' onClick={() => {
                    localStorage.removeItem('token');
                    window.location.reload();
                }}>Logout</button>
            </header >
        </>


    )
}

export default Header