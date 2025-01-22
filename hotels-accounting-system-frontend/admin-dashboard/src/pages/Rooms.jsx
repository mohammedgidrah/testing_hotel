import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import RoomsTable from "../components/Rooms/RoomsTable";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";

function Rooms() {
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
      <Header title="Rooms" />
      <div className="flex justify-end items-center mt-4 mr-4 ml-4">
        <button
          onClick={toggleForm}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          {showForm ? "Hide Form" : editRoom ? "Edit Room" : "Add Room"}
        </button>
      </div>

      {/* Room Form */}
      {successMessage && (
        <p className="text-green-500 mb-4">{successMessage}</p>
      )}
      {showForm && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-4 mr-4 ml-4 mx-auto">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={editRoom ? handleUpdateRoom : handleAddRoom}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Room Number</label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Room Type</label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded"
                required
              >
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="suite">Suite</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">
                Room Price Per Night
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
              <label className="block text-gray-300 mb-2">Room Status</label>
              <select
                value={roomStatus}
                onChange={(e) => setRoomStatus(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded"
                required
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg mt-4 transition duration-200"
            >
              {editRoom ? "Update Room" : "Add Room"}
            </button>
          </form>
        </div>
      )}

      {/* Bootstrap Modal for deletion confirmation */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Room</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this room?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

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
