import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useTranslation } from "react-i18next";
import axios from "axios";
import StatCard from "../components/StatCard";
import { Zap, Users, User, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import Bookingmodel from "../components/Booking.jsx";

export default function Reception() {
  const { t } = useTranslation("reception");
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    occupied: 0,
    maintenance: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingData, setBookingData] = useState({
    checkInDate: "",
    checkOutDate: "",
    guestId: "",  // Store guest ID instead of guest name
    phoneNumber: "",
    email: "",
    address: "",
    paymenttype: "",
  });

  useEffect(() => {
    fetchRooms();
    fetchGuests(); // Fetch guests when the component loads
  }, []);

  const fetchGuests = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/guests", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setGuests(response.data);
    } catch (error) {
      console.error("Failed to fetch guests:", error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/rooms", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRooms(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    }
  };

  const calculateStats = (roomsData) => {
    const total = roomsData.length;
    const available = roomsData.filter((room) => room.status === "available")
      .length;
    const occupied = roomsData.filter((room) => room.status === "occupied")
      .length;
    const maintenance = roomsData.filter((room) => room.status === "maintenance")
      .length;
    setStats({ total, available, occupied, maintenance });
  };

  const openModal = (room) => {
    setSelectedRoom(room); // Store the room details
    setIsModalOpen(true); // Open the modal
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedRoom(null); // Reset the selected room
    setBookingData({
      checkInDate: "",
      checkOutDate: "",
      guestId: "",  // Reset guest ID
      phoneNumber: "",
      email: "",
      address: "",
      paymenttype: "",
    });
  };

  const handleBooking = async () => {
    // Calculate the total amount
    const checkIn = new Date(bookingData.checkInDate);
    const checkOut = new Date(bookingData.checkOutDate);
    const totalAmount =
      (selectedRoom.price * (checkOut - checkIn)) / (1000 * 60 * 60 * 24); // Calculate total amount based on days

    // Prepare the data to send for booking
    const bookingDataToSend = {
      guest_id: bookingData.guestId, // Use guestId instead of guestName
      room_id: selectedRoom.id,
      check_in_date: bookingData.checkInDate,
      check_out_date: bookingData.checkOutDate,
      email: bookingData.email,
      address: bookingData.address,
      phone_number: bookingData.phoneNumber, // Ensure consistency
      totalAmount: totalAmount, // Use the pre-calculated value
    };

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/book-room",
        bookingDataToSend,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update the room list and stats after successful booking
      const updatedRooms = rooms.map((room) =>
        room.id === selectedRoom.id ? { ...room, status: "occupied" } : room
      );
      setRooms(updatedRooms);
      calculateStats(updatedRooms); // Recalculate stats based on updated room status

      // Close the modal and reset the booking form
      closeModal();
      console.log("Room booked successfully:", response.data);
    } catch (error) {
      console.error("Error booking the room:", error);
    }
  };

  return (
    <div className="flex-1 overflow-auto relative z-10">
      <Header title={t("reception")} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4">
        <StatCard
          name={t("TotalRooms")}
          value={stats.total}
          icon={Users}
          color="#6366f1"
        />
        <StatCard
          name={t("AvailableRooms")}
          value={stats.available}
          icon={User}
          color="#34d399"
        />
        <StatCard
          name={t("OccupiedRooms")}
          value={stats.occupied}
          icon={Zap}
          color="red"
        />
        <StatCard
          name={t("MaintenanceRooms")}
          value={stats.maintenance}
          icon={Wrench}
          color="orange"
        />
      </div>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4 p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {rooms.map((room) => (
          <StatCard
            key={room.id}
            name={t("room") + " " + room.room_number}
            value={t(room.status)}
            icon={
              room.status === "available"
                ? User
                : room.status === "occupied"
                ? Zap
                : Wrench
            }
            color={
              room.status === "available"
                ? "#34d399"
                : room.status === "occupied"
                ? "red"
                : "orange"
            }
            // Show "Book Now" button only if room is available
            onButtonClick={
              room.status === "available" ? () => openModal(room) : null
            }
            buttonLabel={room.status === "available" ? t("BookNow") : ""}
          />
        ))}
      </motion.div>
      {/* Modal */}
      <Bookingmodel
        show={isModalOpen}
        handleClose={closeModal}
        room={selectedRoom} // This should be the room you're booking
        guests={guests} // This should be the list of guests for selection
        handleBooking={handleBooking} // Function to handle the booking
        bookingData={bookingData} // Pass bookingData to Bookingmodel
        setBookingData={setBookingData} // Function to update bookingData
      />
    </div>
  );
}
