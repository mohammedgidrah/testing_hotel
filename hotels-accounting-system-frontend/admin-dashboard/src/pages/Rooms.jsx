import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import RoomsTable from "../components/Rooms/RoomsTable";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";

function Rooms() {
  const { t } = useTranslation("rooms");
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState(null);
  const [roomNumber, setRoomNumber] = useState("");
  const [roomType, setRoomType] = useState("single"); // Default to 'single'
  const [roomPrice, setRoomPrice] = useState("");
  const [roomStatus, setRoomStatus] = useState("available"); // Default status
  // Modal for delete confirmation
  const [showModal, setShowModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null); // Changed to store room to delete

  // Fetch rooms from API
  const fetchRooms = async () => {
    try {
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${localStorage.getItem("token")}`;
      const response = await axios.get("http://127.0.0.1:8000/api/rooms");
      setRooms(response.data);
    } catch (error) {
      setError("Failed to load rooms");
      console.error(error);
    }
  };

  // Fetch rooms when the component mounts
  useEffect(() => {
    fetchRooms();
  }, []);

  // Toggle form visibility and reset form fields
  const toggleForm = () => {
    setShowForm(!showForm);
    setEditRoom(null);
    setRoomNumber("");
    setRoomType("single");
    setRoomPrice("");
    setRoomStatus("available");
  };

  // Add room handler
  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/api/rooms", {
        room_number: roomNumber,
        type: roomType,
        price_per_night: roomPrice,
        status: roomStatus,
      });
      setSuccessMessage("Room added successfully!"); // Set success message
      toggleForm();
      fetchRooms(); // Refresh room list
    } catch (error) {
      setError("Failed to add room");
      console.error(error);
    }
  };

  // Update room handler
  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    if (!editRoom) return;
    try {
      await axios.put(`http://127.0.0.1:8000/api/rooms/${editRoom.id}`, {
        room_number: roomNumber,
        type: roomType,
        price_per_night: roomPrice,
        status: roomStatus,
      });
      setSuccessMessage("Room updated successfully!"); // Set success message
      toggleForm();
      fetchRooms(); // Refresh room list
    } catch (error) {
      setError("Failed to update room");
      console.error(error);
    }
  };

  // Edit room handler
  const handleEdit = (room) => {
    setEditRoom(room);
    setRoomNumber(room.room_number);
    setRoomType(room.type);
    setRoomPrice(room.price_per_night);
    setRoomStatus(room.status);
    setShowForm(true);
  };

  // Delete room handler
  const handleDelete = async () => {
    if (roomToDelete) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/rooms/${roomToDelete}`);
        fetchRooms();
        setSuccessMessage("Room deleted successfully"); // Set success message
        setShowModal(false); // Close modal after deletion
      } catch (error) {
        setError("Failed to delete room");
        console.error(error);
      }
    }
  };

  // Open delete modal
  const openDeleteModal = (roomId) => {
    setRoomToDelete(roomId);
    setShowModal(true);
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title={t("Rooms")} />
      <div className="flex justify-end items-center mt-4 mr-4 ml-4">
        <button
          onClick={toggleForm}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          {showForm ? t("HideForm")  : editRoom ? t("UpdateRoom") : t("AddRoom")}
        </button>
      </div>

      {/* Room Form */}
      {successMessage && (
        <p className="text-green-500 mb-4">{successMessage}</p>
      )}
      {showForm && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-4 mr-4 ml-4 mx-auto" >
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={editRoom ? handleUpdateRoom : handleAddRoom}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">{t("RoomNumber")}</label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">{t("RoomType")}</label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded"
                required
              >
                <option value="single">{t("Single")}</option>
                <option value="double">{t("Double")}</option>
                <option value="triple">{t("Triple")}</option>
                <option value="suite 4 bed">{t("Suite4Bed")}</option>
                <option value="suite 5 bed">{t("Suite5Bed")}</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">
                {t("PricePerNight")}
              </label>
              <input
                type="number"
                value={roomPrice}
                onChange={(e) => setRoomPrice(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">{t("RoomStatus")}</label>
              <select
                value={roomStatus}
                onChange={(e) => setRoomStatus(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded"
                required
              >
                <option value="available">{t("Available")}</option>
                <option value="occupied">{t("Occupied")}</option>
                <option value="maintenance">{t("Maintenance")}</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg mt-4 transition duration-200"
            >
              {editRoom ? t("UpdateRoom") : t("AddRoom")}
            </button>
          </form>
        </div>
      )}

      {/* Bootstrap Modal for deletion confirmation */}
 
      {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style={{direction: "ltr"}}>
                    <div className="bg-gray-800 p-6 rounded-lg w-96">
                        <h3 className="text-xl text-white mb-4">{t("DeleteConfirmation")}</h3>
                        <div className="flex justify-end space-x-4">
                            <button 
                                onClick={() => setShowModal(false)} 
                                className="bg-gray-600 text-white px-4 py-2 rounded"
                            >
                                {t("cancel")}
                            </button>
                            <button 
                                onClick={handleDelete} 
                                className="bg-red-600 text-white px-4 py-2 rounded"
                            >
                                {t("delete")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

      {/* Rooms Table */}
      <RoomsTable
        rooms={rooms}
        onEdit={handleEdit}
        onDelete={openDeleteModal} // Pass openDeleteModal function
        refreshRooms={fetchRooms}
      />
    </div>
  );
}

export default Rooms;
