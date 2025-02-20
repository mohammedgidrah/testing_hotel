import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";
import { motion } from "framer-motion";
import React from 'react';
import { useTranslation } from 'react-i18next';

const countRoomsByType = (bookings, t) => {
    const roomCount = {};
    bookings.forEach((booking) => {
        const roomType = booking.room.type;
        if (roomCount[roomType]) {
            roomCount[roomType]++;
        } else {
            roomCount[roomType] = 1;
        }
    });

    // Return translated room types
    return Object.keys(roomCount).map(type => ({
        type: t(type), // Translate room type
        count: roomCount[type]
    }));
};

function BookingChart({ bookings }) {
    const { t, i18n } = useTranslation("dashboard");
    const chartData = countRoomsByType(bookings, t);
    const isArabic = i18n.language === "ar";

    return (
        <motion.div
            className={`bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 ${isArabic ? "text-right" : "text-left"}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <h2 className='text-lg font-medium mb-4 text-gray-100'>{t('RoomsBookedbyType')}</h2>

            <div className='h-80 min'>
                <ResponsiveContainer width={"100%"} height={"100%"}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray='3 3' stroke='#4B5563' />
                        <XAxis dataKey={"type"} stroke='#9ca3af' style={{ fontSize: "12px" }} />
                        <YAxis stroke='#9ca3af' tickMargin={20} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(31, 41, 55, 0.8)",
                                borderColor: "#4B5563",
                            }}
                            itemStyle={{ color: "#E5E7EB" }}
                        />
                        <Bar
                            dataKey='count'
                            fill='#6366F1'
                            barSize={30}
                            radius={[5, 5, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}

export default BookingChart;
