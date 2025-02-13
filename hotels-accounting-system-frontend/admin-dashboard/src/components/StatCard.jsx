import React from 'react'
import { motion } from 'framer-motion'

function StatCard({ name, value, color, icon: Icon ,onButtonClick, buttonLabel}) {
    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg overflow-hidden rounded-xl border border-gray-700'
            whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
            <div className='px-4  flex flex-col max-h-60'>
                <div>

                <span className='flex items-center text-sm font-medium   h-10 '>
                    <Icon
                        className="mr-2"
                        size={20}
                        style={{ color }} />
                    {name}
                </span>
                <p className='mt-1 text-3xl font-semibold text-gray-100 h-20'>{value}</p>
                </div>
                {/* <div className='flex  flex-col h-full  '> */}
                    
                {onButtonClick && (
                <button
                    onClick={onButtonClick}
                    className="self-end bg-blue-500 text-white p-2 rounded-md w-full m-2 "
                >
                    {buttonLabel}
                </button>
            )}
                {/* </div> */}
            </div>
        </motion.div>
    )
}

export default StatCard