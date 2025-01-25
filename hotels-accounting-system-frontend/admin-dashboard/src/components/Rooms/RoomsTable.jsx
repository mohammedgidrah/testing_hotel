import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

function RoomsTable({ rooms, onEdit, onDelete, refreshRooms }) {
    const { t } = useTranslation("rooms");
    const handleStatusChange = async (roomId, newStatus) => {
        try {
            await axios.put(`http://127.0.0.1:8000/api/rooms/${roomId}`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            refreshRooms(); 
        } catch (error) {
            console.error("Failed to update room status:", error);
        }
    };

    return (
        <div className='m-10 border border-gray-700 rounded-md bg-gray-800' style={{direction:"ltr"}}>
            <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-700'>
                    <thead>
                        <tr>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>{t("RoomNumber")}</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>{t("RoomType")}</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>{t("PricePerNight")}</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>{t("RoomStatus")}</th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>{t("Actions")}</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-700'>
                        {rooms.map(room => (
                            <tr key={room.id}>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>{room.room_number}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>{room.type}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>{room.price_per_night}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    <select
                                        value={room.status}
                                        onChange={(e) => handleStatusChange(room.id, e.target.value)}
                                        className="bg-gray-700 text-white rounded"
                                    >
                                        <option value="available">{t("Available")}</option>
                                        <option value="occupied">{t("Occupied")}</option>
                                        <option value="maintenance">{t("Maintenance")}</option>
                                    </select>
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100'>
                                    <button onClick={() => onEdit(room)} className='text-indigo-400 hover:text-indigo-300 mr-4'>
                                        <Edit size={18} />
                                    </button>
                                    <button onClick={() => onDelete(room.id)} className='text-red-400 hover:text-red-300'>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default RoomsTable;
